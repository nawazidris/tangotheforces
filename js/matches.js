document.addEventListener('DOMContentLoaded', () => {
    initializeMatches();
    setupFilters();
    setupBackToTop();
    PlayerService.getPlayers(); // Pre-fetch player data for nickname lookups
});

let allMatches = [];
let currentFilter = 'all';
let currentSearchTerm = '';
let currentPage = 1;
const pageSize = 6;

async function initializeMatches() {
    const container = document.getElementById('matchesContainer');
    if (!container) return;

    try {
        container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading matches…</p>
            </div>`;

        if (window.db) {
            try {
                const mSnap = await window.db.collection('matches').get();
                if (!mSnap.empty) {
                    allMatches = mSnap.docs.map(doc => doc.data());
                }
            } catch (e) {
                console.error("Firebase fetch failed, falling back to JSON.", e);
                allMatches = await fetchMatchesFromJSON();
            }
        } else {
            allMatches = await fetchMatchesFromJSON();
        }

        // Sort all matches by date initially
        allMatches.sort((a, b) => new Date(a.date) - new Date(b.date));

        renderMatches(currentFilter);
        updateQuickStats(allMatches);

    } catch (error) {
        console.error("Failed to initialize matches:", error);
        container.innerHTML = `
            <div class="error-state">
                <h3>We couldn't load the latest matches</h3>
                <p>Please try again in a moment.</p>
            </div>`;
    }
}

async function fetchMatchesFromJSON() {
    const response = await fetch('data/matches.json');
    if (!response.ok) {
        throw new Error('Failed to fetch matches.json');
    }
    return await response.json();
}

function renderMatches(filter) {
    currentFilter = filter;
    const container = document.getElementById('matchesContainer');
    const pagination = document.getElementById('matchesPagination');
    container.innerHTML = '';

    let filteredMatches = allMatches;
    if (filter === 'upcoming') {
        filteredMatches = allMatches.filter(m => m.status === 'upcoming');
    } else if (filter === 'completed') {
        filteredMatches = allMatches.filter(m => m.status === 'completed');
    }

    const searchTerm = currentSearchTerm.trim().toLowerCase();
    if (searchTerm) {
        filteredMatches = filteredMatches.filter(match => {
            const haystack = `${match.homeTeam || ''} ${match.awayTeam || ''} ${match.venue || ''}`.toLowerCase();
            return haystack.includes(searchTerm);
        });
    }

    if (filteredMatches.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No matches found</h3>
                <p>Try a different filter or search term.</p>
            </div>`;
        pagination.innerHTML = '';
        return;
    }

    const totalPages = Math.max(1, Math.ceil(filteredMatches.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * pageSize;
    const pagedMatches = filteredMatches.slice(start, start + pageSize);

    const groupedByMonth = pagedMatches.reduce((acc, match) => {
        const month = new Date(match.date).toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!acc[month]) {
            acc[month] = [];
        }
        acc[month].push(match);
        return acc;
    }, {});

    for (const month in groupedByMonth) {
        const monthGroup = document.createElement('div');
        monthGroup.className = 'month-group';

        const monthHeader = document.createElement('h3');
        monthHeader.className = 'month-header';
        monthHeader.textContent = month;
        monthGroup.appendChild(monthHeader);

        groupedByMonth[month].forEach(match => {
            monthGroup.appendChild(createMatchCard(match));
        });

        container.appendChild(monthGroup);
    }

    renderPagination(pagination, totalPages);
}

function createMatchCard(match) {
    const card = document.createElement('div');
    
    const isCompleted = match.status === 'completed';

    // Determine result relative to Tango
    const tangoHome = (match.homeTeam || '').toLowerCase().includes('tango');
    const tangoAway = (match.awayTeam || '').toLowerCase().includes('tango');
    const diff = (match.homeScore || 0) - (match.awayScore || 0);

    let result = null; // 'win' | 'draw' | 'lose' | null
    if (isCompleted) {
        if (diff === 0) result = 'draw';
        else if (tangoHome && diff > 0) result = 'win';
        else if (tangoAway && diff < 0) result = 'win';
        else result = 'loss';
    }

    // Build card class list
    card.className = 'card';

    // --- Card Header ---
    const dateStr = new Date(match.date).toLocaleDateString('en-GB', {
        weekday: 'short', day: 'numeric', month: 'short'
    });

    let headHtml = '';
    if (isCompleted) {
        const competitionIcon = (match.competition || '').toLowerCase() === 'league' ? '<i class="fa-solid fa-trophy"></i>' : '<i class="fa-solid fa-shield-halved"></i>';
        const resultText = result === 'win' ? 'Win' : result === 'draw' ? 'Draw' : 'Loss';
        headHtml = `
            <div class="head">
                <div class="head-left">
                    <span class="meta-item">${competitionIcon} ${match.competition || 'Friendly'}</span>
                    <span class="meta-item">·</span>
                    <span class="dot ${result}"></span>
                    <span class="status-text ${result}">${resultText}</span>
                </div>
                <span class="meta">
                    ${dateStr} · <i class="fa-solid fa-location-dot"></i> ${match.venue || 'TBA'}
                </span>
            </div>
        `;
    } else {
        const competitionIcon = (match.competition || '').toLowerCase() === 'league' ? '<i class="fa-solid fa-trophy"></i>' : '<i class="fa-solid fa-shield-halved"></i>';
        headHtml = `
            <div class="head">
                <div class="head-left">
                    <span class="meta-item">${competitionIcon} ${match.competition || 'Friendly'}</span>
                    <span class="meta-item">·</span>
                    <span class="dot live"></span>
                    <span class="status-text live">Kickoff ${match.time || 'TBA'}</span>
                </div>
                <span class="meta">${dateStr} · ${match.venue || 'TBA'}</span>
            </div>
        `;
    }

    // --- Card Body ---
    const homeTag = tangoHome ? 'Home' : (tangoAway ? 'Away' : 'Home');
    const awayTag = tangoAway ? 'Home' : (tangoHome ? 'Away' : 'Away');

    const scoreBlock = isCompleted
        ? `<div class="score-block"><span>${match.homeScore ?? 0}</span><span class="sep">:</span><span>${match.awayScore ?? 0}</span></div>`
        : `<div class="score-block tbd">Upcoming</div>`;

    let eventsHtml = '';
    if (match.events && match.events.length > 0) {
        const renderEvent = e => {
            const playerName = PlayerService.getNickname(e.player);
            const assistName = e.assist ? PlayerService.getNickname(e.assist) : '';
            const min = e.minute ? `${e.minute}'` : '';
            const player = playerName || '';
            const assist = assistName ? ` <span class="assist">🅰️ ${assistName}</span>` : '';
            let markHtml = '';

            if (e.type === 'goal') {
                markHtml = `<span class="mark">⚽</span>`;
            } else if (e.type === 'yellow_card') {
                markHtml = `<span class="mark card"></span>`;
            } else if (e.type === 'red_card') {
                markHtml = `<span class="mark card red"></span>`;
            }
            
            const eventClass = e.type.includes('card') ? 'event is-card' : 'event';
            
            return `
                <div class="${eventClass}">
                    <span class="min">${min}</span>
                    ${markHtml}
                    <span class="name">${player}${assist}</span>
                </div>
            `;
        };
        eventsHtml = `<div class="events">${match.events.map(renderEvent).join('')}</div>`;
    } else if (isCompleted) {
        eventsHtml = ''; // Leave empty if no events are logged for a completed match
    }

    const bodyHtml = `
        <div class="body">
            <div class="matchup">
                <div class="club">
                    <span class="club-name">${match.homeTeam}</span>
                    <span class="club-tag">${homeTag}</span>
                </div>
                ${scoreBlock}
                <div class="club away">
                    <span class="club-name">${match.awayTeam}</span>
                    <span class="club-tag">${awayTag}</span>
                </div>
            </div>
            ${isCompleted ? '<div class="divider"></div>' : ''}
            ${eventsHtml}
        </div>
    `;

    card.innerHTML = headHtml + bodyHtml;
    return card;
}

function setupFilters() {
    document.querySelectorAll('.filter-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPage = 1;
            renderMatches(btn.dataset.filter);
        });
    });

    const searchInput = document.getElementById('matchSearch');
    if (searchInput) {
        const debouncedSearch = window.tangoUtils?.debounce((value) => {
            currentSearchTerm = value;
            currentPage = 1;
            renderMatches(currentFilter);
        }, 140);

        searchInput.addEventListener('input', (event) => debouncedSearch(event.target.value));
    }

    document.getElementById('refreshMatches')?.addEventListener('click', initializeMatches);
}

function renderPagination(container, totalPages) {
    if (!container) return;
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    const buttons = [];
    for (let page = 1; page <= totalPages; page += 1) {
        buttons.push(`<button class="page-btn${page === currentPage ? ' active' : ''}" data-page="${page}">${page}</button>`);
    }

    container.innerHTML = buttons.join('');
    container.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = Number(btn.dataset.page);
            renderMatches(currentFilter);
            document.getElementById('matchesContainer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function setupBackToTop() {
    const button = document.createElement('button');
    button.className = 'back-to-top';
    button.type = 'button';
    button.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    button.setAttribute('aria-label', 'Back to top');
    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.appendChild(button);

    const toggleButton = () => {
        button.classList.toggle('show', window.scrollY > 320);
    };

    window.addEventListener('scroll', toggleButton, { passive: true });
    toggleButton();
}

function updateQuickStats(matches) {
    const completed = matches.filter(m => m.status === 'completed');
    let wins = 0, draws = 0, losses = 0, gf = 0;

    const getResultClass = (match) => {
        const tangoHome = (match.homeTeam || '').toLowerCase().includes('tango');
        const tangoAway = (match.awayTeam || '').toLowerCase().includes('tango');
        const diff = (match.homeScore || 0) - (match.awayScore || 0);

        if (tangoHome) {
            if (diff > 0) return 'win';
            if (diff === 0) return 'draw';
            return 'lose';
        }
        if (tangoAway) {
            if (diff < 0) return 'win';
            if (diff === 0) return 'draw';
            return 'lose';
        }
        return 'other';
    };

    completed.forEach(m => {
        const result = getResultClass(m);
        if (result === 'win') wins++;
        else if (result === 'draw') draws++;
        else if (result === 'lose') losses++;

        const tangoHome = (m.homeTeam || '').toLowerCase().includes('tango');
        if (tangoHome) gf += Number(m.homeScore || 0);
        else gf += Number(m.awayScore || 0);
    });

    const upcoming = matches.filter(m => m.status !== 'completed').length;

    document.getElementById('qs-played').textContent = completed.length;
    document.getElementById('qs-wins').textContent = wins;
    document.getElementById('qs-draws').textContent = draws;
    document.getElementById('qs-losses').textContent = losses;
    document.getElementById('qs-gf').textContent = gf;
    document.getElementById('qs-upcoming').textContent = upcoming;
}

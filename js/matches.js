document.addEventListener('DOMContentLoaded', () => {
    initializeMatches();
    setupFilters();
});

let allMatches = [];

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

        renderMatches('all');
        updateQuickStats(allMatches);

    } catch (error) {
        console.error("Failed to initialize matches:", error);
        container.innerHTML = `<p>Error loading matches. Please try again later.</p>`;
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
    const container = document.getElementById('matchesContainer');
    container.innerHTML = '';

    let filteredMatches = allMatches;
    if (filter === 'upcoming') {
        filteredMatches = allMatches.filter(m => m.status === 'upcoming');
    } else if (filter === 'completed') {
        filteredMatches = allMatches.filter(m => m.status === 'completed');
    }

    if (filteredMatches.length === 0) {
        container.innerHTML = `<p style="text-align:center; color: var(--muted);">No matches found for this filter.</p>`;
        return;
    }

    // Group matches by month
    const groupedByMonth = filteredMatches.reduce((acc, match) => {
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
        if (tangoHome) {
            result = diff > 0 ? 'win' : diff === 0 ? 'draw' : 'lose';
        } else if (tangoAway) {
            result = diff < 0 ? 'win' : diff === 0 ? 'draw' : 'lose';
        }
    }

    // Build card class list
    const statusClass = isCompleted ? 'status-completed' : 'status-upcoming';
    const resultClass = result ? `result-${result}` : '';
    card.className = ['match-card', statusClass, resultClass].filter(Boolean).join(' ');

    // Badge in header
    let badgeClass, badgeText;
    if (isCompleted) {
        badgeClass = result ? `badge-${result}` : 'badge-draw';
        badgeText  = result === 'win' ? 'WIN' : result === 'draw' ? 'DRAW' : 'LOSS';
    } else {
        badgeClass = 'badge-upcoming';
        // Format time as HH:MM if available, else 'Upcoming'
        if (match.time) {
            badgeText = match.time;
        } else {
            badgeText = 'Upcoming';
        }
    }

    // Date formatted as e.g. "Sat, 28 Jun"
    const dateStr = new Date(match.date).toLocaleDateString('en-GB', {
        weekday: 'short', day: 'numeric', month: 'short'
    });

    // Score / VS block
    const scoreContent = isCompleted
        ? `<div class="card-score">${match.homeScore ?? 0} – ${match.awayScore ?? 0}</div>`
        : `<div class="card-vs">VS</div>`;

    // Events columns
    let eventsHtml = '';
    if (match.events && match.events.length > 0) {
        const homeEvents = match.events.filter(e => e.team === 'home' ||
            (tangoHome && e.team !== 'away') ||
            (!tangoHome && !tangoAway && e.team === 'home'));
        const awayEvents = match.events.filter(e => e.team === 'away' ||
            (tangoAway && e.team !== 'home') ||
            (!tangoHome && !tangoAway && e.team === 'away'));

        // Fall back: split by index if no team field
        const allHaveTeam = match.events.every(e => e.team);
        const homeEvts = allHaveTeam ? homeEvents : match.events.filter((_, i) => i % 2 === 0);
        const awayEvts = allHaveTeam ? awayEvents : match.events.filter((_, i) => i % 2 !== 0);

        const renderEvent = e => {
            const icon = e.type === 'goal' ? '⚽' : e.type === 'yellowcard' ? '🟨' : e.type === 'redcard' ? '🟥' : '•';
            const min  = e.minute ? `${e.minute}'` : '';
            const assist = e.assist ? ` (${e.assist})` : '';
            return `<span>${icon} ${min} ${e.player || ''}${assist}</span>`;
        };

        eventsHtml = `
            <div class="card-events">
                <div class="events-col events-home">${homeEvts.map(renderEvent).join('')}</div>
                <div class="events-col events-away">${awayEvts.map(renderEvent).join('')}</div>
            </div>`;
    }

    card.innerHTML = `
        <div class="card-header">
            <span class="card-competition"><i class="fa-solid fa-trophy"></i> ${match.competition || 'Friendly'}</span>
            <span class="card-date-badge ${badgeClass}">${badgeText}</span>
            <span class="card-venue"><i class="fa-solid fa-location-dot"></i> ${match.venue || 'TBA'}</span>
        </div>
        <div class="card-scoreline">
            <div class="card-team home">
                <div class="card-team-name">${match.homeTeam}</div>
                <div class="card-date" style="font-size:0.7rem;color:var(--muted);margin-top:4px">${dateStr}</div>
            </div>
            <div class="card-score-block">
                ${scoreContent}
            </div>
            <div class="card-team away">
                <div class="card-team-name">${match.awayTeam}</div>
            </div>
        </div>
        ${eventsHtml}
    `;
    return card;
}

function setupFilters() {
    document.querySelectorAll('.filter-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderMatches(btn.dataset.filter);
        });
    });

    document.getElementById('refreshMatches')?.addEventListener('click', initializeMatches);
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

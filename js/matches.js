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
    card.className = 'match-card';

    const isCompleted = match.status === 'completed';
    const homeLogo = match.homeTeam.toLowerCase().includes('tango') ? 'images/tangoforces.jpg' : 'images/default-badge.png';
    const awayLogo = match.awayTeam.toLowerCase().includes('tango') ? 'images/tangoforces.jpg' : 'images/default-badge.png';

    card.innerHTML = `
        <div class="team team-home">
            <span class="team-name">${match.homeTeam}</span>
            <img src="${homeLogo}" alt="${match.homeTeam} logo" class="team-logo">
        </div>
        <div class="match-score">
            <div class="score-display">
                ${isCompleted ? `${match.homeScore} - ${match.awayScore}` : 'vs'}
            </div>
            <div class="score-status">${isCompleted ? 'Full Time' : (match.time || '')}</div>
        </div>
        <div class="team team-away">
            <img src="${awayLogo}" alt="${match.awayTeam} logo" class="team-logo">
            <span class="team-name">${match.awayTeam}</span>
        </div>
        <div class="match-details">
            <span><i class="fa-solid fa-calendar-day"></i> ${new Date(match.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}</span>
            <span><i class="fa-solid fa-location-dot"></i> ${match.venue || 'TBA'}</span>
            ${match.events && match.events.length > 0 ? `<button class="events-toggle" onclick="toggleEvents(this)">Show Events</button>` : ''}
        </div>
        ${match.events && match.events.length > 0 ? createEventsSection(match.events) : ''}
    `;
    return card;
}

function createEventsSection(events) {
    const eventsHtml = events.map(event => `
        <div class="event-item">
            <span class="event-icon">${event.type === 'goal' ? '⚽' : '🟨'}</span>
            <span>${event.minute ? `${event.minute}'` : ''}</span>
            <strong>${event.player}</strong>
            ${event.assist ? `(assist: ${event.assist})` : ''}
        </div>
    `).join('');
    return `<div class="match-events">${eventsHtml}</div>`;
}

function toggleEvents(button) {
    const eventsSection = button.closest('.match-card').querySelector('.match-events');
    if (eventsSection) {
        const isVisible = eventsSection.style.display === 'block';
        eventsSection.style.display = isVisible ? 'none' : 'block';
        button.textContent = isVisible ? 'Show Events' : 'Hide Events';
    }
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

// Make function globally accessible for inline onclick
window.toggleEvents = toggleEvents;
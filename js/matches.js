let allMatches = [];

/* ================= HELPER: PLAYER LOOKUP ================= */
function getPlayerName(id) {
    const allPlayers = JSON.parse(localStorage.getItem('allPlayers') || '[]');
    const p = allPlayers.find(x => x.id === id);
    return p ? p.name : 'Unknown';
}

function getPlayerById(id) {
    const allPlayers  = JSON.parse(localStorage.getItem('allPlayers')  || '[]');
    const adminPlayers = JSON.parse(localStorage.getItem('adminPlayers') || '[]');
    return adminPlayers.find(x => x.id === id) || allPlayers.find(x => x.id === id);
}

function getPlayerByName(playerName) {
    if (!playerName) return null;
    const normalized  = playerName.trim().toLowerCase();
    const allPlayers  = JSON.parse(localStorage.getItem('allPlayers')  || '[]');
    const adminPlayers = JSON.parse(localStorage.getItem('adminPlayers') || '[]');
    return [...adminPlayers, ...allPlayers].find(p =>
        (p.name     && p.name.trim().toLowerCase()     === normalized) ||
        (p.nickname && p.nickname.trim().toLowerCase() === normalized)
    );
}

function getPlayerDisplayName(event) {
    const playerName = event.playerId ? getPlayerName(event.playerId) : event.player || 'Unknown';
    const player     = event.playerId ? getPlayerById(event.playerId) : getPlayerByName(playerName);
    return player?.nickname || formatEventName(playerName);
}

function formatEventName(fullName) {
    if (!fullName) return 'Unknown';
    return fullName.split(' ')[0];
}

/* ================= RESULT HELPER ================= */
function getResultClass(match) {
    if (match.status !== 'completed') return 'upcoming';
    const home = Number(match.homeScore);
    const away = Number(match.awayScore);
    if (isNaN(home) || isNaN(away)) return 'upcoming';

    const tangoHome = match.homeTeam?.toLowerCase().includes('tango');
    const tangoAway = match.awayTeam?.toLowerCase().includes('tango');
    const diff = home - away;

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
    if (diff > 0) return 'win';
    if (diff === 0) return 'draw';
    return 'lose';
}

/* ================= QUICK STATS ================= */
function updateQuickStats(matches) {
    const completed = matches.filter(m => m.status === 'completed');
    let wins = 0, draws = 0, losses = 0, gf = 0;

    completed.forEach(m => {
        const r = getResultClass(m);
        if (r === 'win')  wins++;
        if (r === 'draw') draws++;
        if (r === 'lose') losses++;

        const tangoHome = m.homeTeam?.toLowerCase().includes('tango');
        const tangoAway = m.awayTeam?.toLowerCase().includes('tango');
        if (tangoHome) gf += Number(m.homeScore) || 0;
        if (tangoAway) gf += Number(m.awayScore) || 0;
    });

    const upcoming = matches.filter(m => m.status !== 'completed').length;

    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    set('qs-played',   completed.length);
    set('qs-wins',     wins);
    set('qs-draws',    draws);
    set('qs-losses',   losses);
    set('qs-gf',       gf);
    set('qs-upcoming', upcoming);
}

/* ================= RENDER EVENTS ================= */
function renderEventsText(match, teamType) {
    if (!match.events || match.events.length === 0) return '';

    const teamEvents = match.events.filter(
        e => e.team && e.team.toLowerCase() === teamType.toLowerCase()
    );
    if (teamEvents.length === 0) return '';

    return teamEvents.map(e => {
        const displayName  = getPlayerDisplayName(e);
        const assistPlayer = e.assist     ? getPlayerDisplayName({ player: e.assist })      : null;
        const playerOut    = e.player_out ? getPlayerDisplayName({ player: e.player_out }) : null;
        const playerIn     = e.player_in  ? getPlayerDisplayName({ player: e.player_in })  : null;

        let icon = '', text = '';

        switch (e.type) {
            case 'goal':
                icon = '⚽';
                text = `${displayName}${e.minute ? ` ${e.minute}'` : ''}`;
                if (e.assist) text += ` 🅰️ ${assistPlayer}`;
                break;
            case 'assist':
                icon = '🅰️';
                text = `${displayName}${e.minute ? ` ${e.minute}'` : ''}`;
                break;
            case 'yellow_card':
                icon = '🟨';
                text = `${displayName}${e.minute ? ` ${e.minute}'` : ''}`;
                break;
            case 'red_card':
                icon = '🟥';
                text = `${displayName}${e.minute ? ` ${e.minute}'` : ''}`;
                break;
            case 'substitution':
                icon = '🔁';
                text = `${playerOut} ↔ ${playerIn}`;
                break;
            default:
                return null;
        }
        return `${icon} ${text}`;
    }).filter(Boolean).join('\n');
}

/* ================= BUILD MATCH CARD ================= */
function buildMatchCard(match) {
    const isCompleted = match.status === 'completed';
    const result      = getResultClass(match);

    const matchDate = new Date(match.date).toLocaleDateString(undefined, {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    // Badge label & class
    const badgeLabels = { win: 'WIN', draw: 'DRAW', lose: 'LOSS', upcoming: matchDate };
    const badgeClass  = `badge-${result}`;
    const badgeText   = isCompleted ? badgeLabels[result] : matchDate;

    // Score display
    const scoreHTML = isCompleted
        ? `<div class="card-score">${match.homeScore}&ndash;${match.awayScore}</div>`
        : `<div class="card-vs">VS</div>`;

    // Events
    const homeEventsRaw = renderEventsText(match, 'home');
    const awayEventsRaw = renderEventsText(match, 'away');
    const hasEvents     = homeEventsRaw || awayEventsRaw;

    const eventsSection = hasEvents ? `
        <div class="card-events">
            <div class="events-col events-home">${homeEventsRaw.split('\n').map(l => `<span>${l}</span>`).join('')}</div>
            <div class="events-col events-away">${awayEventsRaw.split('\n').map(l => `<span>${l}</span>`).join('')}</div>
        </div>` : '';

    // Venue truncated to 28 chars
    const venue = match.venue ? match.venue.substring(0, 28) : 'TBA';

    const card = document.createElement('article');
    card.className = `match-card status-${isCompleted ? 'completed' : 'upcoming'} result-${result}`;

    card.innerHTML = `
        <div class="card-header">
            <span class="card-competition"><i class="fa-solid fa-trophy"></i>${match.competition || 'League'}</span>
            <span class="card-date-badge ${badgeClass}">${badgeText}</span>
            <span class="card-venue"><i class="fa-solid fa-location-dot"></i> ${venue}</span>
        </div>
        <div class="card-scoreline">
            <div class="card-team home">
                <div class="card-team-name">${match.homeTeam}</div>
            </div>
            <div class="card-score-block">
                ${scoreHTML}
            </div>
            <div class="card-team away">
                <div class="card-team-name">${match.awayTeam}</div>
            </div>
        </div>
        ${eventsSection}
    `;

    return card;
}

/* ================= DISPLAY MATCHES ================= */
function displayMatches(matches, filter = 'all') {
    const container = document.getElementById('matchesContainer');
    container.innerHTML = '';

    const filtered = filter === 'all'
        ? matches
        : matches.filter(m => m.status === filter);

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-calendar-xmark" style="font-size:2.5rem;opacity:0.4;"></i>
                <p>No matches found</p>
            </div>`;
        return;
    }

    filtered.forEach(match => container.appendChild(buildMatchCard(match)));
}

/* ================= FETCH MATCHES ================= */
async function fetchMatches() {
    const container = document.getElementById('matchesContainer');
    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading matches…</p>
        </div>`;

    try {
        const response  = await fetch('data/matches.json');
        let jsonMatches = await response.json();

        const adminMatchesData = localStorage.getItem('adminMatches');
        const adminMatches = adminMatchesData
            ? JSON.parse(adminMatchesData).map(m => ({
                ...m,
                homeScore:   m.homeScore ?? null,
                awayScore:   m.awayScore ?? null,
                competition: m.competition || 'League',
                events:      m.events || []
              }))
            : [];

        allMatches = [...jsonMatches, ...adminMatches];
        allMatches.sort((a, b) => new Date(a.date) - new Date(b.date));

    } catch {
        const adminMatchesData = localStorage.getItem('adminMatches');
        if (adminMatchesData) {
            allMatches = JSON.parse(adminMatchesData).map(m => ({
                ...m,
                homeScore:   m.homeScore ?? null,
                awayScore:   m.awayScore ?? null,
                competition: m.competition || 'League',
                events:      m.events || []
            }));
            allMatches.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:2.5rem;color:var(--red);opacity:0.7;"></i>
                    <p>Unable to load matches. Please try again.</p>
                </div>`;
            return;
        }
    }

    updateQuickStats(allMatches);

    // Show with current active filter
    const activeFilter = document.querySelector('.filter-tab.active')?.dataset.filter || 'all';
    displayMatches(allMatches, activeFilter);
}

/* ================= INIT ================= */
document.addEventListener('DOMContentLoaded', () => {
    fetchMatches();

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            displayMatches(allMatches, btn.dataset.filter);
        });
    });

    // Refresh button
    const refreshBtn = document.getElementById('refreshMatches');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', fetchMatches);
    }
});
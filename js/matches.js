document.addEventListener('DOMContentLoaded', () => {
    initializeMatches();
    setupFilters();
});

let allMatches = [];
let playersData = [];
let matchesListener = null;
let playersListener = null;

async function initializeMatches() {
    const container = document.getElementById('matchesContainer');
    if (!container) return;

    // 1. INSTANT LOAD: Load local data first so the user sees content immediately
    try {
        const [mRes, pRes] = await Promise.all([
            fetchMatchesFromJSON(),
            fetchPlayersFromJSON()
        ]);
        allMatches = mRes;
        playersData = pRes;

        allMatches.sort((a, b) => new Date(a.date) - new Date(b.date));
        renderMatches('all');
        updateQuickStats(allMatches);
    } catch (e) {
        console.warn("Initial local load failed:", e);
    }

    // 2. REAL-TIME SYNC: Listen for live updates from Firebase
    if (window.db) {
        // Unsubscribe from existing listeners if they exist
        if (matchesListener) matchesListener();
        if (playersListener) playersListener();

        console.log("[Matches] Subscribing to real-time updates...");

        matchesListener = window.db.collection('matches').onSnapshot((snapshot) => {
            if (!snapshot.empty) {
                allMatches = snapshot.docs.map(doc => doc.data());
                allMatches.sort((a, b) => new Date(a.date) - new Date(b.date));
                refreshUI();
            }
        }, (error) => console.error("[Matches] Matches sync failed:", error));

        playersListener = window.db.collection('players').onSnapshot((snapshot) => {
            if (!snapshot.empty) {
                playersData = snapshot.docs.map(doc => doc.data());
                refreshUI();
            }
        }, (error) => console.error("[Matches] Players sync failed:", error));
    }
}

function refreshUI() {
    const currentFilter = document.querySelector('.filter-tab.active')?.dataset.filter || 'all';
    renderMatches(currentFilter);
    updateQuickStats(allMatches);
}

function localFetch(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 0) {
                    try {
                        resolve({
                            ok: true,
                            json: () => Promise.resolve(JSON.parse(xhr.responseText))
                        });
                    } catch (e) {
                        reject(new Error("Parse error"));
                    }
                } else {
                    resolve({ ok: false, status: xhr.status });
                }
            }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send();
    });
}

async function fetchMatchesFromJSON() {
    const fetchFn = (window.AppConfig && window.AppConfig.fetchAsset) ? window.AppConfig.fetchAsset : localFetch;
    const response = await fetchFn('data/matches.json');
    if (!response.ok) throw new Error('Failed to fetch matches.json');
    return await response.json();
}

async function fetchPlayersFromJSON() {
    const fetchFn = (window.AppConfig && window.AppConfig.fetchAsset) ? window.AppConfig.fetchAsset : localFetch;
    const response = await fetchFn('data/players.json');
    if (!response.ok) throw new Error('Failed to fetch players.json');
    return await response.json();
}

/**
 * Returns a player's nickname if found, otherwise returns their name as-is.
 */
function getPlayerNickname(fullName) {
    if (!fullName) return '';
    const nameLower = fullName.toLowerCase().trim();
    const player = playersData.find(p =>
        (p.name && p.name.toLowerCase().trim() === nameLower) ||
        (p.nickname && p.nickname.toLowerCase().trim() === nameLower)
    );
    return player?.nickname || fullName;
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
    const diff = (parseInt(match.homeScore) || 0) - (parseInt(match.awayScore) || 0);

    let resultText = '';
    let resultClass = '';
    if (isCompleted) {
        let result = 'draw';
        if (tangoHome) {
            result = diff > 0 ? 'win' : diff === 0 ? 'draw' : 'lose';
        } else if (tangoAway) {
            result = diff < 0 ? 'win' : diff === 0 ? 'draw' : 'lose';
        }
        resultText = result.toUpperCase();
        resultClass = `badge-${result}`;
    }

    card.className = `match-card simple-match-card ${isCompleted ? 'status-completed' : 'status-upcoming'}`;

    const dateStr = match.date || 'TBA';
    const scoreText = isCompleted ? `${match.homeScore} – ${match.awayScore}` : 'VS';
    const resultBadge = isCompleted ? `<span class="m-badge ${resultClass}">${resultText}</span>` : `<span class="m-badge badge-upcoming">UPCOMING</span>`;

    // Goalscorers section
    let homeScorersHtml = '';
    let awayScorersHtml = '';
    if (isCompleted && match.events && match.events.length > 0) {
        const homeGoals = match.events.filter(e => e.type === 'goal' && (e.team === match.homeTeam || e.team === 'home'));
        const awayGoals = match.events.filter(e => e.type === 'goal' && (e.team === match.awayTeam || e.team === 'away'));

        const renderGoal = (g) => {
            const scorerNick = getPlayerNickname(g.player);
            const assisterNick = g.assist ? getPlayerNickname(g.assist) : null;

            return `
                <div class="m-event-item">
                    <i class="fa-solid fa-futbol" title="Goal"></i>
                    <span class="m-event-player">${scorerNick}</span>
                    ${assisterNick ? `
                        <span class="m-event-assist">
                            <i class="fa-solid fa-bullseye" title="Assist"></i> ${assisterNick}
                        </span>
                    ` : ''}
                    <span class="m-event-min">${g.minute}'</span>
                </div>
            `;
        };

        homeScorersHtml = homeGoals.map(renderGoal).join('');
        awayScorersHtml = awayGoals.map(renderGoal).join('');
    }

    card.innerHTML = `
        <div class="m-card-top">
            <div class="m-top-info">
                <span class="m-comp"><i class="fa-solid fa-trophy"></i> ${match.competition || 'LEAGUE'}</span>
                <span class="m-venue"><i class="fa-solid fa-location-dot"></i> ${match.venue || 'TBA'}</span>
                <span class="m-date"><i class="fa-solid fa-calendar-days"></i> ${dateStr}</span>
            </div>
            <span class="m-time-top"><i class="fa-solid fa-clock"></i> ${match.time || '15:00'}</span>
        </div>

        <div class="m-card-body">
            <div class="m-match-main">
                <div class="m-team home">
                    <span class="m-team-name">${match.homeTeam}</span>
                    <div class="m-team-scorers">${homeScorersHtml}</div>
                </div>
                <div class="m-score">${scoreText}</div>
                <div class="m-team away">
                    <span class="m-team-name">${match.awayTeam}</span>
                    <div class="m-team-scorers">${awayScorersHtml}</div>
                </div>
            </div>
        </div>

        <div class="m-card-footer">
            <div class="m-result-box">
                ${resultBadge}
            </div>
        </div>
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
    const TANGO_NAME = "tango";

    // 1. Filter for matches that involve Tango and are completed
    const tangoCompletedMatches = matches.filter(m => {
        const involvesTango = (m.homeTeam || '').toLowerCase().includes(TANGO_NAME) ||
                              (m.awayTeam || '').toLowerCase().includes(TANGO_NAME);
        return involvesTango && m.status === 'completed';
    });

    let wins = 0, draws = 0, losses = 0, goalsFor = 0;

    tangoCompletedMatches.forEach(m => {
        const homeTeam = (m.homeTeam || '').toLowerCase();
        const awayTeam = (m.awayTeam || '').toLowerCase();
        const homeScore = parseInt(m.homeScore) || 0;
        const awayScore = parseInt(m.awayScore) || 0;

        if (homeTeam.includes(TANGO_NAME)) {
            // Tango is Home
            goalsFor += homeScore;
            if (homeScore > awayScore) wins++;
            else if (homeScore === awayScore) draws++;
            else losses++;
        } else {
            // Tango is Away
            goalsFor += awayScore;
            if (awayScore > homeScore) wins++;
            else if (awayScore === homeScore) draws++;
            else losses++;
        }
    });

    const upcoming = matches.filter(m => {
        const involvesTango = (m.homeTeam || '').toLowerCase().includes(TANGO_NAME) ||
                              (m.awayTeam || '').toLowerCase().includes(TANGO_NAME);
        return involvesTango && m.status === 'upcoming';
    }).length;

    // 2. Update UI
    document.getElementById('qs-played').textContent = tangoCompletedMatches.length;
    document.getElementById('qs-wins').textContent = wins;
    document.getElementById('qs-draws').textContent = draws;
    document.getElementById('qs-losses').textContent = losses;
    document.getElementById('qs-gf').textContent = goalsFor;
    document.getElementById('qs-upcoming').textContent = upcoming;
}

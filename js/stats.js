const CLUB_NAME = 'Tango FC';
const SEASON_START = '2026-03-21';

let statsPlayers = [];
let filteredPlayers = [];
let currentPage = 1;
const rowsPerPage = 8;

const abbreviatePosition = (pos = '') => {
    const p = String(pos).toLowerCase();
    if (p.includes('forward') || p.includes('striker')) return 'FWD';
    if (p.includes('midfield')) return 'MID';
    if (p.includes('defender')) return 'DEF';
    if (p.includes('goalkeeper') || p.includes('keeper')) return 'GK';
    return pos;
};

const getPositionSortWeight = (position = '') => {
    const normalizedPosition = String(position || '').toLowerCase();

    if (normalizedPosition.includes('forward') || normalizedPosition.includes('striker') || normalizedPosition.includes('winger')) return 0;
    if (normalizedPosition.includes('mid')) return 1;
    if (normalizedPosition.includes('def')) return 2;
    if (normalizedPosition.includes('keeper') || normalizedPosition.includes('goal')) return 3;

    return 4;
};

const sortPlayersByTablePriority = (players) => {
    return [...players].sort((a, b) => {
        const goalsA = a.stats?.goals ?? a.goals ?? 0;
        const goalsB = b.stats?.goals ?? b.goals ?? 0;
        const assistsA = a.stats?.assists ?? a.assists ?? 0;
        const assistsB = b.stats?.assists ?? b.assists ?? 0;

        if (goalsB !== goalsA) return goalsB - goalsA;
        if (assistsB !== assistsA) return assistsB - assistsA;

        const positionWeightA = getPositionSortWeight(a.position);
        const positionWeightB = getPositionSortWeight(b.position);

        if (positionWeightA !== positionWeightB) return positionWeightA - positionWeightB;

        return (a.name || '').localeCompare(b.name || '');
    });
};

let playersListener = null;
let standingsListener = null;
let metricsListener = null;
let matchesListener = null;

let currentSummary = null;
let currentMatches = [];

const updateAdvancedMetrics = () => {
    if (currentSummary && currentMatches.length > 0) {
        applySeasonMetricsUI(currentSummary, currentMatches);

        // Ensure goalscorers tally with matches
        const updatedPlayers = aggregateStatsFromMatches(statsPlayers, currentMatches);
        statsPlayers = sortPlayersByTablePriority(updatedPlayers);
        filteredPlayers = [...statsPlayers];
        renderStatsTable();
        displayTopScorers(statsPlayers);
    }
};

const normalizePlayerMatchKey = (value = '') => String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const playerMatchesReference = (player, candidate) => {
    if (!player || !candidate) return false;

    const playerName = normalizePlayerMatchKey(player.name);
    const playerNickname = normalizePlayerMatchKey(player.nickname);
    const candidateKey = normalizePlayerMatchKey(candidate);

    if (!candidateKey) return false;
    if (playerName === candidateKey || playerNickname === candidateKey) return true;
    if (playerName.includes(candidateKey) || candidateKey.includes(playerName)) return true;
    if (playerNickname && (playerNickname.includes(candidateKey) || candidateKey.includes(playerNickname))) return true;

    const playerTokens = [playerName, playerNickname].filter(Boolean).flatMap(value => value.split(/(?=[a-z])/).filter(Boolean));
    const candidateTokens = candidateKey.split(/(?=[a-z])/).filter(Boolean);

    return playerTokens.some(token => candidateTokens.includes(token)) ||
        candidateTokens.some(token => playerTokens.includes(token));
};

const aggregateStatsFromMatches = (players, matches) => {
    const statsMap = {};

    matches.forEach(match => {
        if (match.status !== 'completed' || !match.events) return;

        match.events.forEach(event => {
            if (!event || typeof event !== 'object') return;

            if (event.type === 'goal') {
                const scorerMatch = players.find(player => playerMatchesReference(player, event.player));
                if (scorerMatch) {
                    const key = String(scorerMatch.id || scorerMatch.name || scorerMatch.nickname || event.player);
                    if (!statsMap[key]) statsMap[key] = { goals: 0, assists: 0 };
                    statsMap[key].goals += 1;
                }

                if (event.assist) {
                    const assistMatch = players.find(player => playerMatchesReference(player, event.assist));
                    if (assistMatch) {
                        const key = String(assistMatch.id || assistMatch.name || assistMatch.nickname || event.assist);
                        if (!statsMap[key]) statsMap[key] = { goals: 0, assists: 0 };
                        statsMap[key].assists += 1;
                    }
                }
            } else if (event.type === 'assist') {
                const assistMatch = players.find(player => playerMatchesReference(player, event.player));
                if (assistMatch) {
                    const key = String(assistMatch.id || assistMatch.name || assistMatch.nickname || event.player);
                    if (!statsMap[key]) statsMap[key] = { goals: 0, assists: 0 };
                    statsMap[key].assists += 1;
                }
            }
        });
    });

    return players.map(player => {
        const key = String(player.id || player.name || player.nickname);
        const matchStats = statsMap[key] || { goals: 0, assists: 0 };
        const matchGoals = Number(matchStats.goals || 0);
        const matchAssists = Number(matchStats.assists || 0);

        return {
            ...player,
            goals: matchGoals,
            assists: matchAssists,
            stats: {
                ...(player.stats || {}),
                goals: matchGoals,
                assists: matchAssists
            }
        };
    });
};

const fetchPlayerStats = async () => {
    // 1. Initial Load from local data for speed
    try {
        const fetchFn = (window.AppConfig && window.AppConfig.fetchAsset) ? window.AppConfig.fetchAsset : fetch;
        const [playersRes, logRes, matchesRes] = await Promise.all([
            fetchFn('data/players.json'),
            fetchFn('data/log.json'),
            fetchFn('data/matches.json')
        ]);

        const [pData, lData, mData] = await Promise.all([
            playersRes.json(),
            logRes.json(),
            matchesRes.json()
        ]);

        statsPlayers = sortPlayersByTablePriority(pData);
        filteredPlayers = [...statsPlayers];
        renderStatsTable();
        displayTopScorers(pData);

        currentSummary = parseLeagueStandings(lData);
        if (currentSummary) applyLeagueSummaryUI(currentSummary);

        currentMatches = mData;
        updateAdvancedMetrics();

    } catch (e) { console.warn("Initial local fetch in Stats failed:", e); }

    // 2. Real-time Firebase Sync
    if (window.db) {
        if (playersListener) playersListener();
        if (standingsListener) standingsListener();
        if (metricsListener) metricsListener();
        if (matchesListener) matchesListener();

        console.log("[Stats] Subscribing to real-time updates...");

        // Players Sync
        playersListener = window.db.collection('players').onSnapshot(snapshot => {
            if (!snapshot.empty) {
                const data = snapshot.docs.map(doc => doc.data());
                statsPlayers = sortPlayersByTablePriority(data);
                filteredPlayers = [...statsPlayers];
                renderStatsTable();
                displayTopScorers(data);
                populateFilterOptions(data);
            }
        });

        // Standings Sync
        standingsListener = window.db.collection('settings').doc('standings').onSnapshot(doc => {
            if (doc.exists && doc.data().data) {
                currentSummary = parseLeagueStandings(JSON.parse(doc.data().data));
                if (currentSummary) {
                    applyLeagueSummaryUI(currentSummary);
                    updateAdvancedMetrics();
                }
            }
        });

        // Team Metrics Sync
        metricsListener = window.db.collection('settings').doc('teamMetrics').onSnapshot(doc => {
            if (doc.exists) {
                renderTeamMetrics(filteredPlayers, doc.data());
            }
        });

        // Matches Sync (for form and metrics)
        matchesListener = window.db.collection('matches').onSnapshot(snapshot => {
            if (!snapshot.empty) {
                currentMatches = snapshot.docs.map(doc => doc.data());
                updateAdvancedMetrics();
            }
        });
    }
};





/* =========================================
   PLAYER TABLE
========================================= */

const renderStatsTable = () => {

    const statsBody =
        document.querySelector('#stats-table tbody');

    if (!statsBody) return;

    // Paginate the filtered players
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedPlayers = filteredPlayers.slice(startIndex, endIndex);

    statsBody.innerHTML = '';

    if (paginatedPlayers.length === 0) {
        statsBody.innerHTML = `<tr><td colspan="5" class="loading-cell"><p>No players match the current filters.</p></td></tr>`;
        setupPagination(); // Still setup pagination to show 0/0
        return;
    }

    paginatedPlayers.forEach(player => {

        // Support both nested stats object (stats.goals) and flat fields (player.goals)
        const stats       = player.stats || {};
        const goals       = stats.goals       ?? player.goals       ?? 0;
        const assists     = stats.assists     ?? player.assists     ?? 0;
        const cleanSheets = stats.cleanSheets ?? player.cleansheets ?? 0;
        // Support both playerImage (roster schema) and image (legacy schema)
        const playerImg   = player.playerImage || player.image || 'images/default-player.png';

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>
                <div class="player-cell">
                    <img src="${playerImg}" alt="${player.nickname || player.name}" class="player-avatar">
                    <div>
                        <strong>${player.nickname || player.name || 'Unknown'}</strong>
                    </div>
                </div>
            </td>
            <td><span class="position-badge">${abbreviatePosition(player.position)}</span></td>
            <td>${goals}</td>
            <td>${assists}</td>
            <td>${cleanSheets}</td>
        `;

        statsBody.appendChild(row);

    });

    setupPagination();
};

const setupPagination = () => {
    const paginationContainer = document.getElementById('stats-pagination');
    const paginationInfo = document.getElementById('pagination-info');
    if (!paginationContainer || !paginationInfo) return;

    const totalPlayers = filteredPlayers.length;
    const totalPages = Math.ceil(totalPlayers / rowsPerPage);

    const startPlayer = totalPlayers > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0;
    const endPlayer = Math.min(currentPage * rowsPerPage, totalPlayers);
    paginationInfo.textContent = `${startPlayer}-${endPlayer} of ${totalPlayers} players`;

    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous Button
    const prevButton = document.createElement('button');
    prevButton.innerHTML = `<i class="fa-solid fa-chevron-left"></i>`;
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderStatsTable();
        }
    });
    paginationContainer.appendChild(prevButton);

    // Page number buttons
    const pageButtonsWrapper = document.createElement('span');
    pageButtonsWrapper.className = 'page-buttons-wrapper';
    
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = i === currentPage ? 'page-btn active' : 'page-btn';
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderStatsTable();
        });
        pageButtonsWrapper.appendChild(pageBtn);
    }
    paginationContainer.appendChild(pageButtonsWrapper);

    // Next Button
    const nextButton = document.createElement('button');
    nextButton.innerHTML = `<i class="fa-solid fa-chevron-right"></i>`;
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderStatsTable();
        }
    });
    paginationContainer.appendChild(nextButton);
};



/* =========================================
   SUMMARY CARDS
========================================= */

const updateStatsSummary = (
    players,
    leagueSummary
) => {

    const totalGoals = players.reduce((sum, player) => {
        return sum + (player.stats?.goals || 0);
    }, 0);

    const totalGoalsAgainst = players.reduce(
        (sum, player) => {
            return sum + (player.stats?.goalsAgainst || 0);
        },
        0
    );

    const totalMatches =
        leagueSummary?.matchesPlayed ??
        players.reduce((sum, player) => {
            return sum + (player.stats?.gamesPlayed || 0);
        }, 0);

    const goalDiff =
        leagueSummary?.goalDifference ??
        (
            leagueSummary
                ? leagueSummary.goalsFor -
                  leagueSummary.goalsAgainst
                : totalGoals - totalGoalsAgainst
        );

    document.getElementById(
        'summaryMatches'
    ).textContent = totalMatches;

    document.getElementById(
        'summaryGoalsFor'
    ).textContent =
        leagueSummary?.goalsFor ?? totalGoals;

    document.getElementById(
        'summaryGoalsAgainst'
    ).textContent =
        leagueSummary?.goalsAgainst ??
        totalGoalsAgainst;

    document.getElementById(
        'summaryGoalDiff'
    ).textContent = goalDiff;
};



/* =========================================
   LEAGUE STANDINGS
========================================= */

const parseLeagueStandings = (parsed) => {

    if (
        !parsed ||
        !parsed.headers ||
        !parsed.rows ||
        !parsed.rows.length
    ) {
        return null;
    }

    const tangoRow = parsed.rows.find(row =>
        row.some(cell =>
            String(cell)
                .toLowerCase()
                .includes(CLUB_NAME.toLowerCase())
        )
    );

    if (!tangoRow || tangoRow.length < 10) {
        return null;
    }

    const [position, ...teamAndStats] = tangoRow;

    const stats = teamAndStats.slice(-8);

    const goalsFor = Number(stats[4]) || 0;

    const goalsAgainst = Number(stats[5]) || 0;

    const matchesPlayed = Number(stats[0]) || 0;

    const goalDifference =
        Number(stats[6]) ||
        goalsFor - goalsAgainst;

    return {
        position: Number(position) || null,
        matchesPlayed,
        wins: Number(stats[1]) || 0,
        draws: Number(stats[2]) || 0,
        losses: Number(stats[3]) || 0,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points: Number(stats[7]) || 0
    };
};



const getLeagueSummary = async () => {
    try {
        if (window.db) {
            try {
                // Apply 2s timeout to Firebase standings fetch
                const fetchPromise = window.db.collection('settings').doc('standings').get();
                const doc = await (window.AppConfig?.withTimeout ? window.AppConfig.withTimeout(fetchPromise) : fetchPromise);

                if (doc.exists && doc.data().data) {
                    const parsed = JSON.parse(doc.data().data);
                    const leagueSummary = parseLeagueStandings(parsed);
                    if (leagueSummary) return leagueSummary;
                }
            } catch(e) { console.warn('Firebase fetch standings failed or timed out:', e.message); }
        }

        const raw = localStorage.getItem('leagueStandingsJson');

        if (raw) {
            const parsed = JSON.parse(raw);
            const leagueSummary = parseLeagueStandings(parsed);
            if (leagueSummary) {
                return leagueSummary;
            }
        }

        const fetchFn = (window.AppConfig && window.AppConfig.fetchAsset) ? window.AppConfig.fetchAsset : fetch;
        const response = await fetchFn('data/log.json');

        if (!response.ok) return null;

        const json = await response.json();

        return parseLeagueStandings(json);

    } catch (error) {

        console.warn(
            'League summary load failed:',
            error
        );

        return null;
    }
};



/* =========================================
   FILTERS
========================================= */

const populateFilterOptions = (players) => {

    const positions = [
        ...new Set(
            players
                .map(player => player.position)
                .filter(Boolean)
        )
    ].sort();

    const positionFilter =
        document.getElementById('positionFilter');

    if (positionFilter) {

        positionFilter.innerHTML =
            '<option value="">All Positions</option>' +

            positions.map(position => `
                <option value="${position}">
                    ${position}
                </option>
            `).join('');
    }
};



const setupStatsControls = () => {

    const searchInput =
        document.getElementById(
            'statsSearchInput'
        );

    const positionFilter =
        document.getElementById(
            'positionFilter'
        );

    [searchInput, positionFilter]
        .forEach(control => {

            if (control) {

                control.addEventListener(
                    'input',
                    applyStatFilters
                );
            }
        });
};



const applyStatFilters = () => {

    const searchTerm =
        document.getElementById(
            'statsSearchInput'
        )?.value
            .toLowerCase()
            .trim() || '';

    const position =
        document.getElementById(
            'positionFilter'
        )?.value || '';

    filteredPlayers = sortPlayersByTablePriority(statsPlayers.filter(player => {

        const name = player.name?.toLowerCase() || '';
        const nickname = player.nickname?.toLowerCase() || '';
        const positionValue = player.position?.toLowerCase() || '';

        const matchesSearch =
            !searchTerm ||
            name.includes(searchTerm) ||
            nickname.includes(searchTerm) ||
            positionValue.includes(searchTerm);

        const matchesPosition =
            !position ||
            player.position === position;

        return (
            matchesSearch &&
            matchesPosition
        );
    }));


    currentPage = 1; // Reset to first page on filter change
    renderStatsTable();
    renderTeamMetrics(filteredPlayers);
};



/* =========================================
   TOP SCORERS
========================================= */

const displayTopScorers = (players) => {

    const container =
        document.getElementById(
            'topScorersContainer'
        );

    if (!container) return;

    const topScorers = [...players].filter(p => (p.stats?.goals ?? p.goals ?? 0) > 0)
        .sort((a, b) => {
            const goalsA = a.stats?.goals ?? a.goals ?? 0;
            const goalsB = b.stats?.goals ?? b.goals ?? 0;
            const assistsA = a.stats?.assists ?? a.assists ?? 0;
            const assistsB = b.stats?.assists ?? b.assists ?? 0;
            if (goalsB !== goalsA) return goalsB - goalsA;
            return assistsB - assistsA;
        });
        // .slice(0, 5); // Example: uncomment to show only top 5

    if (topScorers.length === 0) {

        container.innerHTML =
            '<p style="padding: 20px 0; text-align: center; color: var(--muted);">No players have scored yet this season.</p>';

        return;
    }

    container.innerHTML = topScorers.map(
        (player, index) => {

            const goals   = player.stats?.goals   ?? player.goals   ?? 0;
            const assists = player.stats?.assists ?? player.assists ?? 0;

            return `
                <div class="top-scorer-card">

                    <div class="top-rank">
                        #${index + 1}
                    </div>

                    <img
                        src="${player.playerImage || player.image || 'images/default-player.png'}"
                        alt="${player.nickname || player.name}"
                        class="top-player-image"
                    >

                    <div class="top-scorer-name">
                        ${player.nickname || player.name || 'Unknown'}
                    </div>

                    <div class="top-scorer-meta">
                        ${player.position || 'Player'}
                        •
                        ${player.team || CLUB_NAME}
                    </div>

                    <div class="top-scorer-stats">
                        <span><i class="fa-solid fa-futbol"></i> ${goals}</span>
                        <span><i class="fa-solid fa-bullseye"></i> ${assists}</span>
                    </div>

                </div>
            `;
        }
    ).join('');
};



/* =========================================
   CHARTS
========================================= */

const loadConfiguredTeamMetrics = async () => {
    let configured = null;

    if (window.db) {
        try {
            // Apply 2s timeout to Firebase team metrics fetch
            const fetchPromise = window.db.collection('settings').doc('teamMetrics').get();
            const doc = await (window.AppConfig?.withTimeout ? window.AppConfig.withTimeout(fetchPromise) : fetchPromise);

            if (doc.exists) {
                const raw = doc.data();
                if (raw && typeof raw === 'object') {
                    configured = raw;
                } else if (raw && typeof raw.data === 'string') {
                    configured = JSON.parse(raw.data);
                }
            }
        } catch (e) {
            console.warn('Firebase team metrics fetch failed or timed out:', e.message);
        }
    }

    if (!configured || typeof configured !== 'object' || !Object.keys(configured).length) {
        try {
            const saved = localStorage.getItem('teamMetrics');
            if (saved) configured = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load configured team metrics from localStorage:', e);
        }
    }

    return configured;
};

const getMetricIcon = (label) => {
    const icons = {
        'Total Shots': 'fa-futbol',
        'Shots on Target': 'fa-bullseye',
        'Shot Accuracy': 'fa-percent',
        'Chances Created': 'fa-wand-magic-sparkles',
        'Tackles Won': 'fa-shield-halved',
        'Interceptions': 'fa-hand',
        'Recoveries': 'fa-recycle'
    };
    return icons[label] || 'fa-chart-line';
};

const renderTeamMetrics = (players, configuredMetrics = null) => {
    const container = document.getElementById('team-metrics-grid');
    if (!container) return;

    const calculateTotal = (statName) => {
        return players.reduce((sum, player) => {
            const value = player.stats?.[statName] ?? player[statName] ?? 0;
            return sum + value;
        }, 0);
    };

    const getMetricValue = (statName, fallbackValue) => {
        if (configuredMetrics && typeof configuredMetrics === 'object' && configuredMetrics[statName] != null) {
            return Number(configuredMetrics[statName]) || 0;
        }
        return fallbackValue;
    };

    const metrics = [
        { label: 'Total Shots', value: getMetricValue('shots', calculateTotal('shots')) },
        { label: 'Shots on Target', value: getMetricValue('shotsOnTarget', calculateTotal('shotsOnTarget')) },
        { label: 'Chances Created', value: getMetricValue('chancesCreated', calculateTotal('chancesCreated')) },
        { label: 'Tackles Won', value: getMetricValue('tackles', calculateTotal('tackles')) },
        { label: 'Interceptions', value: getMetricValue('interceptions', calculateTotal('interceptions')) },
        { label: 'Recoveries', value: getMetricValue('recoveries', calculateTotal('recoveries')) },
    ];

    const totalShots = metrics.find(m => m.label === 'Total Shots').value;
    const shotsOnTarget = metrics.find(m => m.label === 'Shots on Target').value;
    const shotAccuracy = totalShots > 0 ? ((shotsOnTarget / totalShots) * 100).toFixed(0) + '%' : '0%';
    metrics.splice(2, 0, { label: 'Shot Accuracy', value: shotAccuracy });

    container.innerHTML = metrics.map(metric => `
        <div class="metric-card glass-card">
            <div class="metric-icon">
                <i class="fa-solid ${getMetricIcon(metric.label)}"></i>
            </div>
            <span>${metric.label}</span>
            <h2>${metric.value}</h2>
        </div>
    `).join('');
};



/* =========================================
   LEAGUE UI
========================================= */

const applyLeagueSummaryUI = (summary) => {

    if (!summary) return;

    document.getElementById(
        'summaryMatches'
    ).textContent = summary.matchesPlayed;

    document.getElementById(
        'summaryGoalsFor'
    ).textContent = summary.goalsFor;

    document.getElementById(
        'summaryGoalsAgainst'
    ).textContent = summary.goalsAgainst;

    document.getElementById(
        'summaryGoalDiff'
    ).textContent = summary.goalDifference;

    document.getElementById(
        'summaryPosition'
    ).textContent = summary.position ?? '-';

    document.getElementById(
        'summaryWins'
    ).textContent = summary.wins;

    document.getElementById(
        'summaryDraws'
    ).textContent = summary.draws;

    document.getElementById(
        'summaryLosses'
    ).textContent = summary.losses;

    document.getElementById(
        'summaryPoints'
    ).textContent = summary.points;
};



/* =========================================
   SEASON METRICS
========================================= */

const applySeasonMetricsUI = (
    summary,
    seasonMatches
) => {

    const goalsPerMatch =
        summary?.matchesPlayed
            ? (
                summary.goalsFor /
                summary.matchesPlayed
            ).toFixed(2)
            : '-';

    const pointsPerGame =
        summary?.matchesPlayed
            ? (
                summary.points /
                summary.matchesPlayed
            ).toFixed(2)
            : '-';

    const winPct =
        summary?.matchesPlayed
            ? (
                (
                    summary.wins /
                    summary.matchesPlayed
                ) * 100
            ).toFixed(0) + '%'
            : '-';

    // Filter for completed matches involving Tango, sort newest first, and take last 5
    const recentCompletedMatches =
        seasonMatches
            .filter(match => {
                const involvesTango = (match.homeTeam || '').toLowerCase().includes('tango') ||
                                      (match.awayTeam || '').toLowerCase().includes('tango');
                return involvesTango &&
                       match.status === 'completed' &&
                       match.homeScore !== null &&
                       match.awayScore !== null;
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort newest first
            .slice(0, 5); // Take top 5 newest

    const formBadges =
        [...recentCompletedMatches]
            .reverse() // Display older to newer in the badge strip (standard)
            .map(match => {
                const result = getTangoMatchResult(match);
                return `
                    <span class="form-badge form-badge-${result.toLowerCase()}">
                        ${result}
                    </span>
                `;
            })
            .join('');

    document.getElementById('summaryGoalsPerMatch').textContent = goalsPerMatch;
    document.getElementById('summaryPointsPerGame').textContent = pointsPerGame;
    document.getElementById('summaryWinPct').textContent = winPct;
    document.getElementById('summaryForm').innerHTML = formBadges || '<span class="form-empty">No form data</span>';

    // Main recent form section shows newest at top
    renderRecentFormMatches(recentCompletedMatches);
};



/* =========================================
   MATCH RESULTS
========================================= */

const getTangoMatchResult = (match) => {
    const homeTeam = (match.homeTeam || '').toLowerCase();
    const awayTeam = (match.awayTeam || '').toLowerCase();
    const tangoIsHome = homeTeam.includes('tango');

    const tangoGoals = tangoIsHome
        ? parseInt(match.homeScore)
        : parseInt(match.awayScore);

    const opponentGoals = tangoIsHome
        ? parseInt(match.awayScore)
        : parseInt(match.homeScore);

    if (tangoGoals > opponentGoals) return 'W';
    if (tangoGoals < opponentGoals) return 'L';
    return 'D';
};



/* =========================================
   RECENT FORM
========================================= */

const renderRecentFormMatches = (
    recentMatches
) => {

    const container =
        document.getElementById(
            'recentFormMatches'
        );

    if (!container) return;

    if (!recentMatches.length) {

        container.innerHTML = `
            <p class="form-empty">
                No completed matches available.
            </p>
        `;

        return;
    }

    // Displays the list of matches (Newest first)
    container.innerHTML =
        recentMatches
            .map(match => {
                const homeTeam = (match.homeTeam || '');
                const awayTeam = (match.awayTeam || '');
                const tangoIsHome = homeTeam.toLowerCase().includes('tango');

                const opponent = tangoIsHome
                    ? awayTeam
                    : homeTeam;

                const tangoGoals = tangoIsHome
                    ? match.homeScore
                    : match.awayScore;

                const opponentGoals = tangoIsHome
                    ? match.awayScore
                    : match.homeScore;

                const result = getTangoMatchResult(match);
                let resultClass = result === 'W' ? 'form-win' : result === 'D' ? 'form-draw' : 'form-loss';

                const displayDate = new Date(match.date).toLocaleDateString(undefined, {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                });

                return `
                    <div class="recent-match-card ${resultClass}">
                        <div class="recent-match-top-row">
                            <div class="recent-match-result">${result}</div>
                            <span class="recent-match-score">${tangoGoals} - ${opponentGoals}</span>
                        </div>
                        <div class="recent-match-teams" title="${CLUB_NAME} vs ${opponent}">
                            ${CLUB_NAME} vs ${opponent}
                        </div>
                        <div class="recent-match-date">
                            ${displayDate}
                        </div>
                    </div>
                `;
            })
            .join('');
};



/* =========================================
   LOAD SEASON MATCHES
========================================= */

const loadSeasonMatches = async () => {
    try {
        let matches = [];
        if (window.db) {
            try {
                // Apply 2s timeout to Firebase matches fetch
                const fetchPromise = window.db.collection('matches').get();
                const mSnap = await (window.AppConfig?.withTimeout ? window.AppConfig.withTimeout(fetchPromise) : fetchPromise);

                if (!mSnap.empty) {
                    matches = mSnap.docs.map(doc => doc.data());
                }
            } catch(e) { console.warn('Firebase fetch matches failed or timed out:', e.message); }
        }

        if (matches.length === 0) {
            const fetchFn = (window.AppConfig && window.AppConfig.fetchAsset) ? window.AppConfig.fetchAsset : fetch;
            const response = await fetchFn('data/matches.json');
            if (response.ok) matches = await response.json();
        }

        const tangoMatches =
            matches.filter(match => {

                const isTangoGame =
                    match.homeTeam === CLUB_NAME ||
                    match.awayTeam === CLUB_NAME;

                const isCompleted =
                    match.status === 'completed' &&
                    match.homeScore !== null &&
                    match.awayScore !== null;

                const isCurrentSeason =
                    new Date(match.date) >=
                    new Date(SEASON_START);

                return (
                    isTangoGame &&
                    isCompleted &&
                    isCurrentSeason
                );
            });

        tangoMatches.sort((a, b) => {
            return (
                new Date(a.date) -
                new Date(b.date)
            );
        });

        return tangoMatches;

    } catch (error) {

        console.warn(
            'Failed to load season matches:',
            error
        );

        return [];
    }
};



/* =========================================
   INIT
========================================= */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        fetchPlayerStats();

        setupStatsControls();
    }
);
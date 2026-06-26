const CLUB_NAME = 'Tango FC';
const SEASON_START = '2026-03-21';

let statsPlayers = [];
let filteredPlayers = [];
let currentPage = 1;
const rowsPerPage = 5;

const fetchPlayerStats = async () => {
    try {
        let data = [];
        if (window.db) {
            try {
                const pSnap = await window.db.collection('players').get();
                if (!pSnap.empty) {
                    data = pSnap.docs.map(doc => doc.data());
                }
            } catch(e) { console.error('Firebase fetch players failed:', e); }
        }

        if (data.length === 0) {
            console.warn("Firebase fetch failed, falling back to local data.");
            const playersResponse = await fetch('data/players.json');
            data = await playersResponse.json();
        }

        const seasonMatches = await loadSeasonMatches();
        statsPlayers = data;
        filteredPlayers = [...statsPlayers]; // Initialize filtered list

        const leagueSummary = await getLeagueSummary();

        updateStatsSummary(data, leagueSummary);

        populateFilterOptions(data);

        displayTopScorers(data);

        renderGoalsAssistsChart(filteredPlayers);

        renderStatsTable(data);

        applyLeagueSummaryUI(leagueSummary);

        applySeasonMetricsUI(
            leagueSummary,
            seasonMatches
        );

    } catch (error) {

        console.error(
            'Error fetching player stats:',
            error
        );
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
        statsBody.innerHTML = `<tr><td colspan="6" class="loading-cell"><p>No players match the current filters.</p></td></tr>`;
        setupPagination(); // Still setup pagination to show 0/0
        return;
    }

    paginatedPlayers.forEach(player => {

        // Support both nested stats object (stats.goals) and flat fields (player.goals)
        const stats       = player.stats || {};
        const goals       = stats.goals       ?? player.goals       ?? 0;
        const assists     = stats.assists     ?? player.assists     ?? 0;
        const cleanSheets = stats.cleanSheets ?? player.cleansheets ?? 0;
        const gamesPlayed = stats.gamesPlayed ?? player.matches     ?? 0;
        // Support both playerImage (roster schema) and image (legacy schema)
        const playerImg   = player.playerImage || player.image || 'images/default-player.png';

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>
                <div class="player-cell">
                    <img src="${playerImg}" alt="${player.name}" class="player-avatar">
                    <div>
                        <strong>${player.name || 'Unknown'}</strong>
                        <small>${player.team || CLUB_NAME}</small>
                    </div>
                </div>
            </td>
            <td><span class="position-badge">${player.position || '-'}</span></td>
            <td>${gamesPlayed}</td>
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

    // Page indicator
    const pageIndicator = document.createElement('span');
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    pageIndicator.className = 'page-indicator';
    paginationContainer.appendChild(pageIndicator);

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
                const doc = await window.db.collection('settings').doc('standings').get();
                if (doc.exists && doc.data().data) {
                    const parsed = JSON.parse(doc.data().data);
                    const leagueSummary = parseLeagueStandings(parsed);
                    if (leagueSummary) return leagueSummary;
                }
            } catch(e) { console.error('Firebase fetch standings failed:', e); }
        }

        const raw = localStorage.getItem('leagueStandingsJson');

        if (raw) {
            const parsed = JSON.parse(raw);
            const leagueSummary = parseLeagueStandings(parsed);
            if (leagueSummary) {
                return leagueSummary;
            }
        }

        const response =
            await fetch('data/log.json');

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

    const teams = [
        ...new Set(
            players
                .map(player => player.team)
                .filter(Boolean)
        )
    ].sort();

    const positions = [
        ...new Set(
            players
                .map(player => player.position)
                .filter(Boolean)
        )
    ].sort();

    const teamFilter =
        document.getElementById('teamFilter');

    const positionFilter =
        document.getElementById('positionFilter');

    if (teamFilter) {

        teamFilter.innerHTML =
            '<option value="">All Teams</option>' +

            teams.map(team => `
                <option value="${team}">
                    ${team}
                </option>
            `).join('');
    }

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

    const teamFilter =
        document.getElementById('teamFilter');

    const positionFilter =
        document.getElementById(
            'positionFilter'
        );

    [searchInput, teamFilter, positionFilter]
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

    const team =
        document.getElementById(
            'teamFilter'
        )?.value || '';

    const position =
        document.getElementById(
            'positionFilter'
        )?.value || '';

    filteredPlayers = statsPlayers.filter(player => {

        const name =
            player.name?.toLowerCase() || '';

        const teamValue =
            player.team?.toLowerCase() || '';

        const positionValue =
            player.position?.toLowerCase() || '';

        const matchesSearch =
            !searchTerm ||
            name.includes(searchTerm) ||
            teamValue.includes(searchTerm) ||
            positionValue.includes(searchTerm);

        const matchesTeam =
            !team || player.team === team;

        const matchesPosition =
            !position ||
            player.position === position;

        return (
            matchesSearch &&
            matchesTeam &&
            matchesPosition
        );
    });

    currentPage = 1; // Reset to first page on filter change
    renderStatsTable();
    renderGoalsAssistsChart(filteredPlayers);
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
                        alt="${player.name}"
                        class="top-player-image"
                    >

                    <div class="top-scorer-name">
                        ${player.name || 'Unknown'}
                    </div>

                    <div class="top-scorer-meta">
                        ${player.position || 'Player'}
                        •
                        ${player.team || CLUB_NAME}
                    </div>

                    <div class="top-scorer-stats">
                        <span>⚽ ${goals}</span>
                        <span>🎯 ${assists}</span>
                    </div>

                </div>
            `;
        }
    ).join('');
};



/* =========================================
   CHARTS
========================================= */

const renderGoalsAssistsChart = (players) => {

    const canvas =
        document.getElementById(
            'goalsAssistsChart'
        );

    if (!canvas) return;

    const totalGoals = players.reduce(
        (sum, player) => {
            return sum + (player.stats?.goals || 0);
        },
        0
    );

    const totalAssists = players.reduce(
        (sum, player) => {
            return sum + (player.stats?.assists || 0);
        },
        0
    );

    new Chart(canvas, {

        type: 'bar',

        data: {

            labels: ['Goals', 'Assists'],

            datasets: [{
                label: 'Season Totals',
                data: [
                    totalGoals,
                    totalAssists
                ]
            }]
        },

        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
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

    const recentCompletedMatches =
        seasonMatches
            .filter(match =>
                match.status === 'completed' &&
                match.homeScore !== null &&
                match.awayScore !== null
            )
            .slice(-5);

    const formBadges =
        recentCompletedMatches
            .map(match => {

                const result =
                    getTangoMatchResult(match);

                return `
                    <span class="
                        form-badge
                        form-badge-${result.toLowerCase()}
                    ">
                        ${result}
                    </span>
                `;
            })
            .join('');

    document.getElementById(
        'summaryGoalsPerMatch'
    ).textContent = goalsPerMatch;

    document.getElementById(
        'summaryPointsPerGame'
    ).textContent = pointsPerGame;

    document.getElementById(
        'summaryWinPct'
    ).textContent = winPct;

    document.getElementById(
        'summaryForm'
    ).innerHTML =
        formBadges ||
        '<span class="form-empty">No form data</span>';

    renderRecentFormMatches(
        recentCompletedMatches
    );
};



/* =========================================
   MATCH RESULTS
========================================= */

const getTangoMatchResult = (match) => {

    const tangoIsHome =
        match.homeTeam === CLUB_NAME;

    const tangoGoals = tangoIsHome
        ? match.homeScore
        : match.awayScore;

    const opponentGoals = tangoIsHome
        ? match.awayScore
        : match.homeScore;

    if (tangoGoals > opponentGoals) {
        return 'W';
    }

    if (tangoGoals < opponentGoals) {
        return 'L';
    }

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

    container.innerHTML =
        recentMatches
            .slice(-5)
            .reverse()
            .map(match => {

                const tangoIsHome =
                    match.homeTeam === CLUB_NAME;

                const opponent = tangoIsHome
                    ? match.awayTeam
                    : match.homeTeam;

                const tangoGoals = tangoIsHome
                    ? match.homeScore
                    : match.awayScore;

                const opponentGoals = tangoIsHome
                    ? match.awayScore
                    : match.homeScore;

                const result =
                    getTangoMatchResult(match);

                let resultClass = '';

                if (result === 'W') {
                    resultClass = 'form-win';
                }
                else if (result === 'D') {
                    resultClass = 'form-draw';
                }
                else {
                    resultClass = 'form-loss';
                }

                return `
                    <div class="
                        recent-match-card
                        ${resultClass}
                    ">

                        <div class="
                            recent-match-result
                        ">
                            ${result}
                        </div>

                        <div class="
                            recent-match-detail
                        ">

                            <span class="
                                recent-match-teams
                            ">
                                ${CLUB_NAME}
                                vs
                                ${opponent}
                            </span>

                            <span class="
                                recent-match-score
                            ">
                                ${tangoGoals}
                                -
                                ${opponentGoals}
                            </span>

                            <span class="
                                recent-match-date
                            ">
                                ${match.date}
                            </span>

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
                const mSnap = await window.db.collection('matches').get();
                if (!mSnap.empty) {
                    matches = mSnap.docs.map(doc => doc.data());
                }
            } catch(e) { console.error('Firebase fetch matches failed:', e); }
        }

        if (matches.length === 0) {
            const response = await fetch('data/matches.json');
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
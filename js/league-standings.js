const standingsApp = {
    config: {
        CHAMPION_ZONE: 1,
        EUROPA_ZONE: 4,
        RELEGATION_POS: 17,
        TANGO_FC_NAME: 'tango fc'
    },

    state: {
        standings: null,
        matches: []
    },

    listeners: {
        standings: null,
        results: null
    },

    init: async function() {
        // 1. Instant local load
        const [localStandings, localResults] = await Promise.all([
            this.data.loadLocalStandings(),
            this.data.loadLocalMatches()
        ]);

        if (localStandings) {
            this.state.standings = localStandings;
            this.state.matches = localResults?.matches || [];
            this.ui.showNoData(false);
            this.ui.renderAll();
        }

        // 2. Real-time Firebase Sync
        this.data.subscribeToLiveUpdates();
        this.events.wireSearch();
    },

    data: {
        loadLocalStandings: async function() {
            const raw = localStorage.getItem('leagueStandingsJson');
            if (raw) return standingsApp.data.safeParseJson(raw);

            const fetchFn = (window.AppConfig && window.AppConfig.fetchAsset) ? window.AppConfig.fetchAsset : fetch;
            try {
                const res = await fetchFn('data/log.json');
                return res.ok ? await res.json() : null;
            } catch (e) { return null; }
        },

        loadLocalMatches: async function() {
            const raw = localStorage.getItem('resultsJson');
            if (raw) return standingsApp.data.safeParseJson(raw);

            const fetchFn = (window.AppConfig && window.AppConfig.fetchAsset) ? window.AppConfig.fetchAsset : fetch;
            try {
                const res = await fetchFn('data/results.json');
                return res.ok ? await res.json() : null;
            } catch (e) { return null; }
        },

        subscribeToLiveUpdates: function() {
            if (!window.db) return;

            // Unsubscribe existing
            if (standingsApp.listeners.standings) standingsApp.listeners.standings();
            if (standingsApp.listeners.results) standingsApp.listeners.results();

            console.log("[Standings] Subscribing to real-time updates...");

            // Standings sync
            standingsApp.listeners.standings = window.db.collection('settings').doc('standings').onSnapshot(doc => {
                if (doc.exists && doc.data().data) {
                    const parsed = this.safeParseJson(doc.data().data);
                    if (parsed) {
                        standingsApp.state.standings = parsed;
                        standingsApp.ui.showNoData(false);
                        standingsApp.ui.renderAll();
                    }
                }
            });

            // Results sync (for form badges)
            standingsApp.listeners.results = window.db.collection('settings').doc('results').onSnapshot(doc => {
                if (doc.exists && doc.data().data) {
                    const parsed = this.safeParseJson(doc.data().data);
                    if (parsed && Array.isArray(parsed.matches)) {
                        standingsApp.state.matches = parsed.matches;
                        standingsApp.ui.renderAll();
                    }
                }
            });
        },

        safeParseJson: function(raw) {
            try { return JSON.parse(raw); }
            catch (e) { console.error('Parse error:', e); return null; }
        }
    },


    ui: {
        renderAll: function() {
            this.renderSummaryStrip();
            this.renderHeroCard();
            this.renderTable();
        },

        showNoData: function(show) {
            const tbody = document.getElementById('standingsBody');
            const noData = document.getElementById('standingsNoData');
            if (tbody) tbody.innerHTML = '';
            if (noData) noData.style.display = show ? 'flex' : 'none';
        },

        renderHeroCard: function() {
            const tangoRow = standingsApp.state.standings.rows.find(r => r.join(' ').toLowerCase().includes(standingsApp.config.TANGO_FC_NAME));
            if (!tangoRow) return;

            const posNum = document.getElementById('heroPosNum');
            const posStats = document.getElementById('heroPosStats');
            if (!posNum || !posStats) return;

            const [pos, , , w, d, l, , , , pts] = tangoRow;
            posNum.textContent = standingsApp.helpers.ordinal(pos);

            posStats.innerHTML = `
                <div class="pos-stat-item"><strong>${pts}</strong><span>Points</span></div>
                <div class="pos-stat-item"><strong>${w}</strong><span>Wins</span></div>
                <div class="pos-stat-item"><strong>${d}</strong><span>Draws</span></div>
                <div class="pos-stat-item"><strong>${l}</strong><span>Losses</span></div>
            `;
        },

        renderSummaryStrip: function() {
            const container = document.getElementById('summaryStrip');
            if (!container) return;
            const rows = standingsApp.state.standings.rows;

            const totalTeams = rows.length;
            const totalGoals = rows.reduce((s, r) => s + parseInt(r[6] || 0), 0);
            const topPts = Math.max(...rows.map(r => parseInt(r[9] || 0)));
            const leader = rows.find(r => parseInt(r[9]) === topPts);

            container.innerHTML = `
                <div class="s-pill"><div class="s-pill-icon blue"><i class="fa-solid fa-users"></i></div><div><span>Teams</span><strong>${totalTeams}</strong></div></div>
                <div class="s-pill"><div class="s-pill-icon green"><i class="fa-solid fa-futbol"></i></div><div><span>Total Goals</span><strong>${totalGoals}</strong></div></div>
                <div class="s-pill"><div class="s-pill-icon gold"><i class="fa-solid fa-trophy"></i></div><div><span>League Leaders</span><strong style="font-size:1rem; margin-top:2px;">${leader ? leader[1] : '—'}</strong></div></div>
                <div class="s-pill"><div class="s-pill-icon red"><i class="fa-solid fa-star"></i></div><div><span>Top Points</span><strong>${topPts}</strong></div></div>
            `;
        },

        renderTable: function(filteredRows = null) {
            const tbody = document.getElementById('standingsBody');
            if (!tbody) return;
            const rows = filteredRows || standingsApp.state.standings.rows;
            const matches = standingsApp.state.matches;

            if (rows.length === 0) {
                tbody.innerHTML = `<tr><td colspan="11" class="loading-cell">No teams match the search.</td></tr>`;
                return;
            }
            tbody.innerHTML = rows.map((row, index) => this.buildRow(row, matches)).join('');
        },

        buildRow: function(row, matches) {
            const [pos, name, played, w, d, l, gf, ga, gd, pts] = row;
            const { TANGO_FC_NAME } = standingsApp.config;
            const totalTeams = standingsApp.state.standings.rows.length;

            const isTango = (name || '').toLowerCase().includes(TANGO_FC_NAME);
            const position = parseInt(pos);
            const isTopFour = position >= 1 && position <= 4;
            const isMidTable = position >= 5 && position <= 7;
            const isRelegation = position >= 17 && position <= 20;

            let rowClass = '';
            if (isTopFour) rowClass = 'zone-top-four';
            else if (isMidTable) rowClass = 'zone-mid-table';
            else if (isRelegation) rowClass = 'zone-relegation';

            if (isTango) rowClass += ' row-tango';

            const gdNum = parseInt(gd) || 0;
            const gdClass = gdNum > 0 ? 'gd-pos' : gdNum < 0 ? 'gd-neg' : 'gd-zero';
            const gdText = gdNum > 0 ? `+${gdNum}` : `${gdNum}`;

            const form = standingsApp.helpers.generateForm(name, matches);

            return `
                <tr class="${rowClass}">
                    <td class="pos-cell" role="cell">${pos}</td>
                    <th scope="row" role="rowheader"><div class="team-cell"><span class="team-name">${name}</span></div></th>
                    <td>${played}</td><td>${w}</td><td>${d}</td><td>${l}</td><td>${gf}</td><td>${ga}</td>
                    <td class="${gdClass}">${gdText}</td><td class="pts-cell">${pts}</td><td>${form}</td>
                </tr>
            `;
        }
    },

    events: {
        wireSearch: function() {
            const input = document.getElementById('tableSearch');
            if (!input) return;

            input.addEventListener('input', () => {
                const q = input.value.trim().toLowerCase();
                const filtered = standingsApp.state.standings.rows.filter(r => r[1].toLowerCase().includes(q));
                standingsApp.ui.renderTable(filtered);
            });
        }
    },

    helpers: {
        nameToInitials: function(name) {
    return name
        .replace(/fc|sc|ac|bc|united|city|town|stars|all/gi, '')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(w => w[0] || '')
        .join('')
        .toUpperCase();
},

        ordinal: function(n) {
    const num = parseInt(n);
    const s = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (s[(v - 20) % 10] || s[v] || s[0]);
},

        generateForm: function(teamName, matches) {
    if (!matches || !matches.length) return '<span class="form-badges">—</span>';

    const target = teamName.trim().toLowerCase();

    // 1. Filter matches involving this team that have been played (scores are not null/undefined)
    const teamMatches = matches.filter(m => {
        const homeTeam = (m.home || '').trim().toLowerCase();
        const awayTeam = (m.away || '').trim().toLowerCase();
        return (homeTeam === target || awayTeam === target) && 
               m.homeScore !== null && m.awayScore !== null &&
               m.homeScore !== undefined && m.awayScore !== undefined;
    });

    // 2. Sort chronologically by match week
    teamMatches.sort((a, b) => a.week - b.week);

    // 3. Take the last 5 matches played
    const last5 = teamMatches.slice(-5);

    if (last5.length === 0) return '<span class="form-badges">—</span>';

    // 4. Map matches to W/D/L outcomes based on whether team was Home or Away
    const badges = last5.map(m => {
        const homeTeam = (m.home || '').trim().toLowerCase();
        let result = 'D';

        if (homeTeam === target) {
            if (m.homeScore > m.awayScore) result = 'W';
            else if (m.homeScore < m.awayScore) result = 'L';
        } else {
            if (m.awayScore > m.homeScore) result = 'W';
            else if (m.awayScore < m.homeScore) result = 'L';
        }

        const cls = result === 'W' ? 'fb-w' : result === 'D' ? 'fb-d' : 'fb-l';
        return `<span class="fb ${cls}" title="${result}">${result}</span>`;
    }).join('');

    return `<div class="form-badges">${badges}</div>`;
}
    }
};

document.addEventListener('DOMContentLoaded', () => standingsApp.init());
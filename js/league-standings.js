document.addEventListener('DOMContentLoaded', () => {
    loadLeagueStandings();
});

/* =========================================
   ZONE THRESHOLDS
   Adjust these to match your league rules
========================================= */
const CHAMPION_ZONE  = 1;   // top N rows get gold border
const EUROPA_ZONE    = 4;   // rows 2–N get blue border
const RELEGATION_POS = 17;  // rows N+ get red border

/* =========================================
   MAIN LOADER
========================================= */
async function loadLeagueStandings() {
    const tbody    = document.getElementById('standingsBody');
    const noData   = document.getElementById('standingsNoData');
    const strip    = document.getElementById('summaryStrip');

    let parsed = null;

    // 1. Try localStorage override
    const localRaw = localStorage.getItem('leagueStandingsJson');
    if (localRaw) {
        parsed = safeParseLeagueJson(localRaw);
        if (!parsed) console.warn('Invalid local standings JSON, falling back to log.json');
    }

    // 2. Fetch from data/log.json
    if (!parsed) parsed = await loadStandingsFromLogJson();

    // 3. Nothing found
    if (!parsed || !parsed.headers || !parsed.rows || !parsed.rows.length) {
        if (tbody)  tbody.innerHTML  = '';
        if (noData) noData.style.display = 'flex';
        return;
    }

    if (noData) noData.style.display = 'none';

    // 4. Fetch real match results for the form badges
    const resultsData = await loadResultsJson();
    const matches = resultsData && resultsData.matches ? resultsData.matches : [];

    renderSummaryStrip(parsed.rows, strip);
    renderHeroCard(parsed.rows);
    renderTable(parsed.rows, tbody, matches);
    wireSearch(parsed.rows, tbody, matches);
}

/* =========================================
   JSON HELPERS
========================================= */
function safeParseLeagueJson(raw) {
    try { return JSON.parse(raw); }
    catch (e) { console.error('Parse error:', e); return null; }
}

async function loadStandingsFromLogJson() {
    try {
        const res = await fetch('data/log.json');
        if (!res.ok) { console.warn('Could not fetch data/log.json:', res.statusText); return null; }
        const json = await res.json();
        if (!json || !json.headers || !json.rows) { console.warn('Invalid log.json structure'); return null; }
        return json;
    } catch (e) {
        console.warn('Failed to load data/log.json:', e);
        return null;
    }
}

async function loadResultsJson() {
    try {
        // Tries data/results.json first, falls back to root results.json if needed
        let res = await fetch('data/results.json');
        if (!res.ok) res = await fetch('results.json');
        if (!res.ok) { console.warn('Could not fetch results.json'); return null; }
        return await res.json();
    } catch (e) {
        console.warn('Failed to load results.json:', e);
        return null;
    }
}

/* =========================================
   HERO CARD — Tango FC position snapshot
========================================= */
function renderHeroCard(rows) {
    const tangoRow = rows.find(r => r.join(' ').toLowerCase().includes('tango fc'));
    if (!tangoRow) return;

    const posNum   = document.getElementById('heroPosNum');
    const posStats = document.getElementById('heroPosStats');
    if (!posNum || !posStats) return;

    // Columns: Pos W D L GF GA GD Pts  (indices from log.json)
    const pos = tangoRow[0];
    const w   = tangoRow[3];
    const d   = tangoRow[4];
    const l   = tangoRow[5];
    const pts = tangoRow[9];
    const gd  = tangoRow[8];

    posNum.textContent = ordinal(pos);

    posStats.innerHTML = `
        <div class="pos-stat-item">
            <strong>${pts}</strong>
            <span>Points</span>
        </div>
        <div class="pos-stat-item">
            <strong>${w}</strong>
            <span>Wins</span>
        </div>
        <div class="pos-stat-item">
            <strong>${d}</strong>
            <span>Draws</span>
        </div>
        <div class="pos-stat-item">
            <strong>${l}</strong>
            <span>Losses</span>
        </div>
    `;
}

/* =========================================
   SUMMARY STRIP — top 4 aggregate metrics
========================================= */
function renderSummaryStrip(rows, container) {
    if (!container) return;

    const totalTeams = rows.length;
    const totalGoals = rows.reduce((s, r) => s + parseInt(r[6] || 0), 0);
    const topPts     = Math.max(...rows.map(r => parseInt(r[9] || 0)));
    const leader     = rows.find(r => parseInt(r[9]) === topPts);

    container.innerHTML = `
        <div class="s-pill">
            <div class="s-pill-icon blue">
                <i class="fa-solid fa-users"></i>
            </div>
            <div>
                <span>Teams</span>
                <strong>${totalTeams}</strong>
            </div>
        </div>
        <div class="s-pill">
            <div class="s-pill-icon green">
                <i class="fa-solid fa-futbol"></i>
            </div>
            <div>
                <span>Total Goals</span>
                <strong>${totalGoals}</strong>
            </div>
        </div>
        <div class="s-pill">
            <div class="s-pill-icon gold">
                <i class="fa-solid fa-trophy"></i>
            </div>
            <div>
                <span>League Leaders</span>
                <strong style="font-size:1rem; margin-top:2px;">${leader ? leader[1] : '—'}</strong>
            </div>
        </div>
        <div class="s-pill">
            <div class="s-pill-icon red">
                <i class="fa-solid fa-star"></i>
            </div>
            <div>
                <span>Top Points</span>
                <strong>${topPts}</strong>
            </div>
        </div>
    `;
}

/* =========================================
   TABLE RENDER
========================================= */
function renderTable(rows, tbody, matches) {
    tbody.innerHTML = rows.map((row, index) => buildRow(row, index, matches)).join('');
}

function buildRow(row, index, matches) {
    const pos    = parseInt(row[0]);
    const name   = row[1] || '';
    const played = row[2];
    const w      = row[3];
    const d      = row[4];
    const l      = row[5];
    const gf     = row[6];
    const ga     = row[7];
    const gd     = row[8];
    const pts    = row[9];

    const isTango     = name.toLowerCase().includes('tango fc');
    const isChampion  = pos === CHAMPION_ZONE;
    const isEuropa    = pos > CHAMPION_ZONE && pos <= EUROPA_ZONE;
    const isRelegation = pos >= RELEGATION_POS;

    let rowClass = '';
    if (isTango)      rowClass = 'row-tango';
    else if (isChampion)   rowClass = 'zone-champion';
    else if (isEuropa)     rowClass = 'zone-europa';
    else if (isRelegation) rowClass = 'zone-relegation';

    const gdNum  = parseInt(gd) || 0;
    const gdClass = gdNum > 0 ? 'gd-pos' : gdNum < 0 ? 'gd-neg' : 'gd-zero';
    const gdText  = gdNum > 0 ? `+${gdNum}` : `${gdNum}`;

    const initials = nameToInitials(name);
    const form     = generateForm(name, matches);

    return `
        <tr class="${rowClass}">
            <td class="pos-cell">${pos}</td>
            <td>
                <div class="team-cell">
                    <div class="team-initials">${initials}</div>
                    <span class="team-name">${name}</span>
                </div>
            </td>
            <td>${played}</td>
            <td>${w}</td>
            <td>${d}</td>
            <td>${l}</td>
            <td>${gf}</td>
            <td>${ga}</td>
            <td class="${gdClass}">${gdText}</td>
            <td class="pts-cell">${pts}</td>
            <td>${form}</td>
        </tr>
    `;
}

/* =========================================
   SEARCH / FILTER
========================================= */
function wireSearch(rows, tbody, matches) {
    const input = document.getElementById('tableSearch');
    if (!input) return;

    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        if (!q) {
            renderTable(rows, tbody, matches);
            return;
        }
        const filtered = rows.filter(r => r[1].toLowerCase().includes(q));
        tbody.innerHTML = filtered.length
            ? filtered.map((r, i) => buildRow(r, i, matches)).join('')
            : `<tr><td colspan="11" class="loading-cell">No teams match "${input.value}"</td></tr>`;
    });
}

/* =========================================
   HELPERS
========================================= */

function nameToInitials(name) {
    return name
        .replace(/fc|sc|ac|bc|united|city|town|stars|all/gi, '')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(w => w[0] || '')
        .join('')
        .toUpperCase();
}

function ordinal(n) {
    const num = parseInt(n);
    const s = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Generate real form badges from actual match results.
 */
function generateForm(teamName, matches) {
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
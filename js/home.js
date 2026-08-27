document.addEventListener('DOMContentLoaded', () => {
    initializeCountdown();
    initializeNews();
    initializeStats();
    syncQuickNextMatchPreviewListener();
});

let countdownInterval;
let newsListener = null;
let matchesListener = null;
let standingsListener = null;

function showGlobalModal(title, message, iconClass = 'fa-circle-info', theme = 'blue') {
    const modal = document.getElementById('globalModal');
    const titleEl = document.getElementById('modalTitle');
    const msgEl = document.getElementById('modalMessage');
    const iconContainer = document.getElementById('modalIcon');

    if (modal && titleEl && msgEl) {
        titleEl.textContent = title;
        msgEl.textContent = message;

        if (iconContainer) {
            iconContainer.className = `modal-icon ${theme}`;
            iconContainer.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
        }

        modal.classList.add('active');
    }
}

function closeGlobalModal() {
    const modal = document.getElementById('globalModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function initializeStats() {
    const TANGO_FC_NAME = 'tango fc';

    // 1. Initial Load
    const localStandings = await getAssetData('data/log.json');
    if (localStandings) applyStandingsToUI(localStandings, TANGO_FC_NAME);

    // 2. Real-time Firebase Sync
    if (window.db) {
        if (standingsListener) standingsListener();
        standingsListener = window.db.collection('settings').doc('standings').onSnapshot(doc => {
            if (doc.exists && doc.data().data) {
                try {
                    const parsed = JSON.parse(doc.data().data);
                    applyStandingsToUI(parsed, TANGO_FC_NAME);
                } catch (e) { console.error("Standings parse error", e); }
            }
        });
    }
}

function applyStandingsToUI(standings, tangoName) {
    if (!standings || !standings.rows) return;
    const tangoRow = standings.rows.find(r => r[1].toLowerCase().includes(tangoName));
    if (!tangoRow) return;

    const [pos, , played, w, d, l, , , , pts] = tangoRow;

    // Hero Live Stats (Tango FC Position Card)
    const heroPosNum = document.getElementById('heroPosNum');
    const heroLivePts = document.getElementById('heroLivePts');
    const heroLiveWins = document.getElementById('heroLiveWins');
    const heroLiveDraws = document.getElementById('heroLiveDraws');
    const heroLiveLosses = document.getElementById('heroLiveLosses');

    if (heroPosNum) heroPosNum.textContent = ordinal(pos);
    if (heroLivePts) heroLivePts.textContent = pts;
    if (heroLiveWins) heroLiveWins.textContent = w;
    if (heroLiveDraws) heroLiveDraws.textContent = d;
    if (heroLiveLosses) heroLiveLosses.textContent = l;

    // About Stats
    const aboutRank = document.getElementById('aboutRank');
    const aboutPts = document.getElementById('aboutPts');
    const aboutGames = document.getElementById('aboutGames');

    if (aboutRank) aboutRank.textContent = ordinal(pos);
    if (aboutPts) aboutPts.textContent = pts;
    if (aboutGames) aboutGames.textContent = played;
}

function ordinal(n) {
    const num = parseInt(n);
    const s = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (s[(v - 20) % 10] || s[v] || s[0]);
}

async function initializeCountdown() {
    const initialMatch = await getNextUpcomingMatch();
    if (initialMatch) {
        renderNextMatch([initialMatch]);
    } else {
        renderNextMatch([]);
    }

    // Prefer Firebase as the source of truth for live match data.
    if (window.db) {
        if (matchesListener) matchesListener();
        matchesListener = window.db.collection('matches').onSnapshot((snapshot) => {
            const liveMatches = snapshot.empty ? [] : snapshot.docs.map(doc => doc.data());
            renderNextMatch(liveMatches);
        });
    }
}

function getNextFutureMatch(allMatches) {
    const now = new Date();

    return [...allMatches]
        .filter(m => {
            if (!m || !m.date) return false;

            const dateValue = `${m.date}T${m.time || '00:00'}`;
            const matchDate = new Date(dateValue);
            if (Number.isNaN(matchDate.getTime()) || matchDate <= now) return false;

            const status = String(m.status || '').trim().toLowerCase();
            const upcomingStatuses = ['upcoming', 'scheduled', 'fixture', 'pending', 'upcoming match'];
            return upcomingStatuses.includes(status) || status === '' || (!['completed', 'result', 'finished'].includes(status) && !status.includes('cancelled'));
        })
        .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`))[0] || null;
}

function renderNextMatch(allMatches) {
    const nextMatch = getNextFutureMatch(allMatches);
    const quickOpponent = document.getElementById('quickNextOpponent');
    const quickDetails = document.getElementById('quickNextDetails');

    if (!nextMatch) {
        if (quickOpponent) quickOpponent.textContent = 'No upcoming match';
        if (quickDetails) quickDetails.textContent = 'Check fixtures';
        updateTimer(0, 0, 0, 0, true);
        return;
    }

    const opponent = (nextMatch.homeTeam || '').toLowerCase().includes('tango') ? (nextMatch.awayTeam || 'TBA') : (nextMatch.homeTeam || 'TBA');
    const matchDate = new Date(`${nextMatch.date}T${nextMatch.time || '00:00:00'}`);
    const formattedDate = matchDate.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    if (quickOpponent) quickOpponent.textContent = `vs. ${opponent}`;
    if (quickDetails) quickDetails.textContent = `${formattedDate} • ${nextMatch.time || 'TBA'} — ${nextMatch.venue || 'TBA'}`;

    const targetTimestamp = matchDate.getTime();
    if (countdownInterval) clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const difference = targetTimestamp - now;

        if (difference <= 0) {
            clearInterval(countdownInterval);
            updateTimer(0, 0, 0, 0, true);
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        updateTimer(days, hours, minutes, seconds, true);
    }, 1000);
}

function syncQuickNextMatchPreview() {
    const quickOpponent = document.getElementById('quickNextOpponent');
    const quickDetails = document.getElementById('quickNextDetails');

    if (!quickOpponent || !quickDetails) return;

    if (quickOpponent.textContent.includes('No upcoming match') || quickDetails.textContent.includes('Check fixtures')) {
        return;
    }
}

function syncQuickNextMatchPreviewListener() {
    const sync = () => syncQuickNextMatchPreview();
    sync();

    const targetNode = document.getElementById('nextMatchCountdown');
    if (!targetNode) return;

    const observer = new MutationObserver(sync);
    observer.observe(targetNode, { childList: true, subtree: true, characterData: true });
}

function updateTimer(days, hours, minutes, seconds, useBarIds = false) {
    const pad = (num) => num.toString().padStart(2, '0');
    const values = [pad(days), pad(hours), pad(minutes), pad(seconds)];

    const targetIds = ['barDays', 'barHours', 'barMins', 'barSecs'];
    const legacyIds = ['countdownDays', 'countdownHours', 'countdownMinutes', 'countdownSeconds'];
    const legacyQuickIds = ['quickCountdownDays', 'quickCountdownHours', 'quickCountdownMinutes', 'quickCountdownSeconds'];

    targetIds.forEach((id, index) => {
        const el = document.getElementById(id);
        if (el) el.textContent = values[index];
    });

    if (useBarIds) {
        legacyIds.forEach((id, index) => {
            const el = document.getElementById(id);
            if (el) el.textContent = values[index];
        });
        legacyQuickIds.forEach((id, index) => {
            const el = document.getElementById(id);
            if (el) el.textContent = values[index];
        });
    }
}

/**
 * Unified fetch with fallbacks and caching via AppConfig
 */
async function getAssetData(path) {
    try {
        const fetchFn = (window.AppConfig && window.AppConfig.fetchAsset) ? window.AppConfig.fetchAsset : localFetch;
        const res = await fetchFn(path);
        if (res.ok) return await res.json();
    } catch (e) {
        console.error(`Failed to fetch ${path}:`, e);
    }
    return null;
}

/**
 * Helper to fetch local JSON files using XHR for Android WebView compatibility.
 */
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

async function getNextUpcomingMatch() {
    try {
        let allMatches = [];
        if (window.db) {
            try {
                const fetchPromise = window.db.collection('matches').get();
                const snapshot = await (window.AppConfig?.withTimeout ? window.AppConfig.withTimeout(fetchPromise) : fetchPromise);

                if (!snapshot.empty) {
                    allMatches = snapshot.docs.map(doc => doc.data());
                }
            } catch (e) {
                console.warn("Firebase matches fetch failed or timed out, using fallback.", e.message);
            }
        }

        if (allMatches.length === 0) {
            allMatches = await getAssetData('data/matches.json') || [];
        }

        return getNextFutureMatch(allMatches);

    } catch (error) {
        console.error("Failed to get next match:", error);
        return null;
    }
}

/* =================================================================
   NEWS SECTION
================================================================= */

async function initializeNews() {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;

    newsGrid.innerHTML = `
        <div class="news-card skeleton-placeholder">
            <div class="news-img-wrap skeleton-pulse" style="height: 200px; background: rgba(255,255,255,0.05);"></div>
            <div class="news-body" style="gap: 10px;">
                <div class="skeleton-pulse" style="width: 40%; height: 12px; background: rgba(255,255,255,0.05); border-radius: 4px;"></div>
                <div class="skeleton-pulse" style="width: 85%; height: 20px; background: rgba(255,255,255,0.05); border-radius: 4px;"></div>
                <div class="skeleton-pulse" style="width: 100%; height: 40px; background: rgba(255,255,255,0.05); border-radius: 4px;"></div>
            </div>
        </div>
        <div class="news-card skeleton-placeholder" style="display: none;"></div>
    `;

    // 1. Initial Load from Local File
    const staticNews = await getAssetData('data/news.json') || [];
    renderNewsGrid(staticNews);

    // 2. Real-time Firebase Sync
    if (window.db) {
        if (newsListener) newsListener();
        newsListener = window.db.collection('news').orderBy('date', 'desc').onSnapshot((snapshot) => {
            if (!snapshot.empty) {
                const liveNews = snapshot.docs.map(doc => doc.data());

                // Merge static and live news (Live news IDs overwrite static if they match)
                const combined = new Map(staticNews.map(article => [article.id, article]));
                liveNews.forEach(article => combined.set(article.id, article));

                const sorted = Array.from(combined.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
                renderNewsGrid(sorted);
            }
        });
    }
}

function renderNewsGrid(articles) {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid || !articles.length) return;

    // Sort and limit to 6 items
    const sorted = articles.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
    newsGrid.innerHTML = sorted.map(article => buildNewsCard(article)).join('');
}

async function getLatestNews() {
    let firebaseNews = [];
    let staticNews = [];

    // Attempt to fetch live news from Firebase
    if (window.db) {
        try {
            // Apply 2s timeout to Firebase news fetch
            const fetchPromise = window.db.collection('news').orderBy('date', 'desc').get();
            const snapshot = await (window.AppConfig?.withTimeout ? window.AppConfig.withTimeout(fetchPromise) : fetchPromise);

            if (!snapshot.empty) {
                firebaseNews = snapshot.docs.map(doc => doc.data());
            }
        } catch (e) {
            console.warn("Firebase fetch news failed or timed out, will use fallback.", e.message);
        }
    }

    // Fetch static/default news from JSON file
    try {
        const staticNewsData = await getAssetData('data/news.json');
        if (staticNewsData) {
            staticNews = staticNewsData;
        }
    } catch (e) {
        console.error("Could not fetch static news.json", e);
    }

    // Combine and de-duplicate, giving priority to Firebase articles
    const combined = new Map(staticNews.map(article => [article.id, article]));
    firebaseNews.forEach(article => combined.set(article.id, article));

    // Sort the final combined list by date, newest first
    return Array.from(combined.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function buildNewsCard(article) {
    const date = new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Truncate title and subtitle for strict uniformity
    const maxTitleLength = 50;
    const truncatedTitle = article.title.length > maxTitleLength
        ? article.title.substring(0, maxTitleLength) + '...'
        : article.title;

    const maxSubtitleLength = 100;
    const truncatedSubtitle = article.subtitle.length > maxSubtitleLength
        ? article.subtitle.substring(0, maxSubtitleLength) + '...'
        : article.subtitle;

    return `
        <article class="news-card glass-card">
            <div class="news-img-wrap">
                <img src="${article.image || 'images/new2.jpg'}" alt="${article.title}" loading="lazy" onerror="this.src='images/tangoforces.jpg'">
                <div class="news-overlay"></div>
                ${article.tag ? `<span class="news-tag ${article.tagColor || 'blue-tag'}">${article.tag}</span>` : ''}
            </div>
            <div class="news-body">
                <p class="news-date"><i class="fa-regular fa-calendar"></i> ${date}</p>
                <h3 title="${article.title}">${truncatedTitle}</h3>
                <p class="news-excerpt">${truncatedSubtitle}</p>
            </div>
        </article>
    `;
}

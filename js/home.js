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
    const countdownSection = document.getElementById('nextMatchCountdown');
    if (!countdownSection) return;

    // 1. Load local data first
    const localMatches = await getAssetData('data/matches.json') || [];
    renderNextMatch(localMatches);

    // 2. Real-time sync from Firebase
    if (window.db) {
        if (matchesListener) matchesListener();
        matchesListener = window.db.collection('matches').onSnapshot((snapshot) => {
            if (!snapshot.empty) {
                const liveMatches = snapshot.docs.map(doc => doc.data());
                renderNextMatch(liveMatches);
            }
        });
    }
}

function renderNextMatch(allMatches) {
    const upcoming = allMatches
        .filter(m => m.status === 'upcoming' && new Date(`${m.date}T${m.time || '00:00'}`) > new Date())
        .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));

    const nextMatch = upcoming.length > 0 ? upcoming[0] : null;
    const countdownSection = document.getElementById('nextMatchCountdown');

    if (!nextMatch) {
        if (countdownSection) countdownSection.style.display = 'none';
        return;
    }

    // Populate match details
    const opponent = nextMatch.homeTeam.toLowerCase().includes('tango') ? nextMatch.awayTeam : nextMatch.homeTeam;
    document.getElementById('countdownOpponent').textContent = `vs. ${opponent}`;
    document.getElementById('countdownVenue').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${nextMatch.venue || 'TBA'}`;
    
    const matchDate = new Date(`${nextMatch.date}T${nextMatch.time || '00:00:00'}`);
    document.getElementById('countdownDate').innerHTML = `<i class="fa-solid fa-calendar-day"></i> ${matchDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;

    const targetTimestamp = matchDate.getTime();
    if (countdownInterval) clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const difference = targetTimestamp - now;

        if (difference <= 0) {
            clearInterval(countdownInterval);
            updateTimer(0, 0, 0, 0);
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        updateTimer(days, hours, minutes, seconds);
    }, 1000);

    if (countdownSection) countdownSection.style.display = 'block';
    syncQuickNextMatchPreview();
}

function syncQuickNextMatchPreview() {
    const opponentText = document.getElementById('countdownOpponent')?.textContent || 'vs. TBA';
    const dateText = document.getElementById('countdownDate')?.textContent || 'TBA';
    const venueText = document.getElementById('countdownVenue')?.textContent || 'TBA';

    const quickOpponent = document.getElementById('quickNextOpponent');
    const quickDetails = document.getElementById('quickNextDetails');

    if (quickOpponent) quickOpponent.textContent = opponentText;
    if (quickDetails) quickDetails.textContent = `${dateText.replace('calendar-day', '')} | ${venueText}`;
}

function syncQuickNextMatchPreviewListener() {
    const sync = () => syncQuickNextMatchPreview();
    sync();

    const targetNode = document.getElementById('nextMatchCountdown');
    if (!targetNode) return;

    const observer = new MutationObserver(sync);
    observer.observe(targetNode, { childList: true, subtree: true, characterData: true });
}

function updateTimer(days, hours, minutes, seconds) {
    const pad = (num) => num.toString().padStart(2, '0');
    document.getElementById('countdownDays').textContent = pad(days);
    document.getElementById('countdownHours').textContent = pad(hours);
    document.getElementById('countdownMinutes').textContent = pad(minutes);
    document.getElementById('countdownSeconds').textContent = pad(seconds);
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
                // Apply 2s timeout to Firebase call
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
// ... rest of the function

        const upcoming = allMatches
            .filter(m => m.status === 'upcoming' && new Date(`${m.date}T${m.time || '00:00'}`) > new Date())
            .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));

        return upcoming.length > 0 ? upcoming[0] : null;

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

    newsGrid.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Loading latest news...</p></div>';

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

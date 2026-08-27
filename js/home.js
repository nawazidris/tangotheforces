document.addEventListener('DOMContentLoaded', () => {
    initializeCountdown();
    initializeNews();
});

let countdownInterval;

async function initializeCountdown() {
    const countdownSection = document.getElementById('nextMatchCountdown');
    if (!countdownSection) return;

    // 1. DYNAMIC FIXTURE RETRIEVAL
    const nextMatch = await getNextUpcomingMatch();

    if (!nextMatch) {
        countdownSection.style.display = 'none';
        return;
    }

    // Populate match details
    const opponent = nextMatch.homeTeam.toLowerCase().includes('tango') ? nextMatch.awayTeam : nextMatch.homeTeam;
    document.getElementById('countdownOpponent').textContent = `vs. ${opponent}`;
    document.getElementById('countdownVenue').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${nextMatch.venue || 'TBA'}`;
    
    const matchDate = new Date(`${nextMatch.date}T${nextMatch.time || '00:00:00'}`);
    document.getElementById('countdownDate').innerHTML = `<i class="fa-solid fa-calendar-day"></i> ${matchDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;

    // 2. LIVE CALCULATION ENGINE
    const targetTimestamp = matchDate.getTime();

    // Clear any existing timer
    if (countdownInterval) clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const difference = targetTimestamp - now;

        if (difference <= 0) {
            // 3. GRACEFUL TRANSITION
            clearInterval(countdownInterval);
            updateTimer(0, 0, 0, 0);
            // Optionally, hide the widget or show a "Match in Progress" message
            // The system will auto-update to the next match on the next page load
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        updateTimer(days, hours, minutes, seconds);
    }, 1000);

    countdownSection.style.display = 'block';
}

function updateTimer(days, hours, minutes, seconds) {
    const pad = (num) => num.toString().padStart(2, '0');
    document.getElementById('countdownDays').textContent = pad(days);
    document.getElementById('countdownHours').textContent = pad(hours);
    document.getElementById('countdownMinutes').textContent = pad(minutes);
    document.getElementById('countdownSeconds').textContent = pad(seconds);
}

async function getNextUpcomingMatch() {
    try {
        let allMatches = [];
        if (window.db) {
            try {
                const snapshot = await window.db.collection('matches').get();
                if (!snapshot.empty) {
                    allMatches = snapshot.docs.map(doc => doc.data());
                }
            } catch (e) { /* Fallback below */ }
        }

        if (allMatches.length === 0) {
            const response = await fetch('data/matches.json');
            allMatches = response.ok ? await response.json() : [];
        }

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

    newsGrid.innerHTML = '<p>Loading latest news...</p>'; // Loading state

    try {
        const articles = await getLatestNews();

        if (!articles || articles.length === 0) {
            newsGrid.innerHTML = '<p>No news articles available at the moment.</p>';
            return;
        }

        // The first article is featured, the next two are secondary
        const [featured, ...secondary] = articles;

        const featuredHtml = buildNewsCard(featured, true);
        const secondaryHtml = secondary.slice(0, 4).map(article => buildNewsCard(article, false)).join('');

        newsGrid.innerHTML = featuredHtml + secondaryHtml;

    } catch (error) {
        console.error("Failed to initialize news section:", error);
        newsGrid.innerHTML = '<p>Could not load news. Please try again later.</p>';
    }
}

async function getLatestNews() {
    let firebaseNews = [];
    let staticNews = [];

    // Attempt to fetch live news from Firebase
    if (window.db) {
        try {
            const snapshot = await window.db.collection('news').orderBy('date', 'desc').get();
            if (!snapshot.empty) {
                firebaseNews = snapshot.docs.map(doc => doc.data());
            }
        } catch (e) {
            console.error("Firebase fetch news failed, will use fallback.", e);
        }
    }

    // Fetch static/default news from JSON file
    try {
        const response = await fetch('data/news.json');
        if (response.ok) {
            staticNews = await response.json();
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

function buildNewsCard(article, isFeatured) {
    const date = new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const imageClass = isFeatured ? '' : 'news-img-sm';
    let contentHtml = '';

    if (isFeatured && article.content && window.showdown) {
        const converter = new showdown.Converter();
        contentHtml = converter.makeHtml(article.content);
    }

    return `
        <article class="news-card ${isFeatured ? 'news-featured' : ''} glass-card">
            <div class="news-img-wrap ${imageClass}">
                <img src="${article.image || 'images/new2.jpg'}" alt="${article.title}" onerror="this.style.display='none'">
                <div class="news-overlay"></div>
                ${article.tag ? `<span class="news-tag ${article.tagColor || 'blue-tag'}">${article.tag}</span>` : ''}
            </div>
            <div class="news-body">
                <p class="news-date"><i class="fa-regular fa-calendar"></i> ${date}</p>
                <h3>${article.title}</h3>
                <p>${article.subtitle}</p>
                ${contentHtml ? `<div class="featured-content">${contentHtml}</div>` : ''}
            </div>
        </article>
    `;
}
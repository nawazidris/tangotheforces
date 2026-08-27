document.addEventListener("DOMContentLoaded", loadClubHistory);

async function loadClubHistory() {
    const mainContainer = document.querySelector('main');
    if (!mainContainer) return;

    // Save original static structure (headers, section tags)
    const originalContent = mainContainer.innerHTML;

    mainContainer.innerHTML = `
        <div class="loading-state" style="padding: 100px 0; text-align: center;">
            <div class="loading-spinner"></div>
            <p>Loading club history...</p>
        </div>
    `;

    try {
        const fetchFn = (window.AppConfig && window.AppConfig.fetchAsset) ? window.AppConfig.fetchAsset : fetch;

        // Try fetching history data
        const response = await fetchFn('data/history.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        // Restore main container structure and then render data into the placeholders
        mainContainer.innerHTML = originalContent;
        renderAll(data);
    } catch (error) {
        console.error("Failed to load or render history data:", error);
        mainContainer.innerHTML = `
            <div class="error-state" style="padding: 80px 6%; text-align: center;">
                <i class="fa-solid fa-circle-exclamation" style="font-size: 3.5rem; color: var(--red); margin-bottom: 24px;"></i>
                <h2 style="font-size: 1.8rem; margin-bottom: 12px;">Data Unavailable</h2>
                <p style="color: var(--muted); margin-bottom: 32px; max-width: 400px; margin-left: auto; margin-right: auto;">
                    We're having trouble loading the club history. This might be due to a poor connection.
                </p>
                <button onclick="window.location.reload()" class="btn-primary" style="padding: 14px 32px;">
                    <i class="fa-solid fa-arrows-rotate"></i> Try Again
                </button>
            </div>
        `;
    }
}


function renderAll(data) {
    displayClubInfo(data);
    displaySeasonStats(data.seasonStats);
    displayPhilosophy(data.clubPhilosophy);
    displayAchievements(data.achievements);
    displayTimeline(data.milestones);
}

function displayClubInfo(data) {
    const container = document.getElementById("clubInfo");
    if (!container) return;
    container.innerHTML = `
        <div class="club-details">
            <h3>${data.club}</h3>
            <p><strong>Founded:</strong> ${data.foundedYear}</p>
            <p><strong>Stadium:</strong> ${data.stadium} (Capacity ${data.capacity})</p>
            <p>${data.description}</p>
        </div>
    `;
}

function displaySeasonStats(seasonStats) {
    const container = document.getElementById("seasonStatsContainer");
    if (!container) return;

    const season = seasonStats["2025_26"];
    if (!season) return;

    // Calculate max goals for the progress bar scale
    const maxGoals = Math.max(...season.topScorers.map(p => p.goals), 1);

    container.innerHTML = `
        <div class="season-overview">
            <div class="stats-grid">
                <div class="stat-box">
                    <span class="stat-number">${season.played}</span>
                    <span class="stat-label">Played</span>
                </div>
                <div class="stat-box">
                    <span class="stat-number">${season.won}</span>
                    <span class="stat-label">Won</span>
                </div>
                <div class="stat-box">
                    <span class="stat-number">${season.drawn}</span>
                    <span class="stat-label">Drawn</span>
                </div>
                <div class="stat-box">
                    <span class="stat-number">${season.lost}</span>
                    <span class="stat-label">Lost</span>
                </div>
                <div class="stat-box">
                    <span class="stat-number">${season.points}</span>
                    <span class="stat-label">Points</span>
                </div>
            </div>
            <div class="top-scorers">
                <div class="scorer-header">
                    <h4>Top Goal Scorers</h4>
                    <i class="fa-solid fa-award gold-icon"></i>
                </div>
                ${season.topScorers.map((p, i) => {
                    const percentage = (p.goals / maxGoals) * 100;
                    const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : '';
                    const playerImg = getPlayerImagePath(p.name);

                    return `
                        <div class="scorer-card ${rankClass}">
                            <div class="scorer-avatar-wrap">
                                <img src="${playerImg}" class="scorer-img" alt="${p.name}" onerror="this.src='https://placehold.co/100x100?text=${p.name[0]}'">
                            </div>
                            <div class="scorer-details">
                                <div class="scorer-main-info">
                                    <span class="scorer-name">${p.name}</span>
                                    <span class="scorer-goals"><strong>${p.goals}</strong> goals</span>
                                </div>
                                <div class="scorer-progress">
                                    <div class="scorer-bar" style="width: ${percentage}%"></div>
                                </div>
                            </div>
                            <div class="scorer-badge">#${i + 1}</div>
                        </div>
                    `;
                }).join("")}
            </div>
        </div>
    `;
}

function getPlayerImagePath(name) {
    const n = name.toLowerCase();
    if (n.includes('edrice')) return 'images/idris.jpg';
    if (n.includes('svari'))  return 'images/svari.jpg';
    if (n.includes('jamela')) return 'images/jamela.jpg';

    // Generic fallback based on filename patterns observed in project
    return `images/${n.replace(/\s+/g, '')}.jpg`;
}

function displayPhilosophy(philosophy) {
    const container = document.getElementById("philosophyContainer");
    if (!container) return;

    container.innerHTML = `
        <h4>${philosophy.title}</h4>
        <p>${philosophy.description}</p>
        <div class="philosophy-pillars">
            ${philosophy.pillars.map(p => `
                <div class="pillar-card">
                    <h5>${p.name}</h5>
                    <p>${p.description}</p>
                </div>
            `).join("")}
        </div>
    `;
}

function displayAchievements(achievements) {
    const container = document.getElementById("achievementsContainer");
    if (!container) return;

    container.innerHTML = achievements.map(a => `
        <div class="achievement-card">
            <div class="achievement-year">${a.year}</div>
            <h4>${a.title}</h4>
            <p>${a.description}</p>
        </div>
    `).join("");
}

function displayTimeline(milestones) {
    const container = document.getElementById("timelineContainer");
    if (!container) return;

    container.innerHTML = milestones.map(m => {
        const parts = m.split(' - ');
        const year = parts[0] ? parts[0].trim() : '—';
        const description = parts.slice(1).join(' - ').trim();

        // Dynamic icons for visual flair
        let icon = 'fa-rocket';
        const d = description.toLowerCase();
        if (d.includes('founded')) icon = 'fa-flag-checkered';
        else if (d.includes('title') || d.includes('champions')) icon = 'fa-trophy';
        else if (d.includes('stadium') || d.includes('capacity')) icon = 'fa-building-columns';
        else if (d.includes('academy') || d.includes('youth')) icon = 'fa-graduation-cap';
        else if (d.includes('program')) icon = 'fa-seedling';
        else if (d.includes('top four') || d.includes('secured')) icon = 'fa-shield-halved';

        return `
            <div class="timeline-item">
                <div class="timeline-content glass-card">
                    <div class="milestone-header">
                        <span class="timeline-year">${year}</span>
                        <div class="milestone-icon"><i class="fa-solid ${icon}"></i></div>
                    </div>
                    <div class="timeline-description">${description}</div>
                </div>
            </div>
        `;
    }).join("");
}


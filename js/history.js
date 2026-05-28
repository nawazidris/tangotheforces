document.addEventListener("DOMContentLoaded", loadClubHistory);

function loadClubHistory(){
    let data;
    try {
        const inline = document.getElementById("clubHistoryData");
        if(inline){
            data = JSON.parse(inline.textContent);
            renderAll(data);
            return;
        }
    } catch(e) {
        console.warn("Inline JSON invalid");
    }
}

function renderAll(data){
    displayClubInfo(data);
    displaySeasonStats(data.seasonStats);
    displayPhilosophy(data.clubPhilosophy);
    displayAchievements(data.achievements);
    displayTimeline(data.milestones);
}

function displayClubInfo(data){
    const container = document.getElementById("clubInfo");
    if(!container) return;
    container.innerHTML = `
        <div class="club-details">
            <h3>${data.club}</h3>
            <p><strong>Founded:</strong> ${data.foundedYear}</p>
            <p><strong>Stadium:</strong> ${data.stadium} (Capacity ${data.capacity})</p>
            <p>${data.description}</p>
        </div>
    `;
}

function displaySeasonStats(seasonStats){
    const container = document.getElementById("seasonStatsContainer");
    const season = seasonStats["2025_26"];
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
                <h4>Top Goal Scorers</h4>
                ${season.topScorers.map((p,i)=>`
                    <div class="scorer-item">
                        <span>#${i+1}</span>
                        <span>${p.name}</span>
                        <span>${p.goals} Goals</span>
                    </div>
                `).join("")}
            </div>
        </div>
    `;
}

function displayPhilosophy(philosophy){
    const container = document.getElementById("philosophyContainer");
    container.innerHTML = `
        <h4>${philosophy.title}</h4>
        <p>${philosophy.description}</p>
        <div class="philosophy-pillars">
            ${philosophy.pillars.map(p=>`
                <div class="pillar-card">
                    <h5>${p.name}</h5>
                    <p>${p.description}</p>
                </div>
            `).join("")}
        </div>
    `;
}

function displayAchievements(achievements){
    const container = document.getElementById("achievementsContainer");
    container.innerHTML = achievements.map(a=>`
        <div class="achievement-card">
            <div class="achievement-year">${a.year}</div>
            <h4>${a.title}</h4>
            <p>${a.description}</p>
        </div>
    `).join("");
}

function displayTimeline(milestones){
    const container = document.getElementById("timelineContainer");
    container.innerHTML = milestones.map(m => {
        const [year, ...descriptionParts] = m.split(' - ');
        const description = descriptionParts.join(' - ').trim();
        return `
            <div class="timeline-item">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <div class="timeline-year">${year.trim()}</div>
                    <div class="timeline-description">${description}</div>
                </div>
            </div>
        `;
    }).join("");
}
let allPlayers = [];

document.addEventListener('DOMContentLoaded', () => {
    loadPlayers();
    setupFilters();
});

const getPositionPriority = (position = '') => {
    const normalized = String(position).trim().toLowerCase();
    if (normalized.includes('forward') || normalized.includes('striker') || normalized.includes('winger')) return 0;
    if (normalized.includes('mid')) return 1;
    if (normalized.includes('def')) return 2;
    if (normalized.includes('goal') || normalized.includes('keeper') || normalized.includes('goalkeeper')) return 3;
    return 4;
};

const sortRosterPlayers = (players) => {
    return [...players].sort((a, b) => {
        const priorityA = getPositionPriority(a.position);
        const priorityB = getPositionPriority(b.position);
        if (priorityA !== priorityB) return priorityA - priorityB;

        // Within the same category, sort by stats (goals + assists) descending
        const totalStatsA = (a.goals || 0) + (a.assists || 0);
        const totalStatsB = (b.goals || 0) + (b.assists || 0);
        if (totalStatsB !== totalStatsA) return totalStatsB - totalStatsA;

        // Fallback to jersey number
        if ((a.number || 0) !== (b.number || 0)) return (a.number || 0) - (b.number || 0);

        return String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' });
    });
};

let rosterListener = null;

async function loadPlayers() {
    const container = document.getElementById('rosterPlayers');
    if (!container) return;

    // 1. Instant local load
    try {
        const fetchFn = (window.AppConfig && window.AppConfig.fetchAsset) ? window.AppConfig.fetchAsset : fetch;
        const res = await fetchFn('data/players.json');
        if (res.ok) {
            allPlayers = sortRosterPlayers(await res.json());
            updateSquadStats(allPlayers);
            renderPlayers(allPlayers);
        }
    } catch (e) { console.warn("Initial roster load failed:", e); }

    // 2. Real-time Firebase Sync
    if (window.db) {
        if (rosterListener) rosterListener();
        console.log("[Roster] Subscribing to real-time updates...");

        rosterListener = window.db.collection('players').onSnapshot(snapshot => {
            if (!snapshot.empty) {
                const livePlayers = snapshot.docs.map(doc => doc.data());
                allPlayers = sortRosterPlayers(livePlayers);
                updateSquadStats(allPlayers);

                // Re-apply current filter
                const activeTab = document.querySelector('.filter-tab.active');
                const position = activeTab?.dataset.position || 'all';
                filterPlayers(position);
            }
        });
    }
}


function renderPlayers(playersToRender) {
    const container = document.getElementById('rosterPlayers');
    if (!container) return;
    
    container.innerHTML = '';

    if (!playersToRender || playersToRender.length === 0) {
        container.innerHTML = `<p class="empty-message">No players match the current filter.</p>`;
        return;
    }

    playersToRender.forEach(player => {
        try {
            const card = buildPlayerCard(player);
            if (card) {
                container.appendChild(card);
            }
        } catch (err) {
            console.error("Failed to render player card:", player, err);
        }
    });
}

function buildPlayerCard(player) {
    if (!player) return null;

    const card = document.createElement('article');
    const rawPosition = player.position || 'Forward';
    const positionClass = rawPosition.toLowerCase().trim().replace(/\s+/g, '-');
    
    card.className = `player-card pos-${positionClass}`;
    card.style.animationDelay = `${Math.random() * 0.5}s`;

    // Safe detail navigation click handler
    card.addEventListener('click', () => {
        try {
            localStorage.setItem('selectedPlayer', JSON.stringify(player));
            window.location.href = `player-detail.html?id=${player.id}`;
        } catch (e) {
            console.error("Failed to store selected player details:", e);
        }
    });

    const pillClass = {
        'forward': 'pill-forward',
        'midfielder': 'pill-midfielder',
        'defender': 'pill-defender',
        'goalkeeper': 'pill-goalkeeper'
    }[positionClass] || 'pill-forward';

    card.innerHTML = `
        <div class="player-photo-wrap">
            ${player.playerImage 
                ? `<img src="${player.playerImage}" alt="${player.name || 'Player'}" loading="lazy" onerror="this.style.display='none'">`
                : `<div class="player-photo-placeholder"><i class="fa-solid fa-user"></i></div>`
            }
            <div class="jersey-badge">#${player.number || '—'}</div>
            ${player.isNewSigning ? `<div class="new-badge">New</div>` : ''}
        </div>
        <div class="player-info">
            <h3 class="player-name">${player.name || 'Unnamed Player'}</h3>
            ${player.nickname ? `<p class="player-nickname">“${player.nickname}”</p>` : ''}
            <div class="position-pill ${pillClass}">${rawPosition}</div>
            <div class="player-stats-row" style="grid-template-columns: repeat(2, 1fr);">
                <div class="ps-stat">
                    <strong class="ps-val">${player.goals ?? 0}</strong>
                    <span class="ps-lbl">Goals</span>
                </div>
                <div class="ps-stat">
                    <strong class="ps-val">${player.assists ?? 0}</strong>
                    <span class="ps-lbl">Assists</span>
                </div>
            </div>
        </div>
    `;
    return card;
}

function updateSquadStats(players) {
    const positionCounts = {
        Forward: 0,
        Midfielder: 0,
        Defender: 0,
        Goalkeeper: 0
    };

    players.forEach(p => {
        if (p && p.position && positionCounts.hasOwnProperty(p.position)) {
            positionCounts[p.position]++;
        }
    });

    // Safe elements update block to prevent halts if IDs are missing from the DOM
    const setElementText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    setElementText('sq-total', players.length);
    setElementText('sq-forwards', positionCounts.Forward);
    setElementText('sq-midfielders', positionCounts.Midfielder);
    setElementText('sq-defenders', positionCounts.Defender);
    setElementText('sq-goalkeepers', positionCounts.Goalkeeper);
}

function setupFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const position = tab.dataset.position;
            filterPlayers(position);
        });
    });
}

function filterPlayers(position) {
    if (position === 'all') {
        renderPlayers(allPlayers);
    } else {
        const filtered = sortRosterPlayers(allPlayers.filter(p => p && p.position === position));
        renderPlayers(filtered);
    }
}
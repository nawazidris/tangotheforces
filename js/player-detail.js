const POSITION_ICONS = {
    Forward:    'fa-bolt',
    Midfielder: 'fa-crosshairs',
    Defender:   'fa-shield-halved',
    Goalkeeper: 'fa-hands',
};

const POSITION_PILL_CLASS = {
    Forward:    'pill-forward',
    Midfielder: 'pill-midfielder',
    Defender:   'pill-defender',
    Goalkeeper: 'pill-goalkeeper',
};

const CARD_POS_CLASS = {
    Forward:    'pos-forward',
    Midfielder: 'pos-midfielder',
    Defender:   'pos-defender',
    Goalkeeper: 'pos-goalkeeper',
};

function findPlayerById(id) {
    if (!id) {
        return null;
    }

    // First, try the 'selectedPlayer' from localStorage for speed.
    // This is set when a user clicks a card on the roster page.
    const selectedPlayerJson = localStorage.getItem('selectedPlayer');
    if (selectedPlayerJson) {
        const selectedPlayer = JSON.parse(selectedPlayerJson);
        if (selectedPlayer && String(selectedPlayer.id) === String(id)) {
            return selectedPlayer;
        }
    }
    // As a reliable fallback, use the same function as the roster page to get the full, merged player list.
    const allPlayers = getMergedPlayers();
    const player = allPlayers.find(p => String(p.id) === String(id));
    if (player) return player;
    return null;
}

function buildStatBlocks(player) {
    const pos = player.position || 'Forward';

    if (pos === 'Goalkeeper') {
        return `
            <div class="detail-stat"><strong>${player.cleansheets ?? 0}</strong><span>Clean Sheets</span></div>
            <div class="detail-stat"><strong>${player.SavePercentage ?? 0}%</strong><span>Save %</span></div>
        `;
    }

    let html = `
        <div class="detail-stat"><strong>${player.goals ?? 0}</strong><span>Goals</span></div>
        <div class="detail-stat"><strong>${player.assists ?? 0}</strong><span>Assists</span></div>
    `;

    if (pos === 'Defender' && player.cleansheets != null) {
        html += `<div class="detail-stat"><strong>${player.cleansheets}</strong><span>Clean Sheets</span></div>`;
    }

    return html;
}

function renderPlayer(player) {
    const root = document.getElementById('playerDetailRoot');
    if (!root) return;

    const pos = player.position || 'Forward';
    const posClass = CARD_POS_CLASS[pos] || 'pos-forward';
    const pillCls = POSITION_PILL_CLASS[pos] || 'pill-forward';
    const icon = POSITION_ICONS[pos] || 'fa-futbol';

    const photoHTML = player.playerImage
        ? `<img src="${player.playerImage}" alt="${player.name}"
               onerror="this.parentElement.innerHTML='<div class=\\'detail-photo-placeholder\\'>👤</div>'">`
        : `<div class="detail-photo-placeholder">👤</div>`;

    document.title = `${player.name} — Tango FC`;

    root.innerHTML = `
        <article class="detail-card ${posClass}">
            <div class="detail-photo-wrap">
                ${photoHTML}
                <span class="detail-jersey">#${player.number ?? '—'}</span>
            </div>
            <div class="detail-info">
                <h2 class="detail-name">${player.name}</h2>
                ${player.nickname ? `<p class="detail-nickname">"${player.nickname}"</p>` : ''}
                <div class="detail-meta">
                    <span class="detail-pill ${pillCls}">
                        <i class="fa-solid ${icon}"></i> ${pos}
                    </span>
                    ${player.isNewSigning ? '<span class="new-signing-tag"><i class="fa-solid fa-star"></i> New Signing</span>' : ''}
                </div>
                <div class="detail-stats-grid">
                    ${buildStatBlocks(player)}
                </div>
            </div>
        </article>
    `;
}

function renderNotFound() {
    const root = document.getElementById('playerDetailRoot');
    if (!root) return;

    root.innerHTML = `
        <div class="empty-state">
            <i class="fa-solid fa-user-slash" style="font-size:2.5rem;opacity:0.4;"></i>
            <p>Player not found. Visit the roster to browse the squad.</p>
            <a href="roster.html" class="btn-back-roster">
                <i class="fa-solid fa-users"></i> View Roster
            </a>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    const id = new URLSearchParams(window.location.search).get('id');
    const player = findPlayerById(id);

    if (player) {
        renderPlayer(player);
    } else {
        renderNotFound();
    }
});

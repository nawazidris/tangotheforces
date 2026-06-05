const basePlayers = [
    // Forwards
    { id: 1,  name: "Edrice Mujeyi",           nickname: "Nawaz",    position: "Forward",    number: 15, goals: 25, assists: 8,  playerImage: "images/idris.jpg"    },
    { id: 2,  name: "Blessing Zvinoitavamwe",  nickname: "Bleja",    position: "Forward",    number: 9,  goals: 22, assists: 6,  playerImage: "images/bleja.jpg"    },
    { id: 3,  name: "Abel Makuvise",           nickname: "Svari",    position: "Forward",    number: 11, goals: 18, assists: 5,  playerImage: "images/svari1.jpg"   },
    { id: 4,  name: "Vincent Mukumba",         nickname: "Vincho",   position: "Forward",    number: 7,  goals: 20, assists: 7,  playerImage: "images/vincho.jpg"   },
    { id: 5,  name: "Shephard Mukarati",       nickname: "PSG",      position: "Forward",    number: 17, goals: 19, assists: 9,  playerImage: "images/psg.jpg"      },
    { id: 6,  name: "Simbarashe Borerwa",      nickname: "Jah Bhora",position: "Forward",    number: 17, goals: 19, assists: 9,  playerImage: "images/jahbhora.jpg" },
    { id: 7,  name: "Godfrey Rwodzi",          nickname: "Goda",     position: "Forward",    number: 19, goals: 15, assists: 8,  playerImage: "images/goda.jpg"     },
    { id: 8,  name: "Kudzai Muganhu",          nickname: "Mahrez",     position: "Forward",    number: 30, goals: 15, assists: 8,  playerImage: "images/mahrez.jpg"     },

    // Midfielders
    { id: 9,  name: "Alious Jamela",           nickname: "Bambo",    position: "Midfielder", number: 8,  goals: 12, assists: 15, playerImage: "images/jamela.jpg"   },
    { id: 10, name: "Delight Mwadira",         nickname: "Mashefu",  position: "Midfielder", number: 13, goals: 8,  assists: 18, playerImage: "images/delo.jpg"     },
    { id: 11, name: "Milton Bosha",            nickname: "Milito",   position: "Midfielder", number: 4,  goals: 10, assists: 16, playerImage: "images/milito1.jpg"  },
    { id: 12, name: "Providence Mashuro",      nickname: "Shule",    position: "Midfielder", number: 17, goals: 6,  assists: 12, playerImage: "images/shule.jpg"    },
    { id: 13, name: "Blessed Shoko",           nickname: "Tsoko",    position: "Midfielder", number: 14, goals: 7,  assists: 14, playerImage: "images/shoko.jpg"    },
    { id: 14, name: "Edward Mapuranga",        nickname: "Dos",      position: "Midfielder", number: 14, goals: 7,  assists: 14, playerImage: "images/dos.jpg"      },
    { id: 15, name: "Tanaka Muganhu",           nickname: "Tan tan",     position: "Midfielder", number: 14, goals: 7,  assists: 14, playerImage: "images/yaya.jpg"     },
    { id: 16, name: "Author Masocha",          nickname: "Levels",   position: "Midfielder", number: 14, goals: 7,  assists: 14, playerImage: "images/levels.jpg"   },
    { id: 17, name: "Munyeketi Munyaradzi",         nickname: "Kimmich",   position: "Midfielder",   number: 16, goals: 5,  assists: 10, playerImage: "images/jimere.jpg"   },

    // Defenders
    { id: 18, name: "Lordship Sithole",        nickname: "Lord",     position: "Defender",   number: 5,  goals: 2,  assists: 3,  cleansheets: 16, playerImage: "images/lord.jpg"     },
    { id: 19, name: "Nokutenda Makumbe",       nickname: "Noku",     position: "Defender",   number: 4,  goals: 1,  assists: 2,  playerImage: "images/noku.jpg"     },
    { id: 19, name: "Gerald Wafawanaka",        nickname: "Gerrygold",    position: "Defender",   number: 3,  goals: 0,  assists: 1,  playerImage: "images/gerrygold.jpg"    },
    { id: 20, name: "Alban Makwarimba",        nickname: "Bhani",    position: "Defender",   number: 16, goals: 1,  assists: 2,  playerImage: "images/ban.jpg"      },
    { id: 21, name: "Musa Chasepa",            nickname: "Inter",    position: "Defender",   number: 2,  goals: 0,  assists: 0,  playerImage: "images/inter.jpg"    },
    { id: 22, name: "Patrick Chikwashiwa",   nickname: "Tsano",   position: "Defender",   number: 22, goals: 0,  assists: 0,  playerImage: "images/tsano.jpg"   },
    { id: 23, name: "Ian Pisirai",             nickname: "Ian",      position: "Defender",   number: 20, goals: 23, assists: 0,  playerImage: "images/ian.jpg"      },
    { id: 24, name: "Leeroy Mamombe",          nickname: "Maleedza", position: "Defender",   number: 24, goals: 0,  assists: 0,  playerImage: "images/maleedza.jpg" },
    { id: 25, name: "Bruce Tanaka Venganai",   nickname: "Tanaka",   position: "Defender",   number: 21, goals: 0,  assists: 0,  playerImage: "images/bruce.jpg"    },

    // Goalkeepers
    { id: 26, name: "Knowledge Sheche",  nickname: "Ba Rashy", position: "Goalkeeper", number: 1,  cleansheets: 20, SavePercentage: 60, playerImage: "images/rashy1.jpg" },
    { id: 27, name: "Forster Chikusvura",   nickname: "Fofo",    position: "Goalkeeper", number: 23, cleansheets: 2,  SavePercentage: 70, playerImage: "images/fofo.jpg"  },
];

let allPlayers = [];

/* ================= POSITION HELPERS ================= */
const POSITION_ORDER = { Forward: 1, Midfielder: 2, Defender: 3, Goalkeeper: 4 };

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

/* ================= LOAD PLAYERS ================= */
function loadAllPlayers() {
    allPlayers = [...basePlayers];

    const adminData = localStorage.getItem('adminPlayers');
    if (adminData) {
        const adminPlayers = JSON.parse(adminData).map(p => ({ ...p, isNewSigning: true }));
        allPlayers = [...allPlayers, ...adminPlayers];
    }

    // Make available to matches/stats pages
    localStorage.setItem('allPlayers', JSON.stringify(allPlayers));

    updateSquadStats(allPlayers);
}

/* ================= SQUAD STATS BAR ================= */
function updateSquadStats(players) {
    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    set('sq-total',       players.length);
    set('sq-forwards',    players.filter(p => p.position === 'Forward').length);
    set('sq-midfielders', players.filter(p => p.position === 'Midfielder').length);
    set('sq-defenders',   players.filter(p => p.position === 'Defender').length);
    set('sq-goalkeepers', players.filter(p => p.position === 'Goalkeeper').length);
}

/* ================= SORT ================= */
function sortPlayers(players) {
    return [...players].sort((a, b) => {
        const pa = POSITION_ORDER[a.position] || 5;
        const pb = POSITION_ORDER[b.position] || 5;
        if (pa !== pb) return pa - pb;
        return (a.name || '').localeCompare(b.name || '');
    });
}

/* ================= BUILD PLAYER CARD ================= */
function createPlayerCard(player, index) {
    const pos      = player.position || 'Forward';
    const posClass = CARD_POS_CLASS[pos]  || 'pos-forward';
    const pillCls  = POSITION_PILL_CLASS[pos] || 'pill-forward';
    const icon     = POSITION_ICONS[pos]  || 'fa-futbol';

    // Photo or emoji placeholder
    const photoHTML = player.playerImage
        ? `<img src="${player.playerImage}" alt="${player.name}"
               onerror="this.parentElement.innerHTML='<div class=\\'player-photo-placeholder\\'>👤</div>'">`
        : `<div class="player-photo-placeholder">👤</div>`;

    // Stats rows — different for GK vs outfield
    let statsHTML = '';
    if (pos === 'Goalkeeper') {
        statsHTML = `
            <div class="player-stats-row">
                <div class="ps-stat">
                    <span class="ps-val">${player.cleansheets ?? 0}</span>
                    <span class="ps-lbl">Clean Sheets</span>
                </div>
                <div class="ps-stat">
                    <span class="ps-val">${player.SavePercentage ?? 0}%</span>
                    <span class="ps-lbl">Save %</span>
                </div>
            </div>`;
    } else {
        statsHTML = `
            <div class="player-stats-row">
                <div class="ps-stat">
                    <span class="ps-val">${player.goals ?? 0}</span>
                    <span class="ps-lbl">Goals</span>
                </div>
                <div class="ps-stat">
                    <span class="ps-val">${player.assists ?? 0}</span>
                    <span class="ps-lbl">Assists</span>
                </div>
                ${(pos === 'Defender' && player.cleansheets != null)
                    ? `<div class="ps-stat">
                           <span class="ps-val">${player.cleansheets}</span>
                           <span class="ps-lbl">CS</span>
                       </div>`
                    : ''}
            </div>`;
    }

    const card = document.createElement('article');
    card.className = `player-card ${posClass}`;
    card.style.animationDelay = `${Math.min(index * 0.05, 0.6)}s`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${player.name} — ${pos}`);

    card.innerHTML = `
        <div class="player-photo-wrap">
            ${photoHTML}
            <span class="jersey-badge">#${player.number ?? '—'}</span>
            ${player.isNewSigning ? '<span class="new-badge">⭐ New</span>' : ''}
        </div>
        <div class="player-info">
            <div class="player-name">${player.name}</div>
            <div class="player-nickname">"${player.nickname || player.name}"</div>
            <span class="position-pill ${pillCls}">
                <i class="fa-solid ${icon}"></i> ${pos}
            </span>
            ${statsHTML}
        </div>
    `;

    // Navigate to player detail on click or Enter key
    const navigate = () => {
        localStorage.setItem('selectedPlayer', JSON.stringify(player));
        window.location.href = `player-detail.html?id=${player.id}`;
    };

    card.addEventListener('click', navigate);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') navigate(); });

    return card;
}

/* ================= DISPLAY ================= */
function displayPlayers(players) {
    const container = document.getElementById('rosterPlayers');
    if (!container) return;

    container.innerHTML = '';

    const sorted = sortPlayers(players);

    if (sorted.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-user-slash" style="font-size:2.5rem;opacity:0.4;"></i>
                <p>No players found for this position</p>
            </div>`;
        return;
    }

    sorted.forEach((player, i) => {
        container.appendChild(createPlayerCard(player, i));
    });
}

/* ================= INIT ================= */
document.addEventListener('DOMContentLoaded', () => {
    loadAllPlayers();
    displayPlayers(allPlayers);

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const pos = btn.dataset.position;
            const filtered = pos === 'all'
                ? allPlayers
                : allPlayers.filter(p => p.position === pos);

            displayPlayers(filtered);
        });
    });
});
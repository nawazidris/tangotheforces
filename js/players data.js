// js/players-data.js
// Single source of truth for the base squad.
// All pages load this file first, then call getMergedPlayers() to get
// the full squad with any admin edits/additions merged on top.

const basePlayers = [
    // Forwards
    { id: 1,  name: "Edrice Mujeyi",           nickname: "Nawaz",    position: "Forward",    number: 15, goals: 25, assists: 8,  playerImage: "images/idris.jpg" },
    { id: 2,  name: "Blessing Zvinoitavamwe",  nickname: "Bleja",    position: "Forward",    number: 9,  goals: 22, assists: 6,  playerImage: "images/bleja.jpg" },
    { id: 3,  name: "Abel Makuvise",           nickname: "Svari",    position: "Forward",    number: 11, goals: 18, assists: 5,  playerImage: "images/svari1.jpg" },
    { id: 4,  name: "Vincent Mukumba",         nickname: "Vincho",   position: "Forward",    number: 7,  goals: 20, assists: 7,  playerImage: "images/vincho.jpg" },
    { id: 5,  name: "Shephard Mukarati",       nickname: "PSG",      position: "Forward",    number: 17, goals: 19, assists: 9,  playerImage: "images/psg.jpg" },
    { id: 6,  name: "Simbarashe Borerwa",      nickname: "Jah Bhora",position: "Forward",    number: 17, goals: 19, assists: 9,  playerImage: "images/jahbhora.jpg" },
    { id: 7,  name: "Godfrey Rwodzi",          nickname: "Goda",     position: "Forward",    number: 19, goals: 15, assists: 8,  playerImage: "images/goda.jpg" },
    // Midfielders
    { id: 8,  name: "Alious Jamela",           nickname: "Bambo",    position: "Midfielder", number: 8,  goals: 12, assists: 15, playerImage: "images/jamela.jpg" },
    { id: 9,  name: "Delight Mwadira",         nickname: "Mashefu",  position: "Midfielder", number: 13, goals: 8,  assists: 18, playerImage: "images/delo.jpg" },
    { id: 10, name: "Milton Bosha",            nickname: "Milito",   position: "Midfielder", number: 4,  goals: 10, assists: 16, playerImage: "images/milito1.jpg" },
    { id: 11, name: "Providence Mashuro",      nickname: "Shule",    position: "Midfielder", number: 17, goals: 6,  assists: 12, playerImage: "images/shule.jpg" },
    { id: 12, name: "Blessed Shoko",           nickname: "Tsoko",    position: "Midfielder", number: 14, goals: 7,  assists: 14, playerImage: "images/shoko.jpg" },
    { id: 13, name: "Edward Mapuranga",        nickname: "Dos",      position: "Midfielder", number: 14, goals: 7,  assists: 14, playerImage: "images/dos.jpg" },
    { id: 14, name: "Abisha Gideon",           nickname: "Yaya",     position: "Midfielder", number: 14, goals: 7,  assists: 14, playerImage: "images/yaya.jpg" },
    { id: 15, name: "Author Masocha",          nickname: "Levels",   position: "Midfielder", number: 14, goals: 7,  assists: 14, playerImage: "images/levels.jpg" },
    { id: 16, name: "Tafadzwa Jimere",         nickname: "Jimere",   position: "Midfielder", number: 16, goals: 5,  assists: 10, playerImage: "images/jimere.jpg" },
    // Defenders
    { id: 17, name: "Lordship Sithole",        nickname: "Lord",     position: "Defender",   number: 5,  goals: 2,  assists: 3,  cleansheets: 16, playerImage: "images/lord.jpg" },
    { id: 18, name: "Nokutenda Makumbe",       nickname: "Noku",     position: "Defender",   number: 4,  goals: 1,  assists: 2,  playerImage: "images/noku.jpg" },
    { id: 19, name: "Saul Garira",             nickname: "Sauro",    position: "Defender",   number: 3,  goals: 0,  assists: 1,  playerImage: "images/sauro.jpg" },
    { id: 20, name: "Alban Makwarimba",        nickname: "Bhani",    position: "Defender",   number: 16, goals: 1,  assists: 2,  playerImage: "images/ban.jpg" },
    { id: 21, name: "Musa Chasepa",            nickname: "Inter",    position: "Defender",   number: 2,  goals: 0,  assists: 0,  playerImage: "images/inter.jpg" },
    { id: 22, name: "Washington Murambidza",   nickname: "Washco",   position: "Defender",   number: 22, goals: 0,  assists: 0,  playerImage: "images/washco.jpg" },
    { id: 23, name: "Ian Pisirai",             nickname: "Ian",      position: "Defender",   number: 20, goals: 23, assists: 0,  playerImage: "images/ian.jpg" },
    { id: 24, name: "Leeroy Mamombe",          nickname: "Maleedza", position: "Defender",   number: 24, goals: 0,  assists: 0,  playerImage: "images/maleedza.jpg" },
    { id: 25, name: "Bruce Tanaka Venganai",   nickname: "Tanaka",   position: "Defender",   number: 21, goals: 0,  assists: 0,  playerImage: "images/bruce.jpg" },
    // Goalkeepers
    { id: 26, name: "Knowledge Sheche",        nickname: "Ba Rashy", position: "Goalkeeper", number: 1,  cleansheets: 20, SavePercentage: 60, playerImage: "images/rashy1.jpg" },
    { id: 27, name: "Robert Marongwe",         nickname: "Robho",    position: "Goalkeeper", number: 23, cleansheets: 2,  SavePercentage: 20, playerImage: "images/robho.jpg" },
];

/**
 * getMergedPlayers()
 *
 * Returns the full squad by merging basePlayers with adminPlayers from
 * localStorage, while filtering out any explicitly deleted base players.
 */
function getMergedPlayers() {
    let adminPlayers = [];
    let deletedBaseIds = [];
    try {
        adminPlayers = JSON.parse(localStorage.getItem('adminPlayers') || '[]');
        deletedBaseIds = JSON.parse(localStorage.getItem('deletedBasePlayerIds') || '[]').map(Number);
    } catch (e) {
        console.warn('Could not parse admin players or deletions from localStorage:', e);
    }

    // 1. Filter out base players that have been deleted by the admin
    const activeBasePlayers = basePlayers.filter(p => !deletedBaseIds.includes(Number(p.id)));

    if (adminPlayers.length === 0) return [...activeBasePlayers];

    const adminMap = new Map(adminPlayers.map(p => [Number(p.id), p]));

    // 2. Map overrides onto the remaining active base players
    const merged = activeBasePlayers.map(p => adminMap.has(p.id) ? { ...p, ...adminMap.get(p.id) } : p);
    const baseIds = new Set(activeBasePlayers.map(p => p.id));

    // 3. Append entirely new players added by the admin
    adminPlayers.forEach(p => {
        const pId = Number(p.id);
        if (!baseIds.has(pId) && !deletedBaseIds.includes(pId)) {
            merged.push(p);
        }
    });

    return merged;
}
// js/players-data.js
// Single source of truth for the base squad.
// All pages load this file first, then call getMergedPlayers() to get
// the full squad with any admin edits/additions merged on top.

const basePlayers = [
    // Forwards
    { id: 1,  name: "Edrice Mujeyi",           nickname: "Nawaz",    position: "Forward",    number: 15, goals: 0, assists: 0,  playerImage: "images/idris.jpg" },
    { id: 2,  name: "Blessing Zvinoitavamwe",  nickname: "Bleja",    position: "Forward",    number: 9,  goals: 0, assists: 0,  playerImage: "images/bleja.jpg" },
    { id: 3,  name: "Abel Makuvise",           nickname: "Svari",    position: "Forward",    number: 11, goals: 0, assists: 0,  playerImage: "images/svari1.jpg" },
    { id: 4,  name: "Vincent Mukumba",         nickname: "Vincho",   position: "Forward",    number: 7,  goals: 0, assists: 0,  playerImage: "images/vincho.jpg" },
    { id: 5,  name: "Shephard Mukarati",       nickname: "PSG",      position: "Forward",    number: 16, goals: 0, assists: 0,  playerImage: "images/psg.jpg" },
    { id: 6,  name: "Simbarashe Borerwa",      nickname: "Jah Bhora",position: "Forward",    number: 17, goals: 0, assists: 0,  playerImage: "images/goda.jpg" },
    { id: 28, name: "Tafadzwa Magande",        nickname: "Tife",     position: "Forward",    number: 18, goals: 0, assists: 0,  playerImage: "images/default-player.png" },
    { id: 7,  name: "Godfrey Rwodzi",          nickname: "Goda",     position: "Forward",    number: 19, goals: 0, assists: 0,  playerImage: "images/goda.jpg" },
    // Midfielders
    { id: 8,  name: "Alious Jamela",           nickname: "Bambo",    position: "Midfielder", number: 8,  goals: 0, assists: 0, playerImage: "images/jamela.jpg" },
    { id: 9,  name: "Delight Mwadira",         nickname: "Mashefu",  position: "Midfielder", number: 13, goals: 0,  assists: 0, playerImage: "images/default-player.png" },
    { id: 10, name: "Milton Bosha",            nickname: "Milito",   position: "Midfielder", number: 4,  goals: 0, assists: 0, playerImage: "images/milito1.jpg" },
    { id: 11, name: "Providence Mashuro",      nickname: "Shule",    position: "Midfielder", number: 17, goals: 0,  assists: 0, playerImage: "images/shule.jpg" },
    { id: 12, name: "Blessed Shoko",           nickname: "Tsoko",    position: "Midfielder", number: 14, goals: 0,  assists: 0, playerImage: "images/shoko.jpg" },
    { id: 13, name: "Edward Mapuranga",        nickname: "Dos",      position: "Midfielder", number: 14, goals: 0,  assists: 0, playerImage: "images/dos.jpg" },
    { id: 14, name: "Abisha Gideon",           nickname: "Yaya",     position: "Midfielder", number: 14, goals: 0,  assists: 0, playerImage: "images/default-player.png" },
    { id: 15, name: "Author Masocha",          nickname: "Levels",   position: "Midfielder", number: 14, goals: 0,  assists: 0, playerImage: "images/levels.jpg" },
    { id: 16, name: "Tafadzwa Jimere",         nickname: "Jimere",   position: "Midfielder", number: 16, goals: 0,  assists: 0, playerImage: "images/jimere.jpg" },
    // Defenders
    { id: 17, name: "Lordship Sithole",        nickname: "Lord",     position: "Defender",   number: 5,  goals: 0,  assists: 0,  cleansheets: 16, playerImage: "images/lord.jpg" },
    { id: 18, name: "Nokutenda Makumbe",       nickname: "Noku",     position: "Defender",   number: 4,  goals: 0,  assists: 0,  playerImage: "images/noku.jpg" },
    { id: 19, name: "Panashe Vaiya",           nickname: "Maluwa",    position: "Defender",   number: 3,  goals: 0,  assists: 0,  playerImage: "images/maluwa.jpg" },
    { id: 20, name: "Alban Makwarimba",        nickname: "Bhani",    position: "Defender",   number: 16, goals: 0,  assists: 0,  playerImage: "images/ban.jpg" },
    { id: 21, name: "Musa Chasepa",            nickname: "Inter",    position: "Defender",   number: 2,  goals: 0,  assists: 0,  playerImage: "images/inter.jpg" },
    { id: 22, name: "Washington Murambidza",   nickname: "Washco",   position: "Defender",   number: 22, goals: 0,  assists: 0,  playerImage: "images/washco.jpg" },
    { id: 23, name: "Ian Pisirai",             nickname: "Ian",      position: "Defender",   number: 20, goals: 0, assists: 0,  playerImage: "images/ian.jpg" },
    { id: 24, name: "Leeroy Mamombe",          nickname: "Maleedza", position: "Defender",   number: 24, goals: 0,  assists: 0,  playerImage: "images/maleedza.jpg" },
    { id: 25, name: "Bruce Tanaka Venganai",   nickname: "Tanaka",   position: "Defender",   number: 21, goals: 0,  assists: 0,  playerImage: "images/bruce.jpg" },
    // Goalkeepers
    { id: 26, name: "Knowledge Sheche",        nickname: "Ba Rashy", position: "Goalkeeper", number: 1,  cleansheets: 20, SavePercentage: 60, playerImage: "images/rashy1.jpg" },
    { id: 27, name: "Forster Chikusvura",         nickname: "Fofo",    position: "Goalkeeper", number: 23, cleansheets: 3,  SavePercentage: 60, playerImage: "images/fofo.jpg" },
];
// js/player-service.js

/**
 * A singleton service to fetch, cache, and provide lookup for player data.
 * This avoids multiple fetches across different pages and provides a consistent
 * source of player information.
 */
const PlayerService = (function() {
    let players = [];
    let playersPromise = null;
    let nameToNicknameMap = new Map();

    const initialize = async () => {
        if (players.length > 0) return players;

        let playerData = [];
        if (window.db) {
            try {
                const snapshot = await window.db.collection('players').get();
                if (!snapshot.empty) {
                    playerData = snapshot.docs.map(doc => doc.data());
                }
            } catch (e) { /* fallback */ }
        }

        if (playerData.length === 0 && typeof basePlayers !== 'undefined') {
            playerData = basePlayers;
        }

        players = playerData;
        players.forEach(p => {
            if (p.name && p.nickname) {
                nameToNicknameMap.set(p.name.trim().toLowerCase(), p.nickname);
            }
        });
        return players;
    };

    return {
        getPlayers: () => playersPromise || (playersPromise = initialize()),
        getNickname: (fullName) => nameToNicknameMap.get(fullName?.trim().toLowerCase()) || fullName,
    };
})();
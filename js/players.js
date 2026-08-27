const players = [
    {
        id: 1,
        name: "Carlos Mendez",
        nickname: "The Striker",
        position: "Forward",
        number: 10,
        goals: 25,
        assists: 8,
        image: "⚽",
        age: 26,
        nationality: "Argentina"
    },
    {
        id: 2,
        name: "Diego Silva",
        nickname: "El Maestro",
        position: "Midfielder",
        number: 7,
        goals: 12,
        assists: 15,
        image: "⚽",
        age: 28,
        nationality: "Brazil"
    },
    {
        id: 3,
        name: "Juan Rodriguez",
        nickname: "The Wall",
        position: "Defender",
        number: 4,
        goals: 2,
        assists: 3,
        image: "⚽",
        age: 30,
        nationality: "Spain"
    },
    {
        id: 4,
        name: "Marco Rossi",
        nickname: "Safe Hands",
        position: "Goalkeeper",
        number: 1,
        goals: 0,
        assists: 0,
        image: "🧤",
        age: 32,
        nationality: "Italy"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const featuredPlayersContainer = document.getElementById('featuredPlayers');
    
    if (featuredPlayersContainer) {
        const featured = players.slice(0, 4);
        featured.forEach(player => {
            const playerCube = createPlayerCube(player);
            featuredPlayersContainer.appendChild(playerCube);
        });
    }
});

function createPlayerCube(player) {
    const cubeWrapper = document.createElement('div');
    cubeWrapper.className = 'player-cube-wrapper';
    
    const cube = document.createElement('div');
    cube.className = 'player-cube';
    
    // Front face - Name and Image
    const frontFace = document.createElement('div');
    frontFace.className = 'cube-face front-face';
    frontFace.innerHTML = `
        <div class="player-front-content">
            <div class="player-image-large">${player.image}</div>
            <h3>${player.name}</h3>
            <p class="jersey">#${player.number}</p>
        </div>
    `;
    
    // Back face - Stats
    const backFace = document.createElement('div');
    backFace.className = 'cube-face back-face';
    backFace.innerHTML = `
        <div class="player-stats-large">
            <h4>Career Stats</h4>
            <div class="stat-item">
                <span class="stat-label">Goals</span>
                <span class="stat-value">${player.goals}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Assists</span>
                <span class="stat-value">${player.assists}</span>
            </div>
        </div>
    `;
    
    // Right face - Position
    const rightFace = document.createElement('div');
    rightFace.className = 'cube-face right-face';
    rightFace.innerHTML = `
        <div class="player-position-large">
            <h4>Position</h4>
            <p class="position-text">${player.position}</p>
            <div class="position-badge">${player.position.charAt(0)}</div>
        </div>
    `;
    
    // Left face - Nickname
    const leftFace = document.createElement('div');
    leftFace.className = 'cube-face left-face';
    leftFace.innerHTML = `
        <div class="player-nickname-large">
            <h4>Nickname</h4>
            <p class="nickname-text">"${player.nickname}"</p>
        </div>
    `;
    
    // Top face - Info
    const topFace = document.createElement('div');
    topFace.className = 'cube-face top-face';
    topFace.innerHTML = `
        <div class="player-info">
            <div class="info-item">
                <span class="info-label">Age</span>
                <span class="info-value">${player.age}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Nationality</span>
                <span class="info-value">${player.nationality}</span>
            </div>
        </div>
    `;
    
    // Bottom face - Extra
    const bottomFace = document.createElement('div');
    bottomFace.className = 'cube-face bottom-face';
    bottomFace.innerHTML = `
        <div class="player-highlight">
            <h4>Player Info</h4>
            <p>${player.position} • #${player.number}</p>
        </div>
    `;
    
    cube.appendChild(frontFace);
    cube.appendChild(backFace);
    cube.appendChild(rightFace);
    cube.appendChild(leftFace);
    cube.appendChild(topFace);
    cube.appendChild(bottomFace);
    
    cubeWrapper.appendChild(cube);
    return cubeWrapper;
}

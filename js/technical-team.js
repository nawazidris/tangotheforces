const technicalTeam = [
    {
        id: 1,
        name: "Taruvinga Mutangiranwa",
        role: "CEO",
        title: "Chief Executive Officer",
        image: "images/tango.jpg",
        experience: "10 years",
        description: "Leading the club with vision"
    },
    {
        id: 2,
        name: "Alious Jamela",
        role: "Director",
        title: "Football Director",
        image: "images/jamela.jpg",
        experience: "10 years",
        description: "Overseeing football operations"
    },
    {
        id: 3,
        name: "Pride Chikunguru",
        role: "Team Manager",
        title: "Team Manager - Logistics & Operations",
        image: "images/thembie.jpg",
        experience: "7 years",
        description: "Leading team strategy"
    },
    {
        id: 4,
        name: "Edrice Mujeyi",
        role: "Captain",
        title: "Team Captain",
        image: "images/idris.jpg",
        experience: "8 years",
        description: "Team Captain - Player Coach"
    },
    {
        id: 5,
        name: "Newsber Kwangwa",
        role: "Coach",
        title: "Assistant Coach - Offensive",
        image: "images/newz.jpg",
        experience: "8 years",
        description: "Offensive strategy specialist"
    },
    {
        id: 6,
        name: "Robert Marongwe",
        role: "Assistant Coach",
        title: "Goalkeeper Coach - Defensive",
        image: "images/robho.jpg",
        experience: "7 years",
        description: "Defensive tactics expert"
    },
    {
        id: 7,
        name: "Milton Bosha",
        role: "Logistics Manager",
        title: "Logistics Manager",
        image: "images/milito1.jpg",
        experience: "8 years",
        description: "Logistics and Operations Manager"
    },
    {
        id: 8,
        name: "Paida Tsuro",
        role: "Head of Recruitment",
        title: "Chief Scout",
        image: "images/paida.jpg",
        experience: "8 years",
        description: "Recruitment Analyst"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const technicalContainer = document.getElementById('technicalTeam');
    
    if (technicalContainer) {
        // Grouping logic based on user request:
        // Row 1: CEO
        // Row 2: Director & Team Manager
        // Row 3: Captain & Logistics Manager
        // Row 4: Last 3 (Coach, Assistant Coach, Head of Recruitment)

        const findByRole = (role) => technicalTeam.find(m => m.role.toLowerCase() === role.toLowerCase());

        const ceo = findByRole('CEO');
        const director = findByRole('Director');
        const teamManager = findByRole('Team Manager');
        const captain = findByRole('Captain');
        const logisticsManager = findByRole('Logistics Manager');

        // The "Last 3" (those not explicitly placed above)
        const topRoles = ['ceo', 'director', 'team manager', 'captain', 'logistics manager'];
        const last3 = technicalTeam.filter(m => !topRoles.includes(m.role.toLowerCase()));

        const appendRow = (members, name) => {
            const filtered = members.filter(Boolean);
            if (!filtered.length) return;
            const row = document.createElement('div');
            row.className = `technical-row ${name}`;
            filtered.forEach(member => row.appendChild(createTechnicalCard(member)));
            technicalContainer.appendChild(row);
        };

        // Row 1
        appendRow([ceo], 'row-ceo');

        // Row 2
        appendRow([director, teamManager], 'row-tier-2');

        // Row 3
        appendRow([captain, logisticsManager], 'row-tier-3');

        // Row 4
        appendRow(last3, 'row-tier-4');
    }
});

function createTechnicalCard(member) {
    const card = document.createElement('div');
    card.className = `technical-card ${member.role.toLowerCase().replace(/\s+/g, '-')}`;
    card.innerHTML = `
        <div class="technical-card-inner">
            <div class="technical-image">
                <img src="${member.image}" alt="${member.name}" class="team-member-photo" loading="lazy">
            </div>
            <h3>${member.name}</h3>
            <div><span class="member-role">${member.role}</span></div>
            <p class="member-title">${member.title}</p>
            <div class="member-info">
                <span class="experience"><i class="fa-regular fa-calendar-days" style="margin-right: 5px; color: var(--blue);"></i> ${member.experience} Exp</span>
            </div>
            <p class="member-description">"${member.description}"</p>
        </div>
    `;
    return card;
}
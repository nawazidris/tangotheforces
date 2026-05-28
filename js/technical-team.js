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
        // Build hierarchy for responsive display: 1 card (CEO), then 3 cards, then 4 cards
        const ceo = technicalTeam.find(m => m.role.toLowerCase() === 'ceo') || technicalTeam[0];
        const others = technicalTeam.filter(m => m !== ceo);
        const rowCounts = [3, 4];

        const appendRow = (members, name) => {
            if (!members.length) return;
            const row = document.createElement('div');
            row.className = `technical-row ${name}`;
            members.forEach(member => row.appendChild(createTechnicalCard(member)));
            technicalContainer.appendChild(row);
        };

        if (ceo) {
            appendRow([ceo], 'top');
        }

        let offset = 0;
        rowCounts.forEach((count, index) => {
            const members = others.slice(offset, offset + count);
            offset += members.length;
            appendRow(members, `row-${index + 2}`);
        });

        if (offset < others.length) {
            appendRow(others.slice(offset), 'row-extra');
        }
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
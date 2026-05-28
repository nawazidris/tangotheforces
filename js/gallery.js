const galleryPhotos = [
    // 2026 Season Category (Preserved original links from local database)
    { id: 300, src: 'images/new1.jpeg', title: '2026 Squad Presentation Launch', sub: 'newseason' },
    { id: 301, src: 'images/new2.jpeg', title: 'Tactical Drill Session Frame 1', sub: 'newseason' },
    { id: 302, src: 'images/new3.jpeg', title: 'Tactical Drill Session Frame 2', sub: 'newseason' },
    { id: 303, src: 'images/new4.jpeg', title: 'Tactical Drill Session Frame 3', sub: 'newseason' },
    { id: 304, src: 'images/new5.jpeg', title: 'Tactical Drill Session Frame 4', sub: 'newseason' },
    { id: 305, src: 'images/new6.jpeg', title: 'Tactical Drill Session Frame 5', sub: 'newseason' },
    { id: 306, src: 'images/new7.jpeg', title: 'Tactical Drill Session Frame 6', sub: 'newseason' },
    { id: 307, src: 'images/new8.jpeg', title: 'Tactical Drill Session Frame 7', sub: 'newseason' },
    { id: 308, src: 'images/new9.jpeg', title: 'Tactical Drill Session Frame 8', sub: 'newseason' },
    { id: 309, src: 'images/new10.jpeg', title: 'Tactical Drill Session Frame 9', sub: 'newseason' },
    { id: 310, src: 'images/new11.jpeg', title: 'Tactical Drill Session Frame 10', sub: 'newseason' },
    { id: 311, src: 'images/new12.jpeg', title: 'Tactical Drill Session Frame 11', sub: 'newseason' },
    { id: 312, src: 'images/new13.jpeg', title: 'Tactical Drill Session Frame 12', sub: 'newseason' },
    { id: 313, src: 'images/new14.jpeg', title: 'Tactical Drill Session Frame 13', sub: 'newseason' },
    { id: 314, src: 'images/new15.jpeg', title: 'Tactical Drill Session Frame 14', sub: 'newseason' },
    { id: 315, src: 'images/new16.jpeg', title: 'Tactical Drill Session Frame 15', sub: 'newseason' },
    { id: 316, src: 'images/new17.jpeg', title: 'Tactical Drill Session Frame 16', sub: 'newseason' },
    { id: 317, src: 'images/new18.jpeg', title: 'Tactical Drill Session Frame 17', sub: 'newseason' },
    { id: 318, src: 'images/new19.jpeg', title: 'Tactical Drill Session Frame 18', sub: 'newseason' },
    { id: 319, src: 'images/new20.jpeg', title: 'Tactical Drill Session Frame 19', sub: 'newseason' },
    { id: 320, src: 'images/new21.jpeg', title: 'Tactical Drill Session Frame 20', sub: 'newseason' },
    { id: 321, src: 'images/new22.jpeg', title: 'Tactical Drill Session Frame 21', sub: 'newseason' },
    { id: 322, src: 'images/new23.jpeg', title: 'Tactical Drill Session Frame 22', sub: 'newseason' },
    { id: 323, src: 'images/new24.jpeg', title: 'Tactical Drill Session Frame 23', sub: 'newseason' },
    { id: 324, src: 'images/new25.jpeg', title: 'Tactical Drill Session Frame 24', sub: 'newseason' },
    { id: 325, src: 'images/new26.jpeg', title: 'Tactical Drill Session Frame 25', sub: 'newseason' },
    { id: 326, src: 'images/new27.jpeg', title: 'Tactical Drill Session Frame 26', sub: 'newseason' },
    { id: 327, src: 'images/new28.jpeg', title: 'Tactical Drill Session Frame 27', sub: 'newseason' },

    // Matchday Active Categories
    { id: 401, src: 'images/tango3.jpg', title: 'Matchday Squad Warm-up Session', sub: 'matchday' },
    { id: 402, src: 'images/tango4.jpg', title: 'In-Game Action Sequence Log', sub: 'matchday' },
    { id: 403, src: 'images/tango5.jpg', title: 'Pitch Side Team Assembly', sub: 'matchday' },
    

    // Champions Category
    { id: 501, src: 'images/tango1.jpg', title: 'MOSSL Shield Presentation Celebration', sub: 'champions' },
    { id: 502, src: 'images/tango2.jpg', title: 'Official Champions Victory Group Photo', sub: 'champions' }
];

let currentImages = [];
let currentIndex = 0;

function renderGallery(filterType = 'all') {
    const grids = {
        newseason: document.getElementById('newseasonPicturesGrid'),
        matchday: document.getElementById('matchdayPicturesGrid'),
        champions: document.getElementById('celebrationsPicturesGrid')
    };

    const sections = {
        newseason: document.getElementById('sect-newseason'),
        matchday: document.getElementById('sect-matchday'),
        champions: document.getElementById('sect-champions')
    };

    Object.values(grids).forEach(g => { if (g) g.innerHTML = ''; });

    if (filterType === 'all') {
        currentImages = [...galleryPhotos];
        Object.values(sections).forEach(s => { if (s) s.style.display = 'block'; });
    } else {
        currentImages = galleryPhotos.filter(p => p.sub === filterType);
        Object.keys(sections).forEach(key => {
            if (sections[key]) {
                sections[key].style.display = key === filterType ? 'block' : 'none';
            }
        });
    }

    currentImages.forEach(photo => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <div class="gallery-item-img-wrapper">
                <img src="${photo.src}" loading="lazy" alt="${photo.title}">
            </div>
            <p>${photo.title}</p>
        `;

        item.addEventListener('click', () => openLightbox(photo.src));

        if (grids[photo.sub]) {
            grids[photo.sub].appendChild(item);
        }
    });
}

function filterGallery(type) {
    document.querySelectorAll('.gallery-filters button').forEach(btn => {
        btn.classList.remove('active');
    });

    if (event && event.target) {
        event.target.classList.add('active');
    }

    renderGallery(type);
}

function openLightbox(src) {
    currentIndex = currentImages.findIndex(img => img.src === src);
    const lightboxImg = document.getElementById('lightboxImage');
    const lightbox = document.getElementById('lightbox');
    
    if (lightboxImg && lightbox) {
        lightboxImg.src = src;
        lightbox.style.display = 'flex';
    }
}

function changeImage(direction) {
    if (currentImages.length === 0) return;

    currentIndex += direction;
    if (currentIndex < 0) currentIndex = currentImages.length - 1;
    if (currentIndex >= currentImages.length) currentIndex = 0;

    const lightboxImg = document.getElementById('lightboxImage');
    if (lightboxImg) {
        lightboxImg.src = currentImages[currentIndex].src;
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) lightbox.style.display = 'none';
}

document.getElementById('lightbox')?.addEventListener('click', (e) => {
    if (e.target.id === 'lightbox' || e.target.classList.contains('lightbox-content-container')) {
        closeLightbox();
    }
});

document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox && lightbox.style.display === 'flex') {
        if (e.key === 'ArrowLeft') changeImage(-1);
        if (e.key === 'ArrowRight') changeImage(1);
        if (e.key === 'Escape') closeLightbox();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    renderGallery('all');
});
const galleryPhotos = [
    // 2026 Season Category (Preserved original links from local database)
    { id: 300, src: 'images/new1.jpeg', title: '2026 New Kit Presentation Launch', sub: 'newseason' },
    { id: 301, src: 'images/new2.jpeg', title: 'New Kit Launch', sub: 'newseason' },
    { id: 302, src: 'images/new3.jpeg', title: 'New Kit Launch', sub: 'newseason' },
    { id: 303, src: 'images/new4.jpeg', title: 'New Kit Launch', sub: 'newseason' },
    { id: 304, src: 'images/new5.jpeg', title: 'New Kit Launch', sub: 'newseason' },
    { id: 305, src: 'images/new6.jpeg', title: 'New Kit Launch', sub: 'newseason' },
    { id: 306, src: 'images/new7.jpeg', title: 'New Kit Launch', sub: 'newseason' },
    { id: 307, src: 'images/new8.jpeg', title: 'New Kit Launch', sub: 'newseason' },
    { id: 308, src: 'images/new9.jpeg', title: 'New Kit Launch', sub: 'newseason' },
    { id: 309, src: 'images/new10.jpeg', title: 'New Kit Launch', sub: 'newseason' },
    { id: 310, src: 'images/new11.jpeg', title: '2026 First Match', sub: 'newseason' },
    { id: 311, src: 'images/new12.jpeg', title: 'Tactical Drill Session', sub: 'newseason' },
    { id: 312, src: 'images/new13.jpeg', title: 'Tactical Session ', sub: 'newseason' },
    { id: 313, src: 'images/new14.jpeg', title: 'Celebrating 3 Points', sub: 'newseason' },
    { id: 314, src: 'images/new15.jpeg', title: 'Celebrating 3 Points', sub: 'newseason' },
    { id: 315, src: 'images/new16.jpeg', title: 'Celebrating 3 Points', sub: 'newseason' },
    { id: 316, src: 'images/new17.jpeg', title: 'Celebrating 3 Points', sub: 'newseason' },
 

    // Matchday Active Categories
    { id: 401, src: 'images/tango1.jpg', title: 'Matchday Squad Warm-up Session', sub: 'matchday' },
    { id: 402, src: 'images/tango2.jpg', title: 'In-Game Action Sequence Log', sub: 'matchday' },
    { id: 403, src: 'images/tango3.jpg', title: 'Pitch Side Team Assembly', sub: 'matchday' },
    { id: 401, src: 'images/tango4.jpg', title: 'Matchday Squad Warm-up Session', sub: 'matchday'},
    { id: 401, src: 'images/tango5.jpg', title: 'Matchday Squad Warm-up Session', sub: 'matchday'},
    { id: 401, src: 'images/tango6.jpg', title: 'Matchday Squad Warm-up Session', sub: 'matchday'},
    { id: 402, src: 'images/tango7.jpg', title: 'In-Game Action Sequence Log', sub: 'matchday'},
    { id: 402, src: 'images/tango8.jpg', title: 'In-Game Action Sequence Log', sub: 'matchday'},
    { id: 402, src: 'images/tango9.jpg', title: 'In-Game Action Sequence Log', sub: 'matchday'},
    { id: 403, src: 'images/tango10.jpg', title: 'Pitch Side Team Assembly', sub: 'matchday'},
    { id: 403, src: 'images/tango11.jpg', title: 'Yodzira', sub: 'matchday' },
    { id: 403, src: 'images/tango12.jpg', title: 'Pitch Side Team Assembly', sub: 'matchday' },
    
    // Champions Category
    { id: 501, src: 'images/IMG_3505.jpg', title: 'MOSSL Trophy Presentation Celebration', sub: 'champions' },
    { id: 501, src: 'images/IMG_3506.jpg', title: 'MOSSL Trophy Presentation Celebration', sub: 'champions' },
    { id: 502, src: 'images/IMG_3508.jpg', title: 'Official Champions Victory  Photo', sub: 'champions' },
    { id: 501, src: 'images/IMG_3509.jpg', title: 'MOSSL Trophy Presentation Celebration', sub: 'champions' },
    { id: 501, src: 'images/IMG_3510.jpg', title: 'MOSSL Shield Presentation Celebration', sub: 'champions' },
    { id: 502, src: 'images/IMG_3511.jpg', title: 'Official Champions Victory Group Photo', sub: 'champions' },
    { id: 501, src: 'images/IMG_3513.jpg', title: 'MOSSL Shield Presentation Celebration', sub: 'champions' },
    { id: 502, src: 'images/IMG_3518.jpg', title: 'Official Champions Victory Group Photo', sub: 'champions' },
    { id: 502, src: 'images/IMG_3520.jpg', title: 'Official Champions Victory Group Photo', sub: 'champions' },
    { id: 502, src: 'images/IMG_3662.jpg', title: 'Official Champions Victory Group Photo', sub: 'champions' }
 ];
let allPhotos = [];
let currentImages = [];
let currentIndex = 0;

function normalizeGalleryCategory(category) {
    const raw = category ? category.toString().trim().toLowerCase().replace(/\s+/g, ' ') : '';
    const mapping = {
        '2026 season': 'newseason',
        'new season': 'newseason',
        'newseason': 'newseason',
        'season': 'newseason',
        'matchday': 'matchday',
        'match day': 'matchday',
        'match': 'matchday',
        'champions': 'champions',
        'champion': 'champions',
        'celebration': 'champions',
        'victory': 'champions',
        'trophy': 'champions'
    };
    return mapping[raw] || raw;
}

async function initializeGallery() {
    const container = document.getElementById('galleryContainer');
    if (!container) return;

    try {
        const dynamicMedia = JSON.parse(localStorage.getItem('adminMedia') || '[]')
            .filter(item => item.type === 'photo' || item.type === 'image')
            .map(item => ({
                ...item,
                category: normalizeGalleryCategory(item.category)
            }))
            .filter(item => ['newseason', 'matchday', 'champions'].includes(item.category));
        
        // Merge static and dynamic, preventing duplicates based on src/url
        const mediaMap = new Map();
        galleryPhotos.forEach(item => mediaMap.set(item.src, { ...item, sub: item.sub }));
        dynamicMedia.forEach(item => mediaMap.set(item.url, { id: item.id, src: item.url, title: item.title, sub: item.category }));
        allPhotos = Array.from(mediaMap.values());

        renderGallery('all');
    } catch (error) {
        console.error("Failed to initialize gallery:", error);
        allPhotos = [...galleryPhotos];
        renderGallery('all');
    }
}

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
        currentImages = [...allPhotos];
        Object.values(sections).forEach(s => { if (s) s.style.display = 'block'; });
    } else {
        currentImages = allPhotos.filter(p => p.sub === filterType);
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
        document.body.style.overflow = 'hidden'; // Lock background scroll
    }
}

function changeImage(direction) {
    if (currentImages.length === 0) return;

    currentIndex += direction;
    if (currentIndex < 0) currentIndex = currentImages.length - 1;
    if (currentIndex >= currentImages.length) currentIndex = 0;

    const lightboxImg = document.getElementById('lightboxImage');
    if (lightboxImg) {
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
            lightboxImg.src = currentImages[currentIndex].src;
            lightboxImg.style.opacity = '1';
        }, 150);
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = ''; // Restore scroll
    }
}

// Swipe Functionality
let touchStartX = 0;
let touchEndX = 0;

const lightboxElement = document.getElementById('lightbox');
if (lightboxElement) {
    lightboxElement.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxElement.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
}

function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
        // Swiped Left -> Next Image
        changeImage(1);
    }
    if (touchEndX > touchStartX + swipeThreshold) {
        // Swiped Right -> Previous Image
        changeImage(-1);
    }
}

// Event listeners for lightbox navigation
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
    initializeGallery();
});

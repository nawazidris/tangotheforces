const localVideos = [
    { id: 1, url: 'images/tango01.mp4', title: 'Champions Celebration', category: 'champions', type: 'video' },
    { id: 10, url: 'images/tango02.mp4', title: 'Champions Celebration Log', category: 'champions', type: 'video' },
    { id: 2, url: 'images/tango1.mp4', title: 'The Forces Pre-Match Prep', category: 'matchday', type: 'video' },
    { id: 3, url: 'images/tango2.mp4', title: 'Matchday Tactical Highlights', category: 'matchday', type: 'video' },
    { id: 4, url: 'images/tango3.mp4', title: 'The Forces: Pitch Intensity', category: 'matchday', type: 'video' },
    { id: 5, url: 'images/tango4.mp4', title: 'Post-Match Wrap and De-brief', category: 'matchday', type: 'video' }
];

let allVideos = [];
let currentVideos = [];
const lightbox = document.getElementById("lightbox");
const lightboxVideo = document.getElementById("lightboxVideo");

async function initializeVideos() {
    const container = document.getElementById('videoContainer');
    if (!container) return;

    container.innerHTML = '<p>Loading videos...</p>';

    try {
        const dynamicMedia = JSON.parse(localStorage.getItem('adminMedia') || '[]').filter(item => item.type === 'video');
        
        // Merge static and dynamic, preventing duplicates based on URL
        const mediaMap = new Map();
        localVideos.forEach(item => mediaMap.set(item.url, item));
        dynamicMedia.forEach(item => mediaMap.set(item.url, item));
        allVideos = Array.from(mediaMap.values());

        if (allVideos.length === 0) {
            container.innerHTML = '<p>No videos have been added to the gallery yet.</p>';
            document.getElementById('videoFilters').innerHTML = '';
            return;
        }

        setupFilters(allVideos);
        renderVideos('all');

    } catch (error) {
        console.error("Failed to initialize video gallery:", error);
        container.innerHTML = '<p>Could not load videos. Please try again later.</p>';
    }
}

function setupFilters() {
    const filtersContainer = document.getElementById('videoFilters');
    if (!filtersContainer) return;

    const categories = [...new Set(allVideos.map(item => item.category).filter(Boolean))];

    let buttonsHtml = '<button class="active" data-filter="all">All Videos</button>';
    categories.forEach(category => {
        buttonsHtml += `<button data-filter="${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</button>`;
    });

    filtersContainer.innerHTML = buttonsHtml;

    filtersContainer.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (e) => {
            filtersContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            renderVideos(e.target.dataset.filter);
        });
    });
}

function renderVideos(filter = 'all') {
    const container = document.getElementById('videoContainer');
    container.innerHTML = '';

    currentVideos = (filter === 'all')
        ? allVideos
        : allVideos.filter(item => item.category === filter);

    if (currentVideos.length === 0) {
        container.innerHTML = '<p>No videos found for this category.</p>';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'videos-grid';

    currentVideos.forEach(video => {
        const card = buildVideoCard(video);
        grid.appendChild(card);
    });

    container.appendChild(grid);
}

function buildVideoCard(video) {
    const card = document.createElement("div");
    card.className = "video-card";

    const tagText = video.category || 'General';

    card.innerHTML = `
        <div class="video-card-tag">${tagText}</div>
        <div class="video-play-overlay">
            <div class="play-btn-circle">
                <i class="fa-solid fa-play"></i>
            </div>
        </div>
        <video src="${video.url}" preload="metadata" muted playsinline></video>
        <div class="video-card-title">${video.title}</div>
    `;

    const videoElement = card.querySelector('video');
    card.addEventListener('mouseenter', () => videoElement.play().catch(() => {}));
    card.addEventListener('mouseleave', () => {
        videoElement.pause();
        videoElement.currentTime = 0;
    });

    card.addEventListener("click", () => {
        if (lightbox && lightboxVideo) {
            lightbox.style.display = "flex";
            lightboxVideo.src = video.url;
            lightboxVideo.play();
        }
    });

    return card;
}

function closeLightbox() {
    if (lightbox && lightboxVideo) {
        lightboxVideo.pause();
        lightboxVideo.src = "";
        lightbox.style.display = "none";
    }
}

document.addEventListener('DOMContentLoaded', initializeVideos);

// Event listeners for lightbox
document.getElementById('lightbox')?.addEventListener('click', (e) => {
    if (e.target.id === 'lightbox' || e.target.classList.contains('lightbox-content-wrapper')) {
        closeLightbox();
    }
});
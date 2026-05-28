const localVideos = [
    { id: 1, src: 'images/tango01.mp4', title: 'Champions Celebration', subcategory: 'champions', date: '2026-02-01' },
    { id: 10, src: 'images/tango02.mp4', title: 'Champions Celebration Log', subcategory: 'champions', date: '2026-02-02' },
    { id: 2, src: 'images/tango1.mp4', title: 'The Forces Pre-Match Prep', subcategory: 'matchday', date: '2026-01-10' },
    { id: 3, src: 'images/tango2.mp4', title: 'Matchday Tactical Highlights', subcategory: 'matchday', date: '2026-01-11' },
    { id: 4, src: 'images/tango3.mp4', title: 'The Forces: Pitch Intensity', subcategory: 'matchday', date: '2026-01-12' },
    { id: 5, src: 'images/tango4.mp4', title: 'Post-Match Wrap and De-brief', subcategory: 'matchday', date: '2026-01-13' }
];

const adminVideos = JSON.parse(localStorage.getItem("videos")) || [];
const galleryVideos = [...localVideos, ...adminVideos];
let currentVideos = [...galleryVideos];

const grid = document.getElementById("videoGrid");
const counter = document.getElementById("videoCounter");
const lightbox = document.getElementById("lightbox");
const lightboxVideo = document.getElementById("lightboxVideo");

function loadVideos(videos) {
    if (!grid) return;
    grid.innerHTML = "";

    videos.forEach(video => {
        const card = document.createElement("div");
        card.className = "video-card";

        const tagText = video.subcategory || video.category || 'Matchday';

        card.innerHTML = `
            <div class="video-card-tag">${tagText}</div>
            <div class="video-play-overlay">
                <div class="play-btn-circle">
                    <i class="fa-solid fa-play"></i>
                </div>
            </div>
            <video src="${video.src || video.url}" preload="metadata" muted playsinline></video>
            <div class="video-card-title">${video.title}</div>
        `;

        // Interactive Preview Triggers on Hover
        const videoElement = card.querySelector('video');
        card.addEventListener('mouseenter', () => {
            videoElement.play().catch(() => {});
        });
        card.addEventListener('mouseleave', () => {
            videoElement.pause();
            videoElement.currentTime = 0;
        });

        // Open Video Full Theater mode Lightbox Frame
        card.addEventListener("click", () => {
            if (lightbox && lightboxVideo) {
                lightbox.style.display = "flex";
                lightboxVideo.src = video.src || video.url;
                lightboxVideo.play();
            }
        });

        grid.appendChild(card);
    });

    if (counter) {
        counter.textContent = `${videos.length} Premium Clip${videos.length === 1 ? '' : 's'} Loaded`;
    }
}

function setupFilters() {
    const buttons = document.querySelectorAll(".video-filters button");
    buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const filter = btn.dataset.filter;
            
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            if (filter === "all") {
                currentVideos = [...galleryVideos];
            } else {
                currentVideos = galleryVideos.filter(v => (v.subcategory || v.category) === filter);
            }

            loadVideos(currentVideos);
        });
    });
}

function closeLightbox() {
    if (lightbox && lightboxVideo) {
        lightboxVideo.pause();
        lightboxVideo.src = "";
        lightbox.style.display = "none";
    }
}

// Lightbox click-off safety trigger
if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
            closeLightbox();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadVideos(galleryVideos);
    setupFilters();
});
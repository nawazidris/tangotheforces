(function () {
    const placeholderSvg = (label) => {
        const escaped = (label || 'Loading image').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
                <rect width="800" height="500" fill="#091321"/>
                <rect x="24" y="24" width="752" height="452" rx="24" fill="#101c2f" stroke="#243447" stroke-width="2"/>
                <circle cx="400" cy="210" r="82" fill="#1f3147"/>
                <path d="M330 290h140" stroke="#3b82f6" stroke-width="16" stroke-linecap="round"/>
                <text x="400" y="378" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="28" fill="#9fb3cc">${escaped}</text>
            </svg>`;
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    };

    function getOptimizedImageSrc(src) {
        if (!src || src.startsWith('data:') || src.startsWith('http') || src.includes('youtube.com')) {
            return src;
        }

        const normalized = src.replace(/\\/g, '/');
        const match = normalized.match(/^(.*\/)?([^/]+)\.(jpe?g|png|gif|bmp)$/i);
        if (!match) return src;

        const prefix = match[1] || '';
        const name = match[2];
        return `${prefix}optimized/${name}.webp`;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const img = entry.target;
            obs.unobserve(img);
            loadImage(img);
        });
    }, {
        rootMargin: '200px 0px',
        threshold: 0.01
    });

    function loadImage(img, force = false) {
        if (img.dataset.lazyLoaded === 'true') return;

        const source = img.dataset.src || img.getAttribute('src');
        if (!source || source.startsWith('data:image')) {
            img.dataset.lazyLoaded = 'true';
            return;
        }

        const placeholder = img.dataset.placeholder || placeholderSvg(img.alt || 'Loading image');
        if (!img.dataset.src) {
            img.dataset.src = source;
        }

        if (force || img.getAttribute('loading') === 'eager' || img.dataset.priority === 'high') {
            img.setAttribute('loading', 'eager');
            img.setAttribute('decoding', 'async');
        } else {
            img.setAttribute('loading', 'lazy');
            img.setAttribute('decoding', 'async');
        }

        if (!img.getAttribute('src') || img.getAttribute('src') === source) {
            img.setAttribute('src', placeholder);
        }

        const srcset = img.dataset.srcset || img.getAttribute('srcset');
        if (srcset) {
            img.dataset.srcset = srcset;
            img.removeAttribute('srcset');
        }

        const finalSrc = getOptimizedImageSrc(img.dataset.src);
        const fallbackSrc = img.dataset.src;
        const finalSrcset = img.dataset.srcset;

        const apply = () => {
            img.setAttribute('src', finalSrc);
            if (finalSrcset) {
                img.setAttribute('srcset', finalSrcset);
            }
            img.dataset.lazyLoaded = 'true';
            img.classList.add('lazy-loaded');
        };

        if (img.complete && img.naturalWidth > 0) {
            apply();
            return;
        }

        img.addEventListener('load', apply, { once: true });
        img.addEventListener('error', () => {
            img.dataset.lazyLoaded = 'true';
            if (img.getAttribute('src') !== fallbackSrc) {
                img.setAttribute('src', fallbackSrc);
            } else {
                img.setAttribute('src', placeholder);
            }
        }, { once: true });

        requestAnimationFrame(() => {
            img.setAttribute('src', finalSrc);
            if (finalSrcset) {
                img.setAttribute('srcset', finalSrcset);
            }
        });
    }

    function prepareImage(img) {
        if (!img || img.dataset.lazyPrepared === 'true' || img.tagName !== 'IMG') return;
        if (img.getAttribute('loading') === 'eager' || img.hasAttribute('data-no-lazy')) {
            img.dataset.lazyPrepared = 'true';
            return;
        }

        const src = img.getAttribute('src');
        if (!src || src.startsWith('data:image') || src.startsWith('https://img.youtube.com')) {
            img.dataset.lazyPrepared = 'true';
            return;
        }

        img.dataset.src = src;
        img.dataset.lazyPrepared = 'true';

        const isAboveFold = img.dataset.priority === 'high' || img.classList.contains('about-crest') || img.closest('.hero-section') || img.closest('.news-featured');
        if (isAboveFold) {
            loadImage(img, true);
            return;
        }

        observer.observe(img);
    }

    function scanImages(root = document) {
        root.querySelectorAll('img').forEach(prepareImage);
    }

    document.addEventListener('DOMContentLoaded', () => {
        scanImages();

        const observerRoot = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== 1) return;
                    if (node.tagName === 'IMG') {
                        prepareImage(node);
                    }
                    if (node.querySelectorAll) {
                        scanImages(node);
                    }
                });
            });
        });

        observerRoot.observe(document.body, { childList: true, subtree: true });
    });
})();

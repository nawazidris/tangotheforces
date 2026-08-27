// File: js/components.js
// Reworked to reliably load components, execute their inline scripts,
// and provide a robust hamburger menu using event delegation.

document.addEventListener("DOMContentLoaded", () => {
    // Load components and then wire interactions
    Promise.all([
        loadComponent("main-header", "header.html"),
        loadComponent("mobile-nav", "mobile-nav.html"),
        loadComponent("main-footer", "footer.html")
    ]).then(() => {
        // Small delay to ensure nodes are in the DOM
        requestAnimationFrame(() => {
            setupMenuToggle();
            setupAdminShortcut();
            setActiveLink();
            syncHeaderHeight();
        });
        window.addEventListener('resize', syncHeaderHeight);
    }).catch(err => {
        console.error('[components] Failed to load components:', err);
    });

    // Check online status
    initOnlineStatusCheck();
});

/**
 * Long-press on Logo to access Admin page
 */
function setupAdminShortcut() {
    // Find the link wrapping the logo
    const brandLink = document.querySelector('.header-brand a');
    if (!brandLink) return;

    let pressTimer;
    let isLongPress = false;

    const startPress = (e) => {
        // Only trigger on primary touch or left click
        if (e.type === 'mousedown' && e.button !== 0) return;

        isLongPress = false;
        pressTimer = window.setTimeout(() => {
            isLongPress = true;
            // Success! Trigger haptic feedback if available and redirect
            if (window.navigator.vibrate) window.navigator.vibrate(60);
            window.location.href = 'login.html';
        }, 1500); // 1.5 seconds long press
    };

    const cancelPress = (e) => {
        clearTimeout(pressTimer);
    };

    // Desktop
    brandLink.addEventListener('mousedown', startPress);
    brandLink.addEventListener('mouseup', cancelPress);
    brandLink.addEventListener('mouseleave', cancelPress);

    // Mobile
    brandLink.addEventListener('touchstart', startPress, { passive: true });
    brandLink.addEventListener('touchend', cancelPress);
    brandLink.addEventListener('touchcancel', cancelPress);

    // Crucial: Prevent navigation to index.html if it was a long press
    brandLink.addEventListener('click', (e) => {
        if (isLongPress) {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    });

    // Prevent default context menu on long press to keep it "secret"
    brandLink.addEventListener('contextmenu', (e) => {
        if (isLongPress || pressTimer) {
            e.preventDefault();
        }
    });
}

/**
 * Global Offline / No Internet Handling
 */
function initOnlineStatusCheck() {
    const updateStatus = () => {
        if (!navigator.onLine) {
            showOfflineBanner();
        } else {
            removeOfflineBanner();
        }
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus(); // Initial check
}

function showOfflineBanner() {
    if (document.getElementById('offline-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.style.cssText = `
        background: #ef4444;
        color: white;
        padding: 12px;
        text-align: center;
        font-size: 0.85rem;
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        z-index: 10000;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
        font-weight: 600;
    `;

    banner.innerHTML = `
        <span><i class="fa-solid fa-wifi-slash"></i> Offline mode. Using cached data.</span>
        <button onclick="window.location.reload()" style="background: rgba(255,255,255,0.2); border: 1px solid white; color: white; padding: 4px 12px; border-radius: 6px; font-size: 0.75rem; cursor: pointer;">
            Retry
        </button>
    `;
    document.body.appendChild(banner);
}

function removeOfflineBanner() {
    const banner = document.getElementById('offline-banner');
    if (banner) banner.remove();
}

/**
 * Calculates the actual height of the sticky header and sets a CSS variable.
 * This ensures the mobile nav and scroll-padding are always perfectly aligned.
 */
function syncHeaderHeight() {
    const header = document.querySelector('.main-header');
    if (header) {
        const height = header.offsetHeight;
        document.documentElement.style.setProperty('--header-height', height + 'px');
    }
}

/**
 * Loads a component's HTML using XMLHttpRequest, which is more reliable
 * for local file:/// access in Android WebViews than the Fetch API.
 */
function loadComponent(tag, url) {
    return new Promise((resolve, reject) => {
        const elements = Array.from(document.querySelectorAll(tag));
        if (elements.length === 0) return resolve();

        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                // Status 0 is success for local file:/// loads
                if (xhr.status === 200 || xhr.status === 0) {
                    const text = xhr.responseText;

                    elements.forEach(element => {
                        const temp = document.createElement('div');
                        temp.innerHTML = text;

                        // Re-create scripts so they execute
                        const scripts = temp.querySelectorAll('script');
                        scripts.forEach(oldScript => {
                            const newScript = document.createElement('script');
                            Array.from(oldScript.attributes).forEach(attr => {
                                newScript.setAttribute(attr.name, attr.value);
                            });
                            newScript.textContent = oldScript.textContent;
                            document.body.appendChild(newScript);
                            oldScript.remove();
                        });

                        const fragment = document.createDocumentFragment();
                        while (temp.firstChild) {
                            fragment.appendChild(temp.firstChild);
                        }
                        element.replaceWith(fragment);
                    });
                    resolve();
                } else {
                    console.error(`[components] Failed to load ${url}: Status ${xhr.status}`);
                    reject(new Error(`Status ${xhr.status}`));
                }
            }
        };
        xhr.onerror = function() {
            console.error(`[components] XHR Error loading ${url}`);
            reject(new Error('XHR Error'));
        };
        xhr.send();
    });
}

/**
 * Robust hamburger/menu wiring using event delegation.
 *
 * Behavior:
 * - Click on the button with id="menuBtn" toggles the mobile nav (#mobileNav).
 * - Clicking outside the open mobile nav closes it.
 * - Clicking a link inside the mobile nav closes it.
 * - Icon inside #menuBtn (FontAwesome <i>) switches between fa-bars and fa-xmark.
 */
function setupMenuToggle() {
    const mobileNav = document.getElementById('mobileNav');

    if (!mobileNav) {
        console.warn('[menu] No #mobileNav found in DOM; menu toggle disabled.');
        return;
    }

    // Utility: reflect open/closed state
    function setMenuOpen(open) {
        if (open) {
            mobileNav.classList.add('open');
        } else {
            mobileNav.classList.remove('open');
        }

        const menuBtn = document.getElementById('menuBtn');
        if (menuBtn) {
            const icon = menuBtn.querySelector('i');
            if (icon) {
                if (open) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-xmark');
                } else {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }

            menuBtn.style.transform = open ? 'rotate(90deg)' : 'rotate(0deg)';
            menuBtn.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        }
    }

    // Toggle when user clicks the button (use event delegation to be resilient)
    document.addEventListener('click', (e) => {
        const clickedMenuBtn = e.target.closest('#menuBtn');
        if (clickedMenuBtn) {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = mobileNav.classList.contains('open');
            setMenuOpen(!isOpen);
            return;
        }

        // If mobile nav is open and user clicked outside it, close it
        if (mobileNav.classList.contains('open') && !e.target.closest('#mobileNav')) {
            setMenuOpen(false);
        }
    });

    // Close menu when a link inside the mobile nav is clicked (delegated)
    mobileNav.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            // allow default navigation, but close menu immediately
            setMenuOpen(false);
        }
    });

    // Optional: close the menu on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
            setMenuOpen(false);
        }
    });

    // Ensure the initial icon state matches current DOM
    const initialMenuBtn = document.getElementById('menuBtn');
    if (initialMenuBtn) {
        const icon = initialMenuBtn.querySelector('i');
        if (icon) {
            // set default to bars if neither icon present
            if (!icon.classList.contains('fa-bars') && !icon.classList.contains('fa-xmark')) {
                icon.classList.add('fa-bars');
            }
        }
    }
}

/**
 * Adds 'active' class to the nav link for the current page.
 * It's kept separate because header components may also include inline active logic.
 */
function setActiveLink() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    const links = document.querySelectorAll('.nav-links a, .mobile-nav a, .footer-nav a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        const linkPage = href.split("/").pop();
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Global Premium Modal System
 * Replaces native alert() and confirm() with themed stylish dialogs
 */
(function() {
    function injectModalHTML() {
        if (document.getElementById('customModal')) return;
        const modalHTML = `
            <div id="customModal" class="modal-overlay">
                <div class="modal-card">
                    <div class="modal-icon" id="modalIcon">
                        <i class="fa-solid fa-circle-info"></i>
                    </div>
                    <h3 id="modalTitle">Tango FC</h3>
                    <p id="modalMessage"></p>
                    <div class="modal-actions">
                        <button class="modal-btn modal-btn-cancel" id="modalCancelBtn">Cancel</button>
                        <button class="modal-btn modal-btn-confirm" id="modalConfirmBtn">OK</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    window.showPremiumModal = (title, message, isConfirm = false) => {
        injectModalHTML();
        const overlay = document.getElementById('customModal');
        const confirmBtn = document.getElementById('modalConfirmBtn');
        const cancelBtn = document.getElementById('modalCancelBtn');
        const titleEl = document.getElementById('modalTitle');
        const messageEl = document.getElementById('modalMessage');
        const iconEl = document.getElementById('modalIcon');

        return new Promise((resolve) => {
            titleEl.textContent = title || "Tango FC";
            messageEl.textContent = message;
            cancelBtn.style.display = isConfirm ? 'block' : 'none';
            overlay.classList.add('active');

            const isDanger = message.toLowerCase().includes('delete') ||
                             message.toLowerCase().includes('remove') ||
                             message.toLowerCase().includes('error') ||
                             message.toLowerCase().includes('clear');

            if (isDanger) {
                iconEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
                iconEl.style.color = '#ef4444';
                iconEl.style.background = 'rgba(239, 68, 68, 0.15)';
                confirmBtn.style.background = 'linear-gradient(135deg, #ef4444, #b91c1c)';
            } else {
                iconEl.innerHTML = '<i class="fa-solid fa-circle-info"></i>';
                iconEl.style.color = '#3b82f6';
                iconEl.style.background = 'rgba(59, 130, 246, 0.15)';
                confirmBtn.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
            }

            const cleanup = (val) => {
                overlay.classList.remove('active');
                // Use a slight delay to allow transition to finish before cleaning events
                setTimeout(() => {
                    confirmBtn.onclick = null;
                    cancelBtn.onclick = null;
                }, 300);
                resolve(val);
            };

            confirmBtn.onclick = () => cleanup(true);
            cancelBtn.onclick = () => cleanup(false);
        });
    };

    window.alert = (msg) => { window.showPremiumModal('Tango FC', msg, false); };
    window.confirm = (msg) => { return window.showPremiumModal('Confirmation', msg, true); };
})();

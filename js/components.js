document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.classList.add('component-loading');
    Promise.all([
        loadComponent("main-header", "components/header.html"),
        loadComponent("mobile-nav", "components/mobile-nav.html"),
        loadComponent("hamburger-button", "components/hamburger-button.html"), // New component
        loadComponent("main-footer", "components/footer.html")
    ]).then(() => {
        setupNavigationToggle(); // New function to handle binding
        setActiveLink();
        document.documentElement.classList.remove('component-loading');
    });
});

async function loadComponent(tag, url) {
    const elements = document.getElementsByTagName(tag);
    if (elements.length === 0) return;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch component ${url}: ${response.statusText}`);
            return;
        }
        const text = await response.text();
        const template = document.createElement('template');
        template.innerHTML = text;

        for (const element of elements) {
            const content = template.content.cloneNode(true);
            element.replaceWith(content);
        }

    } catch (error) {
        console.error(`Error loading component from ${url}:`, error);
    }
}

function setupNavigationToggle() {
    const openMenuBtn = document.getElementById('menuBtn'); // The new hamburger button
    const mobileNav = document.getElementById('mobileNav');
    const closeMenuBtn = mobileNav ? mobileNav.querySelector('.mobile-menu-close-btn') : null; // Assuming a class for close button

    if (openMenuBtn && mobileNav) {
        const toggleMenu = (isOpen) => {
            mobileNav.classList.toggle('open', isOpen);
            openMenuBtn.setAttribute('aria-expanded', String(isOpen));
            mobileNav.setAttribute('aria-hidden', String(!isOpen));
        };

        openMenuBtn.addEventListener('click', () => toggleMenu(true)); // Open menu

        if (closeMenuBtn) {
            closeMenuBtn.addEventListener('click', () => toggleMenu(false)); // Close menu
        }

        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => toggleMenu(false)); // Close menu on link click
        });
    }
}

function setActiveLink() {
    const currentPage = window.location.pathname.split("/").pop();
    if (!currentPage || currentPage === "") return;

    const links = document.querySelectorAll('.nav-links a, .mobile-nav a, .footer-nav a');
    links.forEach(link => {
        const linkPage = link.getAttribute('href').split("/").pop();
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
}

/* 
You will need to create the following files in a new 'components' directory:

1. components/header.html
   - Copy the <header class="main-header">...</header> block from any page into this file.
   - Remove the 'active' class from all nav links.

2. components/mobile-nav.html
   - Copy the <nav class="mobile-nav">...</nav> or <div class="mobile-nav">...</div> block into this file.
   - Remove the 'active' class from all nav links.

3. components/footer.html
   - Copy the <footer class="main-footer">...</footer> block into this file.

After creating these files, you can replace the corresponding HTML in all your pages with:

<main-header></main-header>
<mobile-nav></mobile-nav>
... your main content ...
<main-footer></main-footer>

And add `<script src="js/components.js" defer></script>` to your <head>.
*/
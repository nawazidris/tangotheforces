document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
        updateThemeButton(savedTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeButton(newTheme);
        });
    }
    
    // Mobile menu toggle
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('show');
            const icon = mobileMenu.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !mobileMenu.contains(e.target)) {
                navLinks.classList.remove('show');
                const icon = mobileMenu.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            }
        });
    }

    function updateThemeButton(theme) {
        if (!themeToggle) return;
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }

    // Dropdown menu toggle functionality
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdowns = document.querySelectorAll('nav li.dropdown');
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                // Optionally close dropdown if not using CSS hover
            }
        });
    });
});
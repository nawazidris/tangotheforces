<<<<<<< HEAD
# Code Citations

## License: unknown
https://github.com/rn0x/rn0x.github.io/blob/a6463b3fa56e90448cf019377518ca8b49f83678/assets/js/main.js

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
```


## License: unknown
https://github.com/rn0x/rn0x.github.io/blob/a6463b3fa56e90448cf019377518ca8b49f83678/assets/js/main.js

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
```


## License: unknown
https://github.com/rn0x/rn0x.github.io/blob/a6463b3fa56e90448cf019377518ca8b49f83678/assets/js/main.js

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
```


## License: unknown
https://github.com/rn0x/rn0x.github.io/blob/a6463b3fa56e90448cf019377518ca8b49f83678/assets/js/main.js

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
```


## License: unknown
https://github.com/rn0x/rn0x.github.io/blob/a6463b3fa56e90448cf019377518ca8b49f83678/assets/js/main.js

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
```


## License: unknown
https://github.com/rn0x/rn0x.github.io/blob/a6463b3fa56e90448cf019377518ca8b49f83678/assets/js/main.js

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
```


## License: unknown
https://github.com/rn0x/rn0x.github.io/blob/a6463b3fa56e90448cf019377518ca8b49f83678/assets/js/main.js

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
```


## License: unknown
https://github.com/rn0x/rn0x.github.io/blob/a6463b3fa56e90448cf019377518ca8b49f83678/assets/js/main.js

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
```


## License: unknown
https://github.com/rn0x/rn0x.github.io/blob/a6463b3fa56e90448cf019377518ca8b49f83678/assets/js/main.js

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
```


## License: unknown
https://github.com/Dharshini5624/webdevelopment/blob/e64a4db0502db07f7cc5d5da3700934f4c65e9ff/dharshini/portfolio/portfolio.css

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
    
    function updateThemeButton(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
});
````

Add these CSS variables to your `style.css`:

````css
/* filepath: c:\Users\Nawaz\.vscode\team-website\src\css\style.css */
:root[data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #000000;
    --header-bg: #003d82;
    --header-text: #ffffff;
    --nav-hover: #002d5c;
}

:root[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --header-bg: #001a2e;
    --header-text: #ffffff;
    --nav-hover: #003d82;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}

header {
    background-color: var(--header-bg);
    color: var(--header-text);
}

.
```


## License: unknown
https://github.com/Dharshini5624/webdevelopment/blob/e64a4db0502db07f7cc5d5da3700934f4c65e9ff/dharshini/portfolio/portfolio.css

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
    
    function updateThemeButton(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
});
````

Add these CSS variables to your `style.css`:

````css
/* filepath: c:\Users\Nawaz\.vscode\team-website\src\css\style.css */
:root[data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #000000;
    --header-bg: #003d82;
    --header-text: #ffffff;
    --nav-hover: #002d5c;
}

:root[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --header-bg: #001a2e;
    --header-text: #ffffff;
    --nav-hover: #003d82;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}

header {
    background-color: var(--header-bg);
    color: var(--header-text);
}

.
```


## License: unknown
https://github.com/Dharshini5624/webdevelopment/blob/e64a4db0502db07f7cc5d5da3700934f4c65e9ff/dharshini/portfolio/portfolio.css

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
    
    function updateThemeButton(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
});
````

Add these CSS variables to your `style.css`:

````css
/* filepath: c:\Users\Nawaz\.vscode\team-website\src\css\style.css */
:root[data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #000000;
    --header-bg: #003d82;
    --header-text: #ffffff;
    --nav-hover: #002d5c;
}

:root[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --header-bg: #001a2e;
    --header-text: #ffffff;
    --nav-hover: #003d82;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}

header {
    background-color: var(--header-bg);
    color: var(--header-text);
}

.
```


## License: unknown
https://github.com/Dharshini5624/webdevelopment/blob/e64a4db0502db07f7cc5d5da3700934f4c65e9ff/dharshini/portfolio/portfolio.css

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
    
    function updateThemeButton(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
});
````

Add these CSS variables to your `style.css`:

````css
/* filepath: c:\Users\Nawaz\.vscode\team-website\src\css\style.css */
:root[data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #000000;
    --header-bg: #003d82;
    --header-text: #ffffff;
    --nav-hover: #002d5c;
}

:root[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --header-bg: #001a2e;
    --header-text: #ffffff;
    --nav-hover: #003d82;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}

header {
    background-color: var(--header-bg);
    color: var(--header-text);
}

.
```


## License: unknown
https://github.com/Dharshini5624/webdevelopment/blob/e64a4db0502db07f7cc5d5da3700934f4c65e9ff/dharshini/portfolio/portfolio.css

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
    
    function updateThemeButton(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
});
````

Add these CSS variables to your `style.css`:

````css
/* filepath: c:\Users\Nawaz\.vscode\team-website\src\css\style.css */
:root[data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #000000;
    --header-bg: #003d82;
    --header-text: #ffffff;
    --nav-hover: #002d5c;
}

:root[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --header-bg: #001a2e;
    --header-text: #ffffff;
    --nav-hover: #003d82;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}

header {
    background-color: var(--header-bg);
    color: var(--header-text);
}

.
```


## License: unknown
https://github.com/Dharshini5624/webdevelopment/blob/e64a4db0502db07f7cc5d5da3700934f4c65e9ff/dharshini/portfolio/portfolio.css

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
    
    function updateThemeButton(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
});
````

Add these CSS variables to your `style.css`:

````css
/* filepath: c:\Users\Nawaz\.vscode\team-website\src\css\style.css */
:root[data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #000000;
    --header-bg: #003d82;
    --header-text: #ffffff;
    --nav-hover: #002d5c;
}

:root[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --header-bg: #001a2e;
    --header-text: #ffffff;
    --nav-hover: #003d82;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}

header {
    background-color: var(--header-bg);
    color: var(--header-text);
}

.
```


## License: unknown
https://github.com/Dharshini5624/webdevelopment/blob/e64a4db0502db07f7cc5d5da3700934f4c65e9ff/dharshini/portfolio/portfolio.css

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
    
    function updateThemeButton(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
});
````

Add these CSS variables to your `style.css`:

````css
/* filepath: c:\Users\Nawaz\.vscode\team-website\src\css\style.css */
:root[data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #000000;
    --header-bg: #003d82;
    --header-text: #ffffff;
    --nav-hover: #002d5c;
}

:root[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --header-bg: #001a2e;
    --header-text: #ffffff;
    --nav-hover: #003d82;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}

header {
    background-color: var(--header-bg);
    color: var(--header-text);
}

.
```


## License: unknown
https://github.com/Dharshini5624/webdevelopment/blob/e64a4db0502db07f7cc5d5da3700934f4c65e9ff/dharshini/portfolio/portfolio.css

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
    
    function updateThemeButton(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
});
````

Add these CSS variables to your `style.css`:

````css
/* filepath: c:\Users\Nawaz\.vscode\team-website\src\css\style.css */
:root[data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #000000;
    --header-bg: #003d82;
    --header-text: #ffffff;
    --nav-hover: #002d5c;
}

:root[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --header-bg: #001a2e;
    --header-text: #ffffff;
    --nav-hover: #003d82;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}

header {
    background-color: var(--header-bg);
    color: var(--header-text);
}

.
```


## License: unknown
https://github.com/Dharshini5624/webdevelopment/blob/e64a4db0502db07f7cc5d5da3700934f4c65e9ff/dharshini/portfolio/portfolio.css

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
    
    function updateThemeButton(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
});
````

Add these CSS variables to your `style.css`:

````css
/* filepath: c:\Users\Nawaz\.vscode\team-website\src\css\style.css */
:root[data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #000000;
    --header-bg: #003d82;
    --header-text: #ffffff;
    --nav-hover: #002d5c;
}

:root[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --header-bg: #001a2e;
    --header-text: #ffffff;
    --nav-hover: #003d82;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}

header {
    background-color: var(--header-bg);
    color: var(--header-text);
}

.
```


## License: unknown
https://github.com/Dharshini5624/webdevelopment/blob/e64a4db0502db07f7cc5d5da3700934f4c65e9ff/dharshini/portfolio/portfolio.css

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
    
    function updateThemeButton(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
});
````

Add these CSS variables to your `style.css`:

````css
/* filepath: c:\Users\Nawaz\.vscode\team-website\src\css\style.css */
:root[data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #000000;
    --header-bg: #003d82;
    --header-text: #ffffff;
    --nav-hover: #002d5c;
}

:root[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --header-bg: #001a2e;
    --header-text: #ffffff;
    --nav-hover: #003d82;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}

header {
    background-color: var(--header-bg);
    color: var(--header-text);
}

.
```

=======
# Code Citations

## License: unknown
https://github.com/rn0x/rn0x.github.io/blob/a6463b3fa56e90448cf019377518ca8b49f83678/assets/js/main.js

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
```


## License: unknown
https://github.com/rn0x/rn0x.github.io/blob/a6463b3fa56e90448cf019377518ca8b49f83678/assets/js/main.js

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
```


## License: unknown
https://github.com/rn0x/rn0x.github.io/blob/a6463b3fa56e90448cf019377518ca8b49f83678/assets/js/main.js

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
```


## License: unknown
https://github.com/rn0x/rn0x.github.io/blob/a6463b3fa56e90448cf019377518ca8b49f83678/assets/js/main.js

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
```


## License: unknown
https://github.com/rn0x/rn0x.github.io/blob/a6463b3fa56e90448cf019377518ca8b49f83678/assets/js/main.js

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
```


## License: unknown
https://github.com/rn0x/rn0x.github.io/blob/a6463b3fa56e90448cf019377518ca8b49f83678/assets/js/main.js

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
```


## License: unknown
https://github.com/rn0x/rn0x.github.io/blob/a6463b3fa56e90448cf019377518ca8b49f83678/assets/js/main.js

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
```


## License: unknown
https://github.com/rn0x/rn0x.github.io/blob/a6463b3fa56e90448cf019377518ca8b49f83678/assets/js/main.js

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
```


## License: unknown
https://github.com/rn0x/rn0x.github.io/blob/a6463b3fa56e90448cf019377518ca8b49f83678/assets/js/main.js

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
```


## License: unknown
https://github.com/Dharshini5624/webdevelopment/blob/e64a4db0502db07f7cc5d5da3700934f4c65e9ff/dharshini/portfolio/portfolio.css

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
    
    function updateThemeButton(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
});
````

Add these CSS variables to your `style.css`:

````css
/* filepath: c:\Users\Nawaz\.vscode\team-website\src\css\style.css */
:root[data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #000000;
    --header-bg: #003d82;
    --header-text: #ffffff;
    --nav-hover: #002d5c;
}

:root[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --header-bg: #001a2e;
    --header-text: #ffffff;
    --nav-hover: #003d82;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}

header {
    background-color: var(--header-bg);
    color: var(--header-text);
}

.
```


## License: unknown
https://github.com/Dharshini5624/webdevelopment/blob/e64a4db0502db07f7cc5d5da3700934f4c65e9ff/dharshini/portfolio/portfolio.css

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
    
    function updateThemeButton(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
});
````

Add these CSS variables to your `style.css`:

````css
/* filepath: c:\Users\Nawaz\.vscode\team-website\src\css\style.css */
:root[data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #000000;
    --header-bg: #003d82;
    --header-text: #ffffff;
    --nav-hover: #002d5c;
}

:root[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --header-bg: #001a2e;
    --header-text: #ffffff;
    --nav-hover: #003d82;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}

header {
    background-color: var(--header-bg);
    color: var(--header-text);
}

.
```


## License: unknown
https://github.com/Dharshini5624/webdevelopment/blob/e64a4db0502db07f7cc5d5da3700934f4c65e9ff/dharshini/portfolio/portfolio.css

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
    
    function updateThemeButton(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
});
````

Add these CSS variables to your `style.css`:

````css
/* filepath: c:\Users\Nawaz\.vscode\team-website\src\css\style.css */
:root[data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #000000;
    --header-bg: #003d82;
    --header-text: #ffffff;
    --nav-hover: #002d5c;
}

:root[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --header-bg: #001a2e;
    --header-text: #ffffff;
    --nav-hover: #003d82;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}

header {
    background-color: var(--header-bg);
    color: var(--header-text);
}

.
```


## License: unknown
https://github.com/Dharshini5624/webdevelopment/blob/e64a4db0502db07f7cc5d5da3700934f4c65e9ff/dharshini/portfolio/portfolio.css

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
    
    function updateThemeButton(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
});
````

Add these CSS variables to your `style.css`:

````css
/* filepath: c:\Users\Nawaz\.vscode\team-website\src\css\style.css */
:root[data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #000000;
    --header-bg: #003d82;
    --header-text: #ffffff;
    --nav-hover: #002d5c;
}

:root[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --header-bg: #001a2e;
    --header-text: #ffffff;
    --nav-hover: #003d82;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}

header {
    background-color: var(--header-bg);
    color: var(--header-text);
}

.
```


## License: unknown
https://github.com/Dharshini5624/webdevelopment/blob/e64a4db0502db07f7cc5d5da3700934f4c65e9ff/dharshini/portfolio/portfolio.css

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
    
    function updateThemeButton(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
});
````

Add these CSS variables to your `style.css`:

````css
/* filepath: c:\Users\Nawaz\.vscode\team-website\src\css\style.css */
:root[data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #000000;
    --header-bg: #003d82;
    --header-text: #ffffff;
    --nav-hover: #002d5c;
}

:root[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --header-bg: #001a2e;
    --header-text: #ffffff;
    --nav-hover: #003d82;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}

header {
    background-color: var(--header-bg);
    color: var(--header-text);
}

.
```


## License: unknown
https://github.com/Dharshini5624/webdevelopment/blob/e64a4db0502db07f7cc5d5da3700934f4c65e9ff/dharshini/portfolio/portfolio.css

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
    
    function updateThemeButton(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
});
````

Add these CSS variables to your `style.css`:

````css
/* filepath: c:\Users\Nawaz\.vscode\team-website\src\css\style.css */
:root[data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #000000;
    --header-bg: #003d82;
    --header-text: #ffffff;
    --nav-hover: #002d5c;
}

:root[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --header-bg: #001a2e;
    --header-text: #ffffff;
    --nav-hover: #003d82;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}

header {
    background-color: var(--header-bg);
    color: var(--header-text);
}

.
```


## License: unknown
https://github.com/Dharshini5624/webdevelopment/blob/e64a4db0502db07f7cc5d5da3700934f4c65e9ff/dharshini/portfolio/portfolio.css

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
    
    function updateThemeButton(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
});
````

Add these CSS variables to your `style.css`:

````css
/* filepath: c:\Users\Nawaz\.vscode\team-website\src\css\style.css */
:root[data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #000000;
    --header-bg: #003d82;
    --header-text: #ffffff;
    --nav-hover: #002d5c;
}

:root[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --header-bg: #001a2e;
    --header-text: #ffffff;
    --nav-hover: #003d82;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}

header {
    background-color: var(--header-bg);
    color: var(--header-text);
}

.
```


## License: unknown
https://github.com/Dharshini5624/webdevelopment/blob/e64a4db0502db07f7cc5d5da3700934f4c65e9ff/dharshini/portfolio/portfolio.css

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
    
    function updateThemeButton(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
});
````

Add these CSS variables to your `style.css`:

````css
/* filepath: c:\Users\Nawaz\.vscode\team-website\src\css\style.css */
:root[data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #000000;
    --header-bg: #003d82;
    --header-text: #ffffff;
    --nav-hover: #002d5c;
}

:root[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --header-bg: #001a2e;
    --header-text: #ffffff;
    --nav-hover: #003d82;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}

header {
    background-color: var(--header-bg);
    color: var(--header-text);
}

.
```


## License: unknown
https://github.com/Dharshini5624/webdevelopment/blob/e64a4db0502db07f7cc5d5da3700934f4c65e9ff/dharshini/portfolio/portfolio.css

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
    
    function updateThemeButton(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
});
````

Add these CSS variables to your `style.css`:

````css
/* filepath: c:\Users\Nawaz\.vscode\team-website\src\css\style.css */
:root[data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #000000;
    --header-bg: #003d82;
    --header-text: #ffffff;
    --nav-hover: #002d5c;
}

:root[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --header-bg: #001a2e;
    --header-text: #ffffff;
    --nav-hover: #003d82;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}

header {
    background-color: var(--header-bg);
    color: var(--header-text);
}

.
```


## License: unknown
https://github.com/Dharshini5624/webdevelopment/blob/e64a4db0502db07f7cc5d5da3700934f4c65e9ff/dharshini/portfolio/portfolio.css

```
Here's your index.html with a theme toggle button added:

````html
<!-- filepath: c:\Users\Nawaz\.vscode\team-website\src\pages\index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tango Football Club</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="header-top">
            <h1>Welcome to the Tango Football Club</h1>
            <button id="themeToggle" class="theme-btn">🌙 Dark Mode</button>
        </div>
        <nav>
            <ul>
                <li><a href="roster.html">Player Roster</a></li>
                <li><a href="stats.html">Player Stats</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section>
            <h2>About Our Team</h2>
            <p>Here you can find information about our players and their statistics.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2026 Tango Football Club</p>
    </footer>
    <script src="../js/theme.js"></script>
</body>
</html>
````

Now create a new file `theme.js` in your `src/js` folder to handle the theme switching:

````javascript
// filepath: c:\Users\Nawaz\.vscode\team-website\src\js\theme.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
    });
    
    function updateThemeButton(theme) {
        themeToggle.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }
});
````

Add these CSS variables to your `style.css`:

````css
/* filepath: c:\Users\Nawaz\.vscode\team-website\src\css\style.css */
:root[data-theme="light"] {
    --bg-color: #ffffff;
    --text-color: #000000;
    --header-bg: #003d82;
    --header-text: #ffffff;
    --nav-hover: #002d5c;
}

:root[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #e0e0e0;
    --header-bg: #001a2e;
    --header-text: #ffffff;
    --nav-hover: #003d82;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}

header {
    background-color: var(--header-bg);
    color: var(--header-text);
}

.
```

>>>>>>> 19de20aede773e25a288670608f7d5b9ca18a4f3

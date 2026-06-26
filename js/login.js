// js/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    // Add password visibility toggle logic
    const toggleButton = document.getElementById('togglePw');
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            const passwordInput = document.getElementById('password');
            const icon = document.getElementById('togglePwIcon');
            const isHidden = passwordInput.type === 'password';
            passwordInput.type = isHidden ? 'text' : 'password';
            icon.className = isHidden ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
        });
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userInput = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorContainer = document.getElementById('login-error');
        const submitButton = loginForm.querySelector('button[type="submit"]');

        errorContainer.textContent = '';
        submitButton.disabled = true;
        submitButton.textContent = 'Signing In...';

        try {
            if (!firebase || !firebase.auth) {
                throw new Error("Firebase is not initialized.");
            }

            let email = userInput;
            // If user entered only a username without an "@", convert it to an email
            if (!userInput.includes('@')) {
                email = `${userInput.toLowerCase()}@tangofc.com`;
            }

            // Sign in with Firebase Auth
            await firebase.auth().signInWithEmailAndPassword(email, password.trim());
            // On success, Firebase's onAuthStateChanged listener (in admin.js) will handle the redirect.
            // We don't need to do anything else here.

        } catch (error) {
            console.error('Login failed:', error);
            let friendlyMessage = 'An unknown error occurred. Please try again.';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                friendlyMessage = 'Invalid email or password. Please try again.';
            }
            errorContainer.textContent = friendlyMessage;
            submitButton.disabled = false;
            submitButton.textContent = 'Sign In';
        }
    });
});
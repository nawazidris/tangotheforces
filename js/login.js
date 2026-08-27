// js/login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    // Password visibility toggle
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

        const userInput = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorContainer = document.getElementById('login-error');
        const submitButton = document.getElementById('loginBtn');
        const btnText = document.getElementById('btnText');

        if (!userInput || !password) return;

        errorContainer.textContent = '';
        submitButton.disabled = true;
        if (btnText) btnText.textContent = 'Authenticating...';

        try {
            // 1. Ensure Firebase is ready
            if (typeof firebase === 'undefined' || !firebase.auth) {
                throw new Error("Firebase library failed to load. Please check your internet.");
            }

            // 2. Format Email
            let email = userInput;
            if (!userInput.includes('@')) {
                email = `${userInput.toLowerCase()}@tangofc.com`;
            }

            // 3. Sign in with Timeout Guard
            console.log("[Login] Attempting sign-in for:", email);

            const authPromise = firebase.auth().signInWithEmailAndPassword(email, password.trim());
            // Use 10s timeout for login specifically
            const userCredential = await (window.AppConfig?.withTimeout ? window.AppConfig.withTimeout(authPromise, 10000) : authPromise);
            const user = userCredential.user;

            console.log("[Login] Success! Fetching profile data...");

            // 4. Fetch role for local session storage (Background task, won't block redirect)
            try {
                // Wait for window.db to exist
                let retry = 0;
                while (!window.db && retry < 10) {
                    await new Promise(r => setTimeout(r, 100));
                    retry++;
                }

                if (window.db) {
                    const userDoc = await window.db.collection('users').doc(user.uid).get();
                    const userData = userDoc.exists ? userDoc.data() : { name: userInput.split('@')[0], role: 'Admin' };

                    localStorage.setItem('localAuth', JSON.stringify({
                        uid: user.uid,
                        email: email,
                        role: userData.role || 'Admin',
                        name: userData.name || 'Admin',
                        lastVerified: Date.now()
                    }));
                }
            } catch (profileErr) {
                console.warn("[Login] Profile storage failed, proceeding anyway:", profileErr.message);
            }

            // 5. Success! Redirect to Dashboard
            window.location.replace('admin.html');

        } catch (error) {
            console.error('[Login] Failed:', error.code, error.message);
            let friendlyMessage = 'Login failed. Please check your connection.';

            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                friendlyMessage = 'Invalid username or password.';
            } else if (error.message === 'Firebase/Network timeout') {
                friendlyMessage = 'Connection timed out. Try again.';
            }

            errorContainer.textContent = friendlyMessage;
            submitButton.disabled = false;
            if (btnText) btnText.textContent = 'Sign In';
        }
    });
});

// js/firebase-config.js
// Firebase v10 Compat libraries are loaded in HTML before this script.
// Copy js/firebase-config.example.js and paste your Firebase web app config from:
// Firebase Console → Project settings → Your apps → Web app

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

function isConfigured(config) {
    const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
    return required.every(key => {
        const value = config[key];
        return typeof value === 'string' && value.length > 0 && !value.includes('YOUR_');
    });
}

window.db = null;

if (typeof firebase !== 'undefined' && isConfigured(firebaseConfig)) {
    try {
        firebase.initializeApp(firebaseConfig);
        window.db = firebase.firestore();
    } catch (err) {
        console.warn('Firebase init failed — using JSON/localStorage fallbacks:', err);
    }
} else {
    console.info('Firebase not configured — using JSON/localStorage fallbacks.');
}

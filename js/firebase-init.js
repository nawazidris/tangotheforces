// js/firebase-init.js

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDmJV-L1uIzsK2xOISwz1ZzaQNV6w2dC2g",
  authDomain: "tangotheforces.firebaseapp.com",
  projectId: "tangotheforces",
  storageBucket: "tangotheforces.appspot.com",
  messagingSenderId: "198375433887",
  appId: "1:198375433887:web:f141a84146cbcde2d964aa",
  measurementId: "G-RXMDL8G8S9"
};

// Initialize Firebase and expose the database instance to the window
try {
    const app = firebase.initializeApp(firebaseConfig);
    // This makes the Firestore database available globally as `window.db`
    // which the existing admin.js and stats.js files are already looking for.
    window.db = firebase.firestore();
} catch (e) {
    console.error("Firebase initialization failed:", e);
}
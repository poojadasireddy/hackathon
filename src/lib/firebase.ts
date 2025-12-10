import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyA858RWfPAav4JbgP0HYnUy7c7SmA4JRIk",
    authDomain: "dracula-70cc8.firebaseapp.com",
    projectId: "dracula-70cc8",
    storageBucket: "dracula-70cc8.firebasestorage.app",
    messagingSenderId: "109861973774",
    appId: "1:109861973774:web:1a8e2610744c82f387f15f",
    measurementId: "G-STHQJEVX73"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAxYNIB61Lt87macr_-s6tFMQ-G6sNbX4c",
    authDomain: "my-portfolio-917d4.firebaseapp.com",
    projectId: "my-portfolio-917d4",
    storageBucket: "my-portfolio-917d4.firebasestorage.app",
    messagingSenderId: "616259939437",
    appId: "1:616259939437:web:3435a54a06e43120d1e364",
    measurementId: "G-QMQW32X6JV",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account",
});

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logoutUser = () => signOut(auth);

export { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged };
export default app;


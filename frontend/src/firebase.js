import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Only initialize Firebase if config is validly provided
const hasFirebaseConfig = Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId &&
    firebaseConfig.apiKey !== "undefined" &&
    firebaseConfig.apiKey !== ""
);

let app = null;
let auth = null;
let googleProvider = null;

if (hasFirebaseConfig) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
} else {
    console.warn("Firebase config missing. Auth features will be disabled.");
}

export const signInWithGoogle = () => {
    if (!auth || !googleProvider) throw new Error("Firebase not configured");
    return signInWithPopup(auth, googleProvider);
};

export const logoutUser = () => {
    if (!auth) throw new Error("Firebase not configured");
    return signOut(auth);
};

export { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged };
export default app;

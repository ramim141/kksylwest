import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase Configuration with env variables and project defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyALx5IGaXfSbEX0_7BAjEuSUMZpg1Y2cKo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kksylhetwest-fc4d5.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kksylhetwest-fc4d5",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kksylhetwest-fc4d5.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "228633042318",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:228633042318:web:4a890ea37efde2f929d8df",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-765Z5S8XZR",
};

// Check if Firebase is properly configured
export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID"
  );
};

// Initialize Firebase App safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// Lazy Auth getter if ever needed
let _auth = null;
export const getFirebaseAuth = async () => {
  if (!_auth) {
    const { getAuth } = await import("firebase/auth");
    _auth = getAuth(app);
  }
  return _auth;
};

// Initialize Firebase Analytics safely (only on client browsers where supported)
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export { app, db, analytics, firebaseConfig };

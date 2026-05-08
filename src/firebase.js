import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAn4ga3myKhYU3_vHmoNHUDk5ip6nWHELk",
  authDomain: "nasira-tiba3a.firebaseapp.com",
  projectId: "nasira-tiba3a",
  storageBucket: "nasira-tiba3a.firebasestorage.app",
  messagingSenderId: "82526171166",
  appId: "1:82526171166:web:4abea1b08272d1db85be0f",
  measurementId: "G-WTH8R95809"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Analytics only if supported
isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
});

export default app;

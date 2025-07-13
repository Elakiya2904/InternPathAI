
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCPWJER9xur5sX-IjUayCmMt-FRQOx0Tmo",
  authDomain: "intern-fd1b0.firebaseapp.com",
  projectId: "intern-fd1b0",
  storageBucket: "intern-fd1b0.firebasestorage.app",
  messagingSenderId: "532208869595",
  appId: "1:532208869595:web:a0160c40c6de4edb47ecfe",
  measurementId: "G-MHM5Z0NXLK"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

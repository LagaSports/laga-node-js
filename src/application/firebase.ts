import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyB1TiAaRa1TGFFfP3C_6FqV42CDOD9ml9k",
    authDomain: "laga-84b3a.firebaseapp.com",
    projectId: "laga-84b3a",
    storageBucket: "laga-84b3a.firebasestorage.app",
    messagingSenderId: "644841737062",
    appId: "1:644841737062:web:01e15dec2fd8836d6c16a7"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth and Firestore instances
export const auth = getAuth(app);
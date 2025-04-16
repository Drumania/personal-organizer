import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCaWyoDm-D13vJAMDSYaBPmS8Q-aaBrhe4",
  authDomain: "personalorganizer-344d3.firebaseapp.com",
  projectId: "personalorganizer-344d3",
  storageBucket: "personalorganizer-344d3.firebasestorage.app",
  messagingSenderId: "1035246124387",
  appId: "1:1035246124387:web:707ac1aed1b56d1f276756",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const messaging = getMessaging(app);

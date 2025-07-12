import { initializeApp } from "firebase/app";
import { getFirestore, deleteDoc, doc, collection, query, where, getDocs, updateDoc, GeoPoint } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, getDownloadURL } from "firebase/storage"; 


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


const app = initializeApp(firebaseConfig);

const secondaryApp = initializeApp(firebaseConfig, "Secondary");

const secondaryAuth = getAuth(secondaryApp);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage, deleteDoc,secondaryAuth, doc, collection, query, where, getDocs, updateDoc, GeoPoint, getDownloadURL };

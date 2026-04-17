import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCT8Kah7tWjuhWPJmg-HRWAVK7DOcmn4cE",
  authDomain: "taxvault-pro.firebaseapp.com",
  projectId: "taxvault-pro",
  storageBucket: "taxvault-pro.firebasestorage.app",
  messagingSenderId: "194645219880",
  appId: "1:194645219880:web:470f1fcd5826a4f6d2f31d"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

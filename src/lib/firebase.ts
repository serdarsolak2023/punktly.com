import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCSmGHj8zZH7kVwV7AdxaqsLvwndbPxkGg",
  authDomain: "punktlyapp.firebaseapp.com",
  projectId: "punktlyapp",
  storageBucket: "punktlyapp.firebasestorage.app",
  messagingSenderId: "685295107028",
  appId: "1:685295107028:web:71e43c4e9983abb3eeb441"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

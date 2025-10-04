// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAbejsqWjSvC3gU9i32dalaB-LQTStYifk",
    authDomain: "sistemadecontroldestockyfact.firebaseapp.com",
    projectId: "sistemadecontroldestockyfact",
    storageBucket: "sistemadecontroldestockyfact.firebasestorage.app",
    messagingSenderId: "906007370281",
    appId: "1:906007370281:web:4ec8c4fb04489019de9a38",
    measurementId: "G-GF6JK372FQ"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
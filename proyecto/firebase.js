// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Importa getFirestore

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC559oE9Jqi1Ft1k-9XtRxxm-oh78XwB30",
  authDomain: "fcmproject-fcm.firebaseapp.com",
  projectId: "fcmproject-fcm",
  storageBucket: "fcmproject-fcm.firebasestorage.app",
  messagingSenderId: "708780263575",
  appId: "1:708780263575:web:91b9cae948cc5f999841d2",
  measurementId: "G-12D9EHJS05",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };
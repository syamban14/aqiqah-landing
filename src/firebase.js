// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TUGAS ANDA: 
// 1. Buat project di https://console.firebase.google.com/
// 2. Tambahkan aplikasi Web, lalu copy-paste `firebaseConfig` dari web tersebut ke bawah ini:
const firebaseConfig = {
  apiKey: "AIzaSyDsDW9wIEsu3o_oRIhwsMOMoYTLrvefZBw",
  authDomain: "aqiqah-26471.firebaseapp.com",
  projectId: "aqiqah-26471",
  storageBucket: "aqiqah-26471.firebasestorage.app",
  messagingSenderId: "587704088606",
  appId: "1:587704088606:web:35993fc0b848cfa826560f"
};

// Cek apakah user sudah mengisi config atau belum
export const isConfigured = true;

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


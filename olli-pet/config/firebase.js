import { initializeApp } from "firebase/app";
// ADICIONADO: Importação do Firestore
import { getFirestore } from "firebase/firestore"; 
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCDR0PFZapJjabx-su3Kzeb3-_zwgScGK0",
  authDomain: "olli-pet-ca74e.firebaseapp.com",
  projectId: "olli-pet-ca74e",
  storageBucket: "olli-pet-ca74e.firebasestorage.app",
  messagingSenderId: "1034599956819",
  appId: "1:1034599956819:web:e76683d04f9338435421a6",
  measurementId: "G-8M8MBC3BJ4"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o Banco de Dados (Firestore)
export const db = getFirestore(app);
export const auth = getAuth(app);
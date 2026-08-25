import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCDR0PFZapJjabx-su3Kzeb3-_zwgScGK0",
  authDomain: "olli-pet-ca74e.firebaseapp.com",
  projectId: "olli-pet-ca74e",
  storageBucket: "olli-pet-ca74e.firebasestorage.app",
  messagingSenderId: "1034599956819",
  appId: "1:1034599956819:web:e76683d04f9338435421a6",
  measurementId: "G-8M8MBC3BJ4"
};

//Inicializa o Firebase
const app = initializeApp(firebaseConfig);

//Exporta os serviços que o app precisa
export const auth = getAuth(app);
export const db = getFirestore(app);
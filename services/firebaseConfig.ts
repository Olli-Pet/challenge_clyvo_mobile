import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
// Importado de "@firebase/auth" (e não de "firebase/auth") de propósito:
// só esse pacote expõe a condição "react-native", onde vive o
// getReactNativePersistence. O wrapper "firebase/auth" resolve sempre
// para o build web, que não tem essa função.
import {
  Auth,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "@firebase/auth";
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

//Inicializa o Firebase (evita re-inicializar no hot reload do Expo)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

//Auth com persistência em AsyncStorage: mantém o usuário logado ao fechar o app.
//O initializeAuth só pode rodar uma vez por app, por isso o fallback no catch.
let authInstance: Auth;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  authInstance = getAuth(app);
}

//Exporta os serviços que o app precisa
export const auth = authInstance;
export const db = getFirestore(app);

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  browserLocalPersistence,
  getAuth,
  initializeAuth,
  Persistence,
} from "firebase/auth";
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

/**
 * Persistência da sessão, escolhida por plataforma.
 *
 * `getReactNativePersistence` existe apenas no build React Native do Firebase.
 * Ele NÃO pode ser importado no topo do arquivo por dois motivos:
 *
 *  1. no bundle web esse símbolo não existe;
 *  2. importá-lo de "@firebase/auth" carrega uma SEGUNDA cópia do SDK, que
 *     registra o componente numa instância diferente da criada por
 *     "firebase/app" — daí o erro "Component auth has not been registered yet".
 *
 * O Metro resolve "firebase/auth" pela condição "react-native" (que expõe a
 * função); o Node e o bundle web resolvem para o build web (que não a expõe).
 * Por isso o require fica aqui dentro, com verificação em tempo de execução.
 */
function persistenciaDaPlataforma(): Persistence {
  // No navegador a sessão persiste em localStorage.
  if (Platform.OS === "web") {
    return browserLocalPersistence;
  }

  const moduloAuth = require("firebase/auth");
  const criarPersistenciaRN = moduloAuth.getReactNativePersistence;

  if (typeof criarPersistenciaRN !== "function") {
    // Não deve acontecer no app (o Metro entrega o build RN), mas se acontecer
    // é melhor perder a persistência do que impedir o login por completo.
    console.warn(
      "getReactNativePersistence indisponível; a sessão não sobreviverá ao fechar o app."
    );
    return browserLocalPersistence;
  }

  return criarPersistenciaRN(AsyncStorage);
}

/**
 * `initializeAuth` só pode rodar uma vez por app — no hot reload do Expo ele
 * lança, e aí basta recuperar a instância já criada com `getAuth`.
 */
let authInstance: Auth;
try {
  authInstance = initializeAuth(app, { persistence: persistenciaDaPlataforma() });
} catch {
  authInstance = getAuth(app);
}

//Exporta os serviços que o app precisa
export const auth = authInstance;
export const db = getFirestore(app);

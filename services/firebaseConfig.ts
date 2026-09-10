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

/**
 * Credenciais do Firebase, lidas do arquivo .env.
 *
 * O prefixo EXPO_PUBLIC_ e obrigatorio: sem ele o Expo nao expoe a variavel
 * ao aplicativo. Os valores ficam fora do repositorio (.env esta no
 * .gitignore); o .env.example mostra quais chaves preencher.
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Sem as credenciais o Firebase falha mais adiante com um erro obscuro; avisar
// aqui aponta direto para a causa: o .env ausente ou incompleto.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    "Credenciais do Firebase ausentes. Copie o .env.example para .env, " +
      "preencha as chaves e reinicie o Expo com --clear."
  );
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function persistenciaDaPlataforma(): Persistence {

  if (Platform.OS === "web") {
    return browserLocalPersistence;
  }

  const moduloAuth = require("firebase/auth");
  const criarPersistenciaRN = moduloAuth.getReactNativePersistence;

  if (typeof criarPersistenciaRN !== "function") {

    console.warn(
      "getReactNativePersistence indisponível; a sessão não sobreviverá ao fechar o app."
    );
    return browserLocalPersistence;
  }

  return criarPersistenciaRN(AsyncStorage);
}

let authInstance: Auth;
try {
  authInstance = initializeAuth(app, { persistence: persistenciaDaPlataforma() });
} catch {
  authInstance = getAuth(app);
}

export const auth = authInstance;
export const db = getFirestore(app);

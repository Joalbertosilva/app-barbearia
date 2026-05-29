import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import * as FirebaseAuth from "firebase/auth";
import { getAuth, initializeAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyD_cXZi1PW1y0PTASb5KHOB7tR67Ikk89k",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "app-barbearia-da5f3.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "app-barbearia-da5f3",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "app-barbearia-da5f3.firebasestorage.app",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "616655465171",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "1:616655465171:web:99ae701d8d9bd04cb60226",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-JFJ62R7ND8",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = (() => {
  try {
    const getReactNativePersistence = (FirebaseAuth as any).getReactNativePersistence as
      | ((storage: typeof AsyncStorage) => unknown)
      | undefined;
    if (!getReactNativePersistence) {
      return getAuth(app);
    }
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage) as any,
    });
  } catch {
    // fallback quando Auth já foi inicializado por outro módulo
    return getAuth(app);
  }
})();

export const db = (() => {
  try {
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    });
  } catch {
    return getFirestore(app);
  }
})();

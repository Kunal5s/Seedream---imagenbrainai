// services/firebaseClient.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// User-provided Firebase project configuration.
// NOTE: Corrected storageBucket domain to the standard '.appspot.com' format.
const firebaseConfig = {
  apiKey: "AIzaSyANTFomcUmbFYL83xYcs-ElXitQvm5YYxw",
  authDomain: "seedream-imagenbrainai.firebaseapp.com",
  projectId: "seedream-imagenbrainai",
  storageBucket: "seedream-imagenbrainai.appspot.com",
  messagingSenderId: "331568402598",
  appId: "1:331568402598:web:0ff54e64b34706355c2467",
  measurementId: "G-QRMM21YT5X"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // opcjonalnie: storageBucket, messagingSenderId, appId, measurementId...
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);

// Export auth, żebyś mógł go użyć w SignInPage lub w kontekście AuthContext
export const auth = getAuth(app);

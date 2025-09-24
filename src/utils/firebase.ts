// src/utils/firebase.ts
import { initializeApp } from 'firebase/app';

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "studio-4151499836-4cde0",
  appId: "1:396542528972:web:45ebcba9aeb1100fab2169",
  apiKey: "AIzaSyD0lCxMeDtETJ-oESIOiCzRZyAuqWquHAE",
  authDomain: "studio-4151499836-4cde0.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "396542528972"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };

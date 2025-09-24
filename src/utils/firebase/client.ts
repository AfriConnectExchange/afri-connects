// Firebase client initializer
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

if (!getApps().length) {
  // Only initialize if required env vars exist
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    initializeApp(firebaseConfig);
  } else {
    // eslint-disable-next-line no-console
    console.warn('Firebase client not initialized. Set VITE_FIREBASE_* env vars.');
  }
}

export const auth = getAuth();

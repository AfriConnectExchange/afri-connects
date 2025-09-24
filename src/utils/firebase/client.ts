// Firebase client initializer
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!getApps().length) {
  // Only initialize if required env vars exist
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    initializeApp(firebaseConfig);
  } else {
    // eslint-disable-next-line no-console
    console.warn('Firebase client not initialized. Set NEXT_PUBLIC_FIREBASE_* env vars.');
  }
}

export const auth = getAuth();

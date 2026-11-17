import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";

// Browser side Firebase, used only by the admin dashboard.
// Access is enforced by firestore.rules: only users with the admin claim can read or write.

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

// Set NEXT_PUBLIC_USE_EMULATORS=1 to point the dashboard at the local Firebase emulators.
const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === "1";
let auth: Auth | null = null;
let db: Firestore | null = null;

function app(): FirebaseApp {
  return getApps()[0] ?? initializeApp(config);
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(app());
    if (useEmulators) connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  }
  return auth;
}

export function getDb(): Firestore {
  if (!db) {
    db = getFirestore(app());
    if (useEmulators) connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }
  return db;
}

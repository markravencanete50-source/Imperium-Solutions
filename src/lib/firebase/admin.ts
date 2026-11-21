import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Server side Firebase. Bypasses security rules, so only import it from
// route handlers and scripts, never from client components.

export class NotConfiguredError extends Error {
  constructor() {
    super("Firebase Admin is not configured. Set the FIREBASE_ variables in .env.local.");
    this.name = "NotConfiguredError";
  }
}

function getAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  // Local emulator: no credentials needed.
  if (process.env.FIRESTORE_EMULATOR_HOST && projectId) {
    return initializeApp({ projectId });
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) throw new NotConfiguredError();

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

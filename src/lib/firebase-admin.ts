import * as admin from 'firebase-admin';

// This is a separate configuration for server-side Firebase access.
// It uses a service account for secure, privileged access, which is necessary for Genkit flows.

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}


export const app = admin.apps[0] ?? admin.initializeApp();

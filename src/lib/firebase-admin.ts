import * as admin from 'firebase-admin';

// This is a separate configuration for server-side Firebase access.
// It uses a service account for secure, privileged access, which is necessary for Genkit flows.

let app: admin.app.App;

const serviceAccountValue = process.env.FIREBASE_SERVICE_ACCOUNT;

if (serviceAccountValue && serviceAccountValue !== 'REPLACE_WITH_YOUR_FIREBASE_SERVICE_ACCOUNT_JSON') {
  try {
    const serviceAccount = JSON.parse(serviceAccountValue);
    if (!admin.apps.length) {
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
      app = admin.app();
    }
  } catch (error) {
    console.error("Error parsing Firebase service account JSON:", error);
    // app remains uninitialized
  }
} else {
    console.warn("Firebase Admin SDK not initialized. FIREBASE_SERVICE_ACCOUNT is not set or is a placeholder.");
}

function getInitializedApp() {
    if (!app) {
        throw new Error("Firebase Admin SDK has not been initialized. Please ensure FIREBASE_SERVICE_ACCOUNT is set correctly in your environment variables.");
    }
    return app;
}

export { getInitializedApp as app };

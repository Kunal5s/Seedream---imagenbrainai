// services/firebase.ts
import admin from 'firebase-admin';

// Ensure Firebase is initialized only once
if (!admin.apps.length) {
  try {
    // Check for the single credential variable first, as provided by the user.
    if (process.env.FIRESTORE_CREDENTIALS) {
        const serviceAccountString = process.env.FIRESTORE_CREDENTIALS;
        const serviceAccount = JSON.parse(serviceAccountString);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } else { // Fallback to individual variables if the single one is not present
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            // The private key needs newlines restored
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          }),
        });
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    if (error instanceof SyntaxError) {
        console.error("Failed to parse FIRESTORE_CREDENTIALS. Make sure it's a valid JSON string copied from your Firebase service account file.");
    }
  }
}

export const db = admin.firestore();
// services/auth.ts
import type { VercelRequest } from '@vercel/node';
import admin from 'firebase-admin';

// This ensures the admin app is initialized before this module is used.
// It relies on the side-effect of initialization in firebase.ts
import './firebase';

/**
 * Verifies the Firebase ID token from the Authorization header of a request.
 * @param req The VercelRequest object.
 * @returns A promise that resolves to the decoded ID token, or null if invalid/missing.
 */
export const verifyFirebaseToken = async (req: VercelRequest): Promise<admin.auth.DecodedIdToken | null> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('Auth header missing or malformed');
    return null;
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token) {
    console.warn('Bearer token is missing');
    return null;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return null;
  }
};

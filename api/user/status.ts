// api/user/status.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../services/firebase';
import { UserStatus, createGuestStatus } from '../../services/licenseService';
import { verifyFirebaseToken } from '../../services/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const decodedToken = await verifyFirebaseToken(req);
  if (!decodedToken) {
    return res.status(401).json({ message: 'Unauthorized: Invalid or missing token.' });
  }
  const userId = decodedToken.uid;
  const userEmail = decodedToken.email;

  try {
    const userDocRef = db.collection('users').doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      // First time this user is seen by our backend. Create a new record.
      const guestStatus = createGuestStatus();
      const newUserStatus: UserStatus = {
          ...guestStatus, // Start with guest defaults (500 credits, Free Trial plan)
          name: decodedToken.name || userEmail?.split('@')[0] || 'New User',
          email: userEmail || null,
          isGuest: false, // They are now a registered user
      };
      await userDocRef.set(newUserStatus);
      console.log(`Created new user record for UID: ${userId}`);
      return res.status(200).json(newUserStatus);
    }

    res.status(200).json(userDoc.data() as UserStatus);
  } catch (error) {
    console.error(`Error fetching user status for UID ${userId}:`, error);
    res.status(500).json({ message: 'Failed to fetch user status.' });
  }
}
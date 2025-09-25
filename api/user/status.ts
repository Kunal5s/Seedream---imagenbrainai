// api/user/status.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../services/firebase';
import { UserStatus, createGuestStatus } from '../../services/licenseService';

// MOCK: In a real app, you'd get this from a session cookie or JWT
const MOCK_USER_ID = 'user_demo_123'; 

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const userDocRef = db.collection('users').doc(MOCK_USER_ID);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      // If user doesn't exist, create a new one with guest status
      const guestStatus = createGuestStatus();
      const newUserStatus: UserStatus = {
          ...guestStatus,
          name: 'Demo User',
          email: 'demo@example.com',
      };
      await userDocRef.set(newUserStatus);
      return res.status(200).json(newUserStatus);
    }

    res.status(200).json(userDoc.data() as UserStatus);
  } catch (error) {
    console.error('Error fetching user status:', error);
    res.status(500).json({ message: 'Failed to fetch user status.' });
  }
}
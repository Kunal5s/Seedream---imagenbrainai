// api/user/status.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { UserStatus, PlanName } from '../../services/licenseService';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // --- MOCK BACKEND IMPLEMENTATION ---
  // This simulates a user who is not logged in (a guest).
  // A real backend would check a session cookie and fetch data from Firestore.

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const guestStatus: UserStatus = {
    name: 'Guest',
    email: null,
    plan: 'Free Trial' as PlanName,
    credits: 500,
    licenses: [],
  };

  res.status(200).json(guestStatus);
}

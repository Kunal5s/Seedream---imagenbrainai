// api/license/activate.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { UserStatus, ActivatedLicense, PlanName } from '../../services/licenseService';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // --- MOCK BACKEND IMPLEMENTATION ---
  // This simulates activating a license key.
  // A real backend would validate the key against a database (e.g., Firestore).

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, key } = req.body;

  if (!email || !key) {
    return res.status(400).json({ message: 'Email and license key are required.' });
  }

  // Simulate a fake "valid" key for demonstration
  const FAKE_VALID_KEY = 'polar_cl_valid_key_for_demo';
  const CREDITS_TO_ADD = 5000;
  const PLAN_NAME: PlanName = 'Booster';

  if (key.trim().toLowerCase() !== FAKE_VALID_KEY) {
    return res.status(404).json({ message: 'License key not found or already used.' });
  }

  const newLicense: ActivatedLicense = {
    key: FAKE_VALID_KEY,
    email: email,
    planName: PLAN_NAME,
    creditsAdded: CREDITS_TO_ADD,
    activationDate: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const updatedStatus: UserStatus = {
    name: email.split('@')[0], // Simulate a name from email
    email: email,
    plan: PLAN_NAME,
    credits: 500 + CREDITS_TO_ADD, // Guest credits + new credits
    licenses: [newLicense],
  };

  res.status(200).json(updatedStatus);
}

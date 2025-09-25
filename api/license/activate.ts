// api/license/activate.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../services/firebase';
import { UserStatus, ActivatedLicense, PlanName } from '../../services/licenseService';

// MOCK: In a real app, you'd get this from a session cookie or JWT
const MOCK_USER_ID = 'user_demo_123';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, key } = req.body;

  if (!email || !key) {
    return res.status(400).json({ message: 'Email and license key are required.' });
  }

  try {
    const licensesRef = db.collection('licenses');
    const userRef = db.collection('users').doc(MOCK_USER_ID);
    
    // Check if license key has already been used
    const snapshot = await licensesRef.where('key', '==', key).limit(1).get();
    if (!snapshot.empty) {
      return res.status(409).json({ message: 'License key has already been used.' });
    }

    // MOCK: Simulate different valid keys for different plans
    const PLAN_LOOKUP: Record<string, { planName: PlanName, credits: number }> = {
        'polar_cl_booster_key': { planName: 'Booster', credits: 5000 },
        'polar_cl_premium_key': { planName: 'Premium', credits: 15000 },
        'polar_cl_pro_key': { planName: 'Professional', credits: 30000 },
    };

    const planDetails = PLAN_LOOKUP[key];
    if (!planDetails) {
        return res.status(404).json({ message: 'License key not found.' });
    }

    const { planName, credits } = planDetails;

    const newLicense: ActivatedLicense = {
      key: key,
      email: email,
      planName: planName,
      creditsAdded: credits,
      activationDate: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    // Run a transaction to update user and log the license
    const updatedStatus = await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
            throw new Error("User not found.");
        }
        const currentData = userDoc.data() as UserStatus;
        
        const newCredits = currentData.credits + credits;
        const newLicenses = [...currentData.licenses, newLicense];

        const newStatus: UserStatus = {
            ...currentData,
            plan: planName, // Update to the highest activated plan
            credits: newCredits,
            licenses: newLicenses,
        };

        transaction.update(userRef, { ...newStatus });
        transaction.set(licensesRef.doc(key), { usedBy: MOCK_USER_ID, activationDate: new Date() });
        
        return newStatus;
    });

    res.status(200).json(updatedStatus);

  } catch (error) {
    console.error('License activation error:', error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'An internal server error occurred.' });
  }
}
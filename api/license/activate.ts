// api/license/activate.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../services/firebase';
import { UserStatus, ActivatedLicense } from '../../services/licenseService';
import { PLANS } from '../../config/plans';
import { verifyFirebaseToken } from '../../services/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const decodedToken = await verifyFirebaseToken(req);
  if (!decodedToken) {
    return res.status(401).json({ message: 'Unauthorized: You must be signed in to activate a license.' });
  }
  const userId = decodedToken.uid;

  const { email, key } = req.body;

  if (!email || !key) {
    return res.status(400).json({ message: 'Email and license key are required.' });
  }

  try {
    const licensesRef = db.collection('licenses');
    const userRef = db.collection('users').doc(userId);
    
    const snapshot = await licensesRef.where('key', '==', key).limit(1).get();
    if (!snapshot.empty) {
      return res.status(409).json({ message: 'This license key has already been activated.' });
    }

    const planDetails = PLANS.find(p => p.id === key);

    if (!planDetails) {
        return res.status(404).json({ message: 'Invalid license key. Please check the key and try again.' });
    }

    const { name: planName, credits } = planDetails;

    const newLicense: ActivatedLicense = {
      key: key,
      email: email,
      planName: planName,
      creditsAdded: credits,
      activationDate: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    const updatedStatus = await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
            throw new Error("User not found. Please try logging out and back in.");
        }
        const currentData = userDoc.data() as UserStatus;
        
        const newCredits = currentData.credits + credits;
        const newLicenses = [...currentData.licenses, newLicense];

        const newStatus: UserStatus = {
            ...currentData,
            plan: planName,
            credits: newCredits,
            licenses: newLicenses,
        };

        transaction.update(userRef, newStatus);
        
        transaction.set(licensesRef.doc(key), { 
          usedBy: userId, 
          email: email,
          plan: planName,
          activationDate: newLicense.activationDate 
        });
        
        return newStatus;
    });

    res.status(200).json(updatedStatus);

  } catch (error) {
    console.error('License activation error:', error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'An internal server error occurred.' });
  }
}
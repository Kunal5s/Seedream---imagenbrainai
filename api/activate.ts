import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { LicenseStatus } from '../services/licenseService';
import { getXataClient } from '../services/xataService';

const xata = getXataClient();

const PLAN_CREDITS: Record<string, { credits: number }> = {
  'Booster': { credits: 5000 },
  'Premium': { credits: 15000 },
  'Professional': { credits: 30000 },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email, key } = req.body;

    if (!email || !key || typeof email !== 'string' || typeof key !== 'string') {
        return res.status(400).json({ message: 'Email and key are required.' });
    }

    const upperCaseKey = key.trim().toUpperCase();
    let newPlan: 'Booster' | 'Premium' | 'Professional' | null = null;

    if (upperCaseKey.startsWith('BOOST-')) newPlan = 'Booster';
    else if (upperCaseKey.startsWith('PREM-')) newPlan = 'Premium';
    else if (upperCaseKey.startsWith('PRO-')) newPlan = 'Professional';

    if (!newPlan) {
        return res.status(400).json({ message: 'Invalid activation key format. Please check your key and try again.' });
    }

    try {
        // --- Prevent duplicate key activation using Xata ---
        const keyUsedMarker = `key-used:${upperCaseKey}`;
        const alreadyUsed = await xata.db.used_activation_keys.read(keyUsedMarker);
        if (alreadyUsed) {
            return res.status(409).json({ message: 'This activation key has already been used.' });
        }
        
        const lowerCaseEmail = email.toLowerCase();
        // Even if user is activating for the first time without being logged in, 
        // they need an account. The signup flow creates this account.
        const existingUser = await xata.db.users.filter({ email: lowerCaseEmail }).getFirst();
        
        if (!existingUser) {
             return res.status(404).json({ message: 'No account found for this email. Please sign up first before activating a key.' });
        }
        
        const planDetails = PLAN_CREDITS[newPlan];
        const newCredits = (existingUser.credits || 0) + planDetails.credits;
        
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        const updatedRecord = await existingUser.update({
            plan: newPlan,
            credits: newCredits,
            key: key,
            subscriptionStatus: 'active',
            planExpiryDate: expiryDate,
        });
        
        // Mark key as used in Xata table. The ID is the key itself.
        await xata.db.used_activation_keys.create({ id: keyUsedMarker });
        
        const responseData: LicenseStatus = {
            name: updatedRecord.name,
            email: updatedRecord.email!,
            plan: updatedRecord.plan as LicenseStatus['plan'],
            credits: updatedRecord.credits!,
            key: updatedRecord.key,
            subscriptionStatus: updatedRecord.subscriptionStatus,
            planExpiryDate: updatedRecord.planExpiryDate?.toISOString() || null,
        };
        
        return res.status(200).json(responseData);

    } catch (error) {
        console.error(`Error activating key for ${email}:`, error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
// api/images/save.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../services/firebase';
import { uploadImageToR2 } from '../../services/r2';
import { ImageRecord } from '../../services/apiService';
import { UserStatus } from '../../services/licenseService';
import { PLAN_DETAILS } from '../../config/plans';
import { verifyFirebaseToken } from '../../services/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { base64Image, prompt, fullPrompt, width, height, isPremium } = req.body;
    if (!base64Image || !prompt || !fullPrompt || !width || !height) {
        return res.status(400).json({ message: 'Missing required image data for saving.' });
    }
    
    // Guest users don't need a token, but licensed users do.
    const decodedToken = await verifyFirebaseToken(req);
    // If it's a premium generation, a token is mandatory. For free ones, it's optional (for guests).
    if (isPremium && !decodedToken) {
        return res.status(401).json({ message: 'Unauthorized: A valid user session is required for premium generation.' });
    }
    const userId = decodedToken ? decodedToken.uid : 'guest_user';

    try {
        const imagesRef = db.collection('images');
        let finalCredits = 0;

        // --- Credit Deduction for Premium (Logged-in) Users ---
        if (isPremium && userId !== 'guest_user' && decodedToken) {
            const userRef = db.collection('users').doc(userId);
            const newCreditTotal = await db.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists) throw new Error('User not found for credit deduction.');
                
                const userData = userDoc.data() as UserStatus;
                const planKey = Object.keys(PLAN_DETAILS).find(k => PLAN_DETAILS[k].name === userData.plan) || 'FREE_TRIAL';
                const creditsNeeded = PLAN_DETAILS[planKey]?.creditsPerImage || 5; // The cost for generating a single image.

                if (userData.credits < creditsNeeded) {
                    throw new Error('Insufficient credits.');
                }
                
                const newTotal = userData.credits - creditsNeeded;
                transaction.update(userRef, { credits: newTotal });
                return newTotal;
            });
            finalCredits = newCreditTotal;
        }

        // --- Upload image to R2 and save record to Firestore ---
        const r2Url = await uploadImageToR2(base64Image, userId);
        const now = new Date();
        const newImageData = {
            url: r2Url, prompt, fullPrompt, width, height,
            createdAt: now.toISOString(), userId: userId,
            marketplaceStatus: 'private' as const,
            price: null, purchaseLink: null, title: null, description: null,
        };
        const newImageRef = await imagesRef.add(newImageData);
        
        // The old, flawed marketplace logic has been removed from here. 
        // It is now handled by the cron job `api/cron/move-to-marketplace.ts` for reliability.
        
        const savedRecord: ImageRecord = { ...newImageData, id: newImageRef.id };
        res.status(200).json({ savedRecord, credits: finalCredits });

    } catch (error) {
        console.error("Image saving error:", error);
        const msg = error instanceof Error ? error.message : "Unknown server error during save.";
        res.status(500).json({ success: false, message: msg });
    }
}
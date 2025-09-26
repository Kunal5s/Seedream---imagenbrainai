// api/images/save.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../services/firebase';
import { uploadImageToR2 } from '../../services/r2';
import { ImageRecord } from '../../services/apiService';

const MOCK_USER_ID = 'user_demo_123';
const PURCHASE_LINK = 'https://buy.polar.sh/polar_cl_Dq1dKRQK58YEweEc0gwvPacYvNAY9ANcV34G36N0';
const HISTORY_LIMIT = 30;

const getRandomPrice = () => {
    const roll = Math.random();
    if (roll < 0.05) return Math.floor(Math.random() * (1000 - 501 + 1)) + 501;
    if (roll < 0.15) return Math.floor(Math.random() * (500 - 151 + 1)) + 151;
    return Math.floor(Math.random() * (150 - 20 + 1)) + 20;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { base64Image, prompt, fullPrompt, width, height } = req.body;
  if (!base64Image || !prompt || !fullPrompt || !width || !height) {
    return res.status(400).json({ message: 'Missing required image data for saving.' });
  }

  try {
    const r2Url = await uploadImageToR2(base64Image, MOCK_USER_ID);
    
    const now = new Date();
    const newImageData = {
      url: r2Url,
      prompt: prompt,
      fullPrompt: fullPrompt,
      width: width,
      height: height,
      createdAt: now.toISOString(),
      userId: MOCK_USER_ID,
      // FIX: Explicitly cast `marketplaceStatus` to the literal type `'private' as const` to satisfy the `ImageRecord` type requirement. This prevents TypeScript from widening the type to `string`, resolving the type incompatibility error when creating the `savedRecord` object.
      marketplaceStatus: 'private' as const,
      price: null,
      purchaseLink: null,
    };
    
    const newImageRef = await db.collection('images').add(newImageData);

    // --- New Marketplace Logic ---
    const imagesRef = db.collection('images');
    const userImagesSnapshot = await imagesRef
        .where('userId', '==', MOCK_USER_ID)
        .get();
        
    const privateImages = userImagesSnapshot.docs
        .filter(doc => doc.data().marketplaceStatus === 'private')
        .sort((a, b) => new Date(a.data().createdAt).getTime() - new Date(b.data().createdAt).getTime()); // oldest first

    if (privateImages.length > HISTORY_LIMIT) {
        const oldestDoc = privateImages[0];
        await oldestDoc.ref.update({
            marketplaceStatus: 'live',
            price: getRandomPrice(),
            purchaseLink: PURCHASE_LINK,
        });
    }
    // --- End New Logic ---

    const savedRecord: ImageRecord = { ...newImageData, id: newImageRef.id };
    res.status(200).json(savedRecord);

  } catch (error) {
    console.error("Image saving error:", error);
    const msg = error instanceof Error ? error.message : "Unknown server error during save.";
    res.status(500).json({ success: false, message: msg });
  }
}

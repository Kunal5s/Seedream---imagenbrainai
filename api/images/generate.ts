// api/images/generate.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../services/firebase';
import { uploadImageToR2 } from '../../services/r2';
import { PLAN_DETAILS, Plan } from '../../config/plans';
import { UserStatus } from '../../services/licenseService';

// MOCK: In a real app, you'd get this from a session cookie or JWT
const MOCK_USER_ID = 'user_demo_123';

const getDimensions = (aspectRatioString: string): { width: number, height: number } => {
    const baseSize = 1024;
    const ratioName = aspectRatioString.match(/^(.*?)\s/)?.[1] || 'Square';
    switch (ratioName) {
        case 'Square': return { width: baseSize, height: baseSize };
        case 'Portrait': return { width: 768, height: baseSize };
        case 'Landscape': return { width: baseSize, height: 768 };
        case 'Tall': return { width: 576, height: baseSize };
        case 'Wide': return { width: 1344, height: 768 }; // Use a common wide format
        default: return { width: baseSize, height: baseSize };
    }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { 
    prompt, 
    negativePrompt, 
    style, 
    aspectRatio, 
    mood, 
    lighting, 
    color, 
    numberOfImages = 1 
  } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required.' });
  }

  const userRef = db.collection('users').doc(MOCK_USER_ID);
  
  try {
    const generatedUrls: string[] = [];
    let finalCredits = 0;

    await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
          throw new Error('User not found.');
        }

        const userData = userDoc.data() as UserStatus;
        const plan: Plan = Object.values(PLAN_DETAILS).find(p => p.name === userData.plan) || PLAN_DETAILS['FREE_TRIAL'];
        const creditsPerImage = plan.creditsPerImage;
        const totalCreditsNeeded = numberOfImages * creditsPerImage;
        
        if (userData.credits < totalCreditsNeeded) {
          throw new Error(`Not enough credits. You need ${totalCreditsNeeded} but only have ${userData.credits}.`);
        }
        
        const fullPrompt = `${prompt}, ${style}, ${mood} mood, ${lighting} lighting, ${color} color scheme, --no ${negativePrompt || 'text, watermark'}`;
        const dims = getDimensions(aspectRatio);

        const imagePromises = Array.from({ length: numberOfImages }).map(async () => {
          const seed = Math.floor(Math.random() * 100000);
          const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${dims.width}&height=${dims.height}&seed=${seed}`;
          
          const imageResponse = await fetch(url);
          if (!imageResponse.ok) {
            throw new Error(`Pollinations API failed with status: ${imageResponse.statusText}`);
          }
          
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString('base64');
          
          const r2Url = await uploadImageToR2(base64Image, MOCK_USER_ID);
          
          // Save to history
          const historyRef = userRef.collection('imageHistory').doc();
          transaction.set(historyRef, { url: r2Url, prompt, createdAt: new Date().toISOString() });
          
          return r2Url;
        });

        const urls = await Promise.all(imagePromises);
        generatedUrls.push(...urls);

        // Deduct credits
        finalCredits = userData.credits - totalCreditsNeeded;
        transaction.update(userRef, { credits: finalCredits });
    });
    
    res.status(200).json({ 
        imageUrls: generatedUrls,
        credits: finalCredits 
    });

  } catch (error) {
    console.error("Image generation error:", error);
    // Attempt to refund credits on failure by just returning current credit balance
    const userDoc = await userRef.get();
    if (userDoc.exists) {
        res.status(500).json({ message: error instanceof Error ? error.message : "An unknown error occurred.", credits: userDoc.data()?.credits });
    } else {
        res.status(500).json({ message: error instanceof Error ? error.message : "An unknown error occurred." });
    }
  }
}

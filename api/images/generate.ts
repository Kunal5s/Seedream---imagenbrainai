// api/images/generate.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { db } from '../../services/firebase';
import { uploadImageToR2 } from '../../services/r2';
import { PLAN_DETAILS, Plan } from '../../config/plans';
import { UserStatus } from '../../services/licenseService';

// MOCK: In a real app, you'd get this from a session cookie or JWT
const MOCK_USER_ID = 'user_demo_123';

if (!process.env.API_KEY) {
    throw new Error("Missing API_KEY environment variable.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        
        const fullPrompt = `${prompt}, ${style} style, ${mood} mood, ${lighting} lighting, ${color} color scheme. --no ${negativePrompt || 'text, watermark'}`;

        const imagePromises = Array.from({ length: numberOfImages }).map(async () => {
          const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: aspectRatio.match(/\((\d+:\d+)\)/)?.[1] as any || '1:1',
            },
          });
          
          if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error('Image generation failed to produce an image.');
          }

          const base64Image = response.generatedImages[0].image.imageBytes;
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
    // Attempt to refund credits on failure
    const userDoc = await userRef.get();
    if (userDoc.exists) {
        res.status(500).json({ message: error instanceof Error ? error.message : "An unknown error occurred.", credits: userDoc.data()?.credits });
    } else {
        res.status(500).json({ message: error instanceof Error ? error.message : "An unknown error occurred." });
    }
  }
}

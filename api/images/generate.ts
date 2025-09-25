// api/images/generate.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../services/firebase';
import { uploadImageToR2 } from '../../services/r2';
import { PLAN_DETAILS, Plan } from '../../config/plans';
import { UserStatus } from '../../services/licenseService';
import { IMAGEN_BRAIN_RATIOS } from '../../constants';

// MOCK: In a real app, you'd get this from a session cookie or JWT
const MOCK_USER_ID = 'user_demo_123';

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
    // Step 1: Pre-flight check for user and credits (outside transaction)
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error('User not found.');
    }

    const userData = userDoc.data() as UserStatus;
    const plan: Plan = Object.values(PLAN_DETAILS).find(p => p.name === userData.plan) || PLAN_DETAILS['FREE_TRIAL'];
    const creditsPerImage = plan.creditsPerImage;
    const totalCreditsNeeded = numberOfImages * creditsPerImage;

    if (userData.credits < totalCreditsNeeded) {
      // Use 402 Payment Required for insufficient funds
      return res.status(402).json({ message: `Not enough credits. You need ${totalCreditsNeeded} but only have ${userData.credits}.` });
    }
    
    // Step 2: Create an array of image generation promises to run in parallel for maximum speed
    const generationPromises = Array.from({ length: numberOfImages }).map(async () => {
        const fullPrompt = `${prompt}, ${style} style, ${mood}, ${lighting}, ${color} theme, --no ${negativePrompt || 'text, watermark'}`;
        const ratioDetails = IMAGEN_BRAIN_RATIOS.find(r => r.name === aspectRatio) || IMAGEN_BRAIN_RATIOS[0];

        const pollResponse = await fetch('https://api.pollinations.ai/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: fullPrompt,
                width: ratioDetails.width,
                height: ratioDetails.height,
                watermark: false
            })
        });

        if (!pollResponse.ok) {
            const errorBody = await pollResponse.text().catch(() => 'Could not read error body.');
            console.error(`Pollinations API returned an error. Status: ${pollResponse.status}. Body: ${errorBody}`);
            throw new Error(`Image provider failed with status: ${pollResponse.statusText}`);
        }
        
        const responseData = await pollResponse.json();
        const imageUrl = responseData?.image_url;

        if (!imageUrl) {
            console.error('Pollinations API did not return an image_url.', responseData);
            throw new Error('Image provider did not return a valid image URL.');
        }

        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch the generated image from URL: ${imageResponse.statusText}`);
        }
        
        const contentType = imageResponse.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
            throw new Error('Image provider returned an invalid content type. The service may be temporarily down.');
        }
        
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        const r2Url = await uploadImageToR2(base64Image, MOCK_USER_ID);
        
        return {
            url: r2Url,
            prompt,
            createdAt: new Date().toISOString()
        };
    });
    
    // Execute all promises concurrently
    const generatedImagesData = await Promise.all(generationPromises);

    // Step 3: Write to database in a single, short-lived transaction
    let finalCredits = 0;
    await db.runTransaction(async (transaction) => {
        const freshUserDoc = await transaction.get(userRef);
        if (!freshUserDoc.exists) {
            throw new Error('User not found during transaction.');
        }
        const currentData = freshUserDoc.data() as UserStatus;

        if (currentData.credits < totalCreditsNeeded) {
            throw new Error('User credits changed during generation; aborting to prevent overdraft.');
        }

        finalCredits = currentData.credits - totalCreditsNeeded;
        transaction.update(userRef, { credits: finalCredits });

        for (const imageData of generatedImagesData) {
            const historyRef = userRef.collection('imageHistory').doc();
            transaction.set(historyRef, imageData);
        }
    });
    
    res.status(200).json({ 
        imageUrls: generatedImagesData.map(d => d.url),
        credits: finalCredits 
    });

  } catch (error) {
    console.error("Image generation error:", error);
    // On failure, return the current credit balance without making changes.
    const userDoc = await userRef.get();
    const currentCredits = userDoc.exists ? userDoc.data()?.credits : 0;
    res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred during image generation.",
        credits: currentCredits 
    });
  }
}
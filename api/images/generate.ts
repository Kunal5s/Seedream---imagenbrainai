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
    numberOfImages = 1,
    model
  } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required.' });
  }
  if (!model) {
    return res.status(400).json({ message: 'AI Model is required.' });
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
        // Construct a detailed prompt for better results
        const fullPrompt = `${prompt}, ${style}, ${mood} mood, ${lighting} lighting, ${color} color scheme`;
        // For OpenRouter, it's better to use the negative_prompt field if the model supports it. 
        // We'll build a request body that includes it.
        const ratioDetails = IMAGEN_BRAIN_RATIOS.find(r => r.name === aspectRatio) || IMAGEN_BRAIN_RATIOS[0];

        // NEW: OpenRouter API call
        const openRouterResponse = await fetch('https://openrouter.ai/api/v1/images/generations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://www.imagenbrainai.in/',
                'X-Title': 'Seedream ImagenBrainAi',
            },
            body: JSON.stringify({
                model: model,
                prompt: fullPrompt,
                negative_prompt: negativePrompt,
                n: 1, // Generate one image per API call
                width: ratioDetails.width,
                height: ratioDetails.height,
                response_format: 'b64_json', // Request base64 encoded image
            })
        });

        if (!openRouterResponse.ok) {
            const errorBody = await openRouterResponse.json().catch(() => ({ error: { message: 'Could not read error body from OpenRouter.' }}));
            console.error(`OpenRouter API returned an error. Status: ${openRouterResponse.status}. Body:`, errorBody);
            throw new Error(`Image provider failed: ${errorBody.error?.message || openRouterResponse.statusText}`);
        }
        
        const responseData = await openRouterResponse.json();
        const base64Image = responseData?.data?.[0]?.b64_json;

        if (!base64Image) {
            console.error('OpenRouter API did not return a base64 image.', responseData);
            throw new Error('Image provider did not return a valid image.');
        }

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
// api/images/generate.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Buffer } from 'buffer';
import { GoogleGenAI } from '@google/genai';
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
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error('User not found.');
    }

    const userData = userDoc.data() as UserStatus;
    const plan: Plan = Object.values(PLAN_DETAILS).find(p => p.name === userData.plan) || PLAN_DETAILS['FREE_TRIAL'];
    const creditsPerImage = plan.creditsPerImage;
    const totalCreditsNeeded = numberOfImages * creditsPerImage;

    if (userData.credits < totalCreditsNeeded) {
      return res.status(402).json({ message: `Not enough credits. You need ${totalCreditsNeeded} but only have ${userData.credits}.` });
    }
    
    const generationPromises = Array.from({ length: numberOfImages }).map(async () => {
        const fullPrompt = [
          prompt,
          style !== 'Photorealistic' ? style : '',
          mood !== 'Neutral' ? `${mood} mood` : '',
          lighting !== 'Neutral' ? `${lighting} lighting` : '',
          color !== 'Default' ? `${color} color scheme` : '',
        ].filter(Boolean).join(', ');

        const ratioDetails = IMAGEN_BRAIN_RATIOS.find(r => r.name === aspectRatio) || IMAGEN_BRAIN_RATIOS[0];
        
        let base64Image: string;

        if (model === 'google/imagen-4.0') {
            if (!process.env.GOOGLE_API_KEY) {
                throw new Error('Google API key is not configured on the server.');
            }
            const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
            
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: fullPrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/png',
                    aspectRatio: ratioDetails.aspectRatio,
                },
            });

            const b64Json = response.generatedImages[0]?.image?.imageBytes;
            if (!b64Json) {
                throw new Error('Google Imagen API did not return a valid image.');
            }
            base64Image = b64Json;

        } else if (model === 'pollinations/pollinations-ai') {
            const pollinationPrompt = encodeURIComponent(fullPrompt);
            const pollinationUrl = `https://image.pollinations.ai/prompt/${pollinationPrompt}?width=${ratioDetails.width}&height=${ratioDetails.height}&nologo=true`;
            
            const imageResponse = await fetch(pollinationUrl);
            if (!imageResponse.ok) {
                throw new Error(`Pollinations.ai failed with status: ${imageResponse.statusText}`);
            }
            
            const imageBuffer = await imageResponse.arrayBuffer();
            base64Image = Buffer.from(imageBuffer).toString('base64');
        } else {
            const referer = req.headers.referer || 'https://www.imagenbrainai.in/';
            const siteTitle = new URL(referer).hostname || 'Seedream ImagenBrainAi';
    
            const openRouterResponse = await fetch('https://openrouter.ai/api/v1/images/generations', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': referer,
                    'X-Title': siteTitle,
                },
                body: JSON.stringify({
                    model: model,
                    prompt: fullPrompt,
                    negative_prompt: negativePrompt,
                    n: 1,
                    width: ratioDetails.width,
                    height: ratioDetails.height,
                    response_format: 'b64_json',
                })
            });
    
            if (!openRouterResponse.ok) {
                const errorBody = await openRouterResponse.json().catch(() => ({ error: { message: 'Could not read error body from OpenRouter.' }}));
                console.error(`OpenRouter API returned an error. Status: ${openRouterResponse.status}. Body:`, errorBody);
                throw new Error(`Image provider failed: ${errorBody.error?.message || openRouterResponse.statusText}`);
            }
            
            const responseData = await openRouterResponse.json();
            const b64Json = responseData?.data?.[0]?.b64_json;

            if (!b64Json) {
                console.error('OpenRouter API did not return a base64 image.', responseData);
                throw new Error('Image provider did not return a valid image.');
            }
            base64Image = b64Json;
        }

        if (!base64Image) {
            throw new Error('Failed to obtain a base64 image from the provider.');
        }

        const r2Url = await uploadImageToR2(base64Image, MOCK_USER_ID);
        
        return {
            url: r2Url,
            prompt,
            createdAt: new Date().toISOString()
        };
    });
    
    const generatedImagesData = await Promise.all(generationPromises);

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
    const userDoc = await userRef.get();
    const currentCredits = userDoc.exists ? userDoc.data()?.credits : 0;
    res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown error occurred during image generation.",
        credits: currentCredits 
    });
  }
}
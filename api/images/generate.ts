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

// Define result types for clarity
type FulfilledResult = { status: 'fulfilled'; value: { url: string; prompt: string; createdAt: string; } };
type RejectedResult = { status: 'rejected'; reason: Error };
type GenerationSettledResult = FulfilledResult | RejectedResult;
export type FrontendResult = { status: 'success'; url: string; } | { status: 'error'; message: string; };

/**
 * Generates a single image by calling the appropriate AI provider based on the selected model.
 * This function encapsulates the logic for Google, Pollinations, and OpenRouter.
 */
async function generateSingleImage(
  prompt: string,
  negativePrompt: string,
  style: string,
  aspectRatioName: string,
  mood: string,
  lighting: string,
  color: string,
  model: string,
  httpReferer: string
): Promise<{ url: string; prompt: string; createdAt: string; }> {
  
  const fullPrompt = [
    prompt,
    style !== 'Photorealistic' ? style : '',
    mood !== 'Neutral' ? `${mood} mood` : '',
    lighting !== 'Neutral' ? `${lighting} lighting` : '',
    color !== 'Default' ? `${color} color scheme` : '',
  ].filter(Boolean).join(', ');

  const ratioDetails = IMAGEN_BRAIN_RATIOS.find(r => r.name === aspectRatioName) || IMAGEN_BRAIN_RATIOS[0];
  
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
      const siteTitle = new URL(httpReferer).hostname || 'Seedream ImagenBrainAi';

      const openRouterResponse = await fetch('https://openrouter.ai/api/v1/images/generations', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': httpReferer,
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
      prompt: prompt, // Use original prompt for history
      createdAt: new Date().toISOString()
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { 
    prompt, negativePrompt, style, aspectRatio, mood, lighting, color, numberOfImages = 1, model
  } = req.body;

  if (!prompt || !model) {
    return res.status(400).json({ message: 'Prompt and AI Model are required.' });
  }
  
  const userRef = db.collection('users').doc(MOCK_USER_ID);
  
  try {
    const userDoc = await userRef.get();
    if (!userDoc.exists) throw new Error('User not found.');

    const userData = userDoc.data() as UserStatus;
    const plan: Plan = Object.values(PLAN_DETAILS).find(p => p.name === userData.plan) || PLAN_DETAILS['FREE_TRIAL'];
    const creditsPerImage = plan.creditsPerImage;
    const totalCreditsNeeded = numberOfImages * creditsPerImage;

    if (userData.credits < totalCreditsNeeded) {
      return res.status(402).json({ message: `Not enough credits. You need ${totalCreditsNeeded} but only have ${userData.credits}.` });
    }
    
    const referer = req.headers.referer || 'https://www.imagenbrainai.in/';

    const generationPromises = Array.from({ length: numberOfImages }).map(() => 
        generateSingleImage(prompt, negativePrompt, style, aspectRatio, mood, lighting, color, model, referer)
    );

    const results: GenerationSettledResult[] = await Promise.allSettled(generationPromises);
    const successfulGenerations = results.filter((r): r is FulfilledResult => r.status === 'fulfilled').map(r => r.value);

    const creditsToDeduct = successfulGenerations.length * creditsPerImage;
    let finalCredits = userData.credits;

    if (creditsToDeduct > 0) {
        await db.runTransaction(async (transaction) => {
            const freshUserDoc = await transaction.get(userRef);
            if (!freshUserDoc.exists) throw new Error('User not found during transaction.');
            
            const currentData = freshUserDoc.data() as UserStatus;
            if (currentData.credits < creditsToDeduct) throw new Error('User credits changed during generation; aborting to prevent overdraft.');

            finalCredits = currentData.credits - creditsToDeduct;
            transaction.update(userRef, { credits: finalCredits });

            for (const imageData of successfulGenerations) {
                const historyRef = userRef.collection('imageHistory').doc();
                transaction.set(historyRef, imageData);
            }
        });
    }

    const frontendResults: FrontendResult[] = results.map(result => {
        if (result.status === 'fulfilled') {
            return { status: 'success', url: result.value.url };
        } else {
            const errorMessage = result.reason instanceof Error ? result.reason.message : 'An unknown generation error occurred.';
            console.error('Individual generation failed:', result.reason);
            return { status: 'error', message: errorMessage };
        }
    });

    res.status(200).json({ 
        results: frontendResults,
        credits: finalCredits 
    });

  } catch (error) {
    console.error("Top-level image generation error:", error);
    const userDoc = await userRef.get();
    const currentCredits = userDoc.exists ? (userDoc.data() as UserStatus).credits : 0;
    res.status(500).json({ 
        message: error instanceof Error ? error.message : "An unknown server error occurred.",
        credits: currentCredits 
    });
  }
}
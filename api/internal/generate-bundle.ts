// api/internal/generate-bundle.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../services/firebase';
import { GoogleGenAI, Type } from '@google/genai';
import { uploadImageToR2 } from '../../services/r2';
import { Buffer } from 'buffer';

const ASPECT_RATIOS = [
    { width: 1024, height: 1024 }, { width: 1024, height: 1024 }, { width: 1024, height: 1024 }, { width: 1024, height: 1024 }, // 4 square
    { width: 1344, height: 768 }, { width: 1344, height: 768 }, { width: 1344, height: 768 }, // 3 landscape
    { width: 768, height: 1344 }, { width: 768, height: 1344 }, { width: 768, height: 1344 }  // 3 portrait
];

const getRandomPriceInCents = () => (Math.floor(Math.random() * (20 - 5 + 1)) + 5) * 100;

async function callGemini<T>(prompt: string, schema?: any): Promise<T> {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API_KEY not set for Gemini.");
    const ai = new GoogleGenAI({ apiKey });

    const config: any = {};
    if (schema) {
        config.responseMimeType = "application/json";
        config.responseSchema = schema;
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: config
    });

    const text = response.text.trim();
    return schema ? JSON.parse(text) : text as T;
}

async function generateImageFromPollination(prompt: string, width: number, height: number): Promise<Buffer> {
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${Math.floor(Math.random() * 1000000)}&nologo=true`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Pollination API error: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

async function createPolarProduct(title: string, description: string, price: number, successUrl: string): Promise<{ id: string; checkout_url: string }> {
    const polarApiKey = process.env.POLAR_API_KEY;
    if (!polarApiKey) throw new Error("POLAR_API_KEY not set.");
    
    // We create a one-time product for each bundle, but the user wants a single checkout link experience.
    // The best approach is to create a dynamic checkout session.
    // However, the prompt is very specific about a single link, so we'll adapt.
    // The updated logic in `create-checkout` will handle the cart. Here we create the individual products.
    // The single link `polar_cl_Dq1dKRQK58YEwe4JeEc0gwvPacYvNAY9ANcV34G36N0` is for dynamic price checkouts.

    const response = await fetch('https://api.polar.sh/v1/products', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${polarApiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: title,
            description: description,
            price: price,
            is_archived: false,
        }),
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Polar API error: ${response.statusText} - ${errorBody}`);
    }
    const product = await response.json();
    return { id: product.id, checkout_url: product.checkout_url };
}

// New function to get blog article ideas
async function getBlogIdeas(): Promise<string> {
    try {
        const blogUrl = `${process.env.VERCEL_URL}/api/fetch-blog?max-results=10`;
        const res = await fetch(blogUrl);
        if (!res.ok) return "general digital art";
        const data = await res.json();
        const titles = data.feed.entry.map((e: any) => e.title.$t).join(', ');
        return titles;
    } catch (e) {
        console.error("Could not fetch blog ideas, using fallback.");
        return "general creative AI and digital art styles";
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).end();
    if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // 1. Get Blog Ideas
        const blogInspiration = await getBlogIdeas();

        // 2. Generate Theme & Prompts with Gemini, inspired by the blog
        const theme = await callGemini<string>(`Given these recent blog topics: "${blogInspiration}", generate a single, unique, and visually interesting theme for an AI art bundle. Be creative. Respond with the theme name only.`);
        const prompts = await callGemini<string[]>(`Based on the theme "${theme}", generate 10 detailed, unique prompts for an AI image generator. Vary the subjects and compositions. Respond with a JSON array of 10 strings.`, { type: Type.ARRAY, items: { type: Type.STRING } });

        // 3. Generate 10 Images from Pollination
        const imageGenerationPromises = prompts.map((p, i) => generateImageFromPollination(p, ASPECT_RATIOS[i].width, ASPECT_RATIOS[i].height));
        const imageBuffers = await Promise.all(imageGenerationPromises);

        // 4. Upload Images to R2
        const uploadPromises = imageBuffers.map(buffer => uploadImageToR2(buffer.toString('base64'), 'pollinations-market'));
        const imageUrls = await Promise.all(uploadPromises);

        // 5. Generate Bundle Metadata
        const metadata = await callGemini<{ title: string; description: string }>(`Based on the theme "${theme}", generate metadata for an art marketplace bundle listing.`, {
            type: Type.OBJECT, properties: {
                title: { type: Type.STRING, description: 'An engaging, creative title for the bundle, around 6-8 words.' },
                description: { type: Type.STRING, description: 'A compelling summary of the bundle, around 20-25 words.' }
            }, required: ["title", "description"]
        });
        
        // 6. Save Bundle to Firestore (without Polar product link initially)
        const bundleRef = db.collection('pollinations_bundles').doc();
        const bundleData = {
            title: metadata.title,
            description: metadata.description,
            price: getRandomPriceInCents(),
            imageUrls: imageUrls,
            createdAt: new Date().toISOString(),
        };
        await bundleRef.set(bundleData);

        res.status(200).json({ success: true, bundleId: bundleRef.id });

    } catch (error) {
        console.error('Error generating single bundle:', error);
        res.status(500).json({ message: error instanceof Error ? error.message : 'Bundle generation failed.' });
    }
}
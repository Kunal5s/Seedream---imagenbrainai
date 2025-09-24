import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Buffer } from 'buffer';
import { verifyToken } from '../services/authService';
import { getXataClient } from "../services/xataService";

const xata = getXataClient();

// Ensure all required environment variables are present
const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL } = process.env;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
  throw new Error("Missing required R2 environment variables.");
}

// Initialize the S3 client for Cloudflare R2
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://` + R2_ACCOUNT_ID + `.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // Set CORS headers for the actual request
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // --- Authentication ---
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing.' });
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
  const userId = decoded.userId;
  // --- End Authentication ---

  try {
    const { imageData, prompt } = req.body;

    if (!imageData || typeof imageData !== 'string') {
        return res.status(400).json({ message: 'imageData (base64 string) is required.' });
    }

    // Create a buffer from the base64 string, removing the data URI prefix
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const imageMimeType = imageData.substring(imageData.indexOf(':') + 1, imageData.indexOf(';'));
    const imageExtension = imageMimeType.split('/')[1] || 'png';

    // Create a unique, URL-safe filename
    const safePrompt = (prompt || 'untitled').substring(0, 50).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safePrompt}-${Date.now()}.${imageExtension}`;

    // Upload the image to R2
    await s3.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: filename,
        Body: buffer,
        ContentType: imageMimeType,
        ContentDisposition: 'inline' // Ensures image is displayed in browser
      })
    );
    
    // Construct the public URL for the uploaded file
    const publicUrl = `${R2_PUBLIC_URL}/${filename}`;

    // --- Save to User History in Xata ---
    await xata.db.generated_images.create({
        user: userId,
        imageUrl: publicUrl,
        prompt: prompt,
    });
    // --- End Save to History ---

    return res.status(200).json({ message: "Image saved successfully!", url: publicUrl });

  } catch (error) {
    console.error("Error uploading to R2:", error);
    const message = error instanceof Error ? error.message : 'Error uploading image.';
    return res.status(500).json({ message });
  }
}
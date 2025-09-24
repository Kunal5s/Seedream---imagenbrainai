import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Buffer } from 'buffer';
import { verifyToken } from '../services/authService';
import { getXataClient } from "../services/xataService";

const xata = getXataClient();

// Ensure all required R2 environment variables are present
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

const handleGetHistory = async (req: VercelRequest, res: VercelResponse, userId: string) => {
    const images = await xata.db.generated_images
        .filter({ user: userId })
        .sort('xata.createdAt', 'desc')
        .getAll();
    return res.status(200).json(images);
};

const handleUploadImage = async (req: VercelRequest, res: VercelResponse, userId: string) => {
    const { imageData, prompt } = req.body;
    if (!imageData || typeof imageData !== 'string') {
        return res.status(400).json({ message: 'imageData (base64 string) is required.' });
    }

    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const imageMimeType = imageData.substring(imageData.indexOf(':') + 1, imageData.indexOf(';'));
    const imageExtension = imageMimeType.split('/')[1] || 'png';

    const safePrompt = (prompt || 'untitled').substring(0, 50).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safePrompt}-${Date.now()}.${imageExtension}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: filename,
        Body: buffer,
        ContentType: imageMimeType,
        ContentDisposition: 'inline'
      })
    );
    
    const publicUrl = `${R2_PUBLIC_URL}/${filename}`;

    await xata.db.generated_images.create({
        user: userId,
        imageUrl: publicUrl,
        prompt: prompt,
    });

    return res.status(200).json({ message: "Image saved successfully!", url: publicUrl });
};

const handleDeleteImage = async (req: VercelRequest, res: VercelResponse, userId: string) => {
    const { imageId, imageUrl } = req.body;
    if (!imageId || !imageUrl) {
        return res.status(400).json({ message: 'Image ID and Image URL are required.' });
    }

    const imageRecord = await xata.db.generated_images.read(imageId);
    if (!imageRecord) {
        return res.status(404).json({ message: 'Image record not found.' });
    }
    if (imageRecord.user?.id !== userId) {
        return res.status(403).json({ message: 'You do not have permission to delete this image.' });
    }
    
    try {
        const imageKey = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        await s3.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: imageKey }));
    } catch (r2Error) {
        console.error(`Failed to delete image from R2, but proceeding with DB deletion. Error:`, r2Error);
    }

    await imageRecord.delete();
    return res.status(200).json({ message: 'Image deleted successfully.' });
};


export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication token missing.' });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
    const userId = decoded.userId;

    try {
        if (req.method === 'GET') {
            return await handleGetHistory(req, res, userId);
        }

        if (req.method === 'POST') {
            const { action } = req.query;
            switch (action) {
                case 'upload':
                    return await handleUploadImage(req, res, userId);
                case 'delete':
                    return await handleDeleteImage(req, res, userId);
                default:
                    return res.status(400).json({ message: 'Invalid action specified for POST request.' });
            }
        }
        
        return res.status(405).json({ message: 'Method Not Allowed' });

    } catch (error) {
        console.error(`Error in /api/images handler:`, error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
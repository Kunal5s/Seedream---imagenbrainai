import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Buffer } from 'buffer';
import { verifyToken } from '../services/authService';
import { kvService, UserData } from "../services/kvService";

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL } = process.env;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
  throw new Error("Missing required R2 environment variables.");
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://` + R2_ACCOUNT_ID + `.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

const handleGetHistory = async (res: VercelResponse, user: UserData) => {
    const history = user.imageHistory || [];
    history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.status(200).json(history);
};

const handleUploadImage = async (req: VercelRequest, res: VercelResponse, user: UserData) => {
    const { imageData, prompt } = req.body;
    if (!imageData) return res.status(400).json({ message: 'imageData (base64 string) is required.' });

    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const imageMimeType = imageData.substring(imageData.indexOf(':') + 1, imageData.indexOf(';'));
    const imageExtension = imageMimeType.split('/')[1] || 'png';

    const safePrompt = (prompt || 'untitled').substring(0, 50).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${safePrompt}-${Date.now()}.${imageExtension}`;

    await s3.send(new PutObjectCommand({ Bucket: R2_BUCKET_NAME, Key: filename, Body: buffer, ContentType: imageMimeType }));
    const publicUrl = `${R2_PUBLIC_URL}/${filename}`;

    const newImage = { id: crypto.randomUUID(), imageUrl: publicUrl, prompt, createdAt: new Date().toISOString() };
    const updatedHistory = [...(user.imageHistory || []), newImage];
    
    await kvService.updateUser(user.email!, { imageHistory: updatedHistory });

    return res.status(200).json({ message: "Image saved successfully!", url: publicUrl });
};

const handleDeleteImage = async (req: VercelRequest, res: VercelResponse, user: UserData) => {
    const { imageId, imageUrl } = req.body;
    if (!imageId || !imageUrl) return res.status(400).json({ message: 'Image ID and Image URL are required.' });

    const history = user.imageHistory || [];
    const imageExists = history.some(img => img.id === imageId);
    if (!imageExists) return res.status(404).json({ message: 'Image record not found in user history.' });
    
    try {
        const imageKey = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        await s3.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: imageKey }));
    } catch (r2Error) {
        console.error(`Failed to delete image from R2, but proceeding with DB deletion. Error:`, r2Error);
    }

    const updatedHistory = history.filter(img => img.id !== imageId);
    await kvService.updateUser(user.email!, { imageHistory: updatedHistory });

    return res.status(200).json({ message: 'Image deleted successfully.' });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required.' });
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: 'Invalid token.' });
    
    try {
        const user = await kvService.getUserById(decoded.userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (req.method === 'GET') return await handleGetHistory(res, user);

        if (req.method === 'POST') {
            const { action } = req.query;
            switch (action) {
                case 'upload': return await handleUploadImage(req, res, user);
                case 'delete': return await handleDeleteImage(req, res, user);
                default: return res.status(400).json({ message: 'Invalid action for POST request.' });
            }
        }
        
        return res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.error(`Error in /api/images handler:`, error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
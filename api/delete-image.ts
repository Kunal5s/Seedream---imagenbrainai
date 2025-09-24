import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getXataClient } from '../services/xataService';
import { verifyToken } from '../services/authService';

const xata = getXataClient();

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } = process.env;

// Initialize S3 client for R2
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://` + R2_ACCOUNT_ID + `.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication token missing.' });
    }

    const { imageId, imageUrl } = req.body;
    if (!imageId || !imageUrl) {
        return res.status(400).json({ message: 'Image ID and Image URL are required.' });
    }

    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }
        
        const userId = decoded.userId;
        
        // 1. Verify ownership
        const imageRecord = await xata.db.generated_images.read(imageId);
        if (!imageRecord) {
            return res.status(404).json({ message: 'Image record not found.' });
        }
        if (imageRecord.user?.id !== userId) {
            return res.status(403).json({ message: 'You do not have permission to delete this image.' });
        }
        
        // 2. Delete from Cloudflare R2
        try {
            const imageKey = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
            await s3.send(
                new DeleteObjectCommand({
                    Bucket: R2_BUCKET_NAME,
                    Key: imageKey,
                })
            );
        } catch (r2Error) {
            // Log the error but don't block deletion from DB if the R2 file is already gone
            console.error(`Failed to delete image from R2 (key: ${imageUrl}), but proceeding with DB deletion. Error:`, r2Error);
        }

        // 3. Delete from Xata database
        await imageRecord.delete();

        return res.status(200).json({ message: 'Image deleted successfully.' });

    } catch (error) {
        console.error(`Error deleting image (ID: ${imageId}):`, error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

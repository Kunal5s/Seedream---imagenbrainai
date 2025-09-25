// services/r2.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
// FIX: Import `Buffer` from the `buffer` module to resolve the "Cannot find name 'Buffer'" TypeScript error.
import { Buffer } from 'buffer';

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const uploadImageToR2 = async (base64Image: string, userId: string): Promise<string> => {
  const bucketName = process.env.R2_BUCKET_NAME!;
  const publicUrlBase = process.env.R2_PUBLIC_URL!;

  if (!bucketName || !publicUrlBase) {
    throw new Error('Cloudflare R2 environment variables are not configured.');
  }

  const imageBuffer = Buffer.from(base64Image, 'base64');
  const imageName = `${userId}/${uuidv4()}.png`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: imageName,
    Body: imageBuffer,
    ContentType: 'image/png',
    ACL: 'public-read',
  });

  await R2.send(command);

  return `${publicUrlBase}/${imageName}`;
};

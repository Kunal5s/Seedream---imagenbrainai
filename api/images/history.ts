// api/images/history.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../services/firebase';
import { ImageRecord } from '../../services/apiService';
import { verifyFirebaseToken } from '../../services/auth';


export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const decodedToken = await verifyFirebaseToken(req);
  if (!decodedToken) {
    return res.status(401).json({ message: 'Unauthorized: You must be signed in to view your history.' });
  }
  const userId = decodedToken.uid;

  try {
    const historyCollectionRef = db.collection('images');
    const snapshot = await historyCollectionRef
        .where('userId', '==', userId)
        .get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const allUserImages: ImageRecord[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        url: data.url,
        prompt: data.prompt,
        fullPrompt: data.fullPrompt,
        width: data.width,
        height: data.height,
        createdAt: data.createdAt,
        marketplaceStatus: data.marketplaceStatus,
        price: data.price,
        purchaseLink: data.purchaseLink,
        title: data.title || null,
        description: data.description || null,
      };
    });

    const privateHistory = allUserImages
        .filter(item => item.marketplaceStatus === 'private')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json(privateHistory);

  } catch (error) {
    console.error('Error fetching image history:', error);
    res.status(500).json({ message: 'Failed to fetch image history.' });
  }
}
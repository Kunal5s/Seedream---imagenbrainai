// api/images/history.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../services/firebase';
import { ImageRecord } from '../../services/apiService';

const MOCK_USER_ID = 'user_demo_123';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  try {
    const historyCollectionRef = db.collection('images');
    const snapshot = await historyCollectionRef
        .where('userId', '==', MOCK_USER_ID)
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
// api/marketplace/list.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../services/firebase';
import { ImageRecord } from '../../services/apiService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  try {
    const marketplaceCollectionRef = db.collection('images');
    const snapshot = await marketplaceCollectionRef
        .where('marketplaceStatus', '==', 'live')
        .orderBy('createdAt', 'desc')
        .limit(50) // Paginate for performance
        .get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const items: ImageRecord[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        url: data.url,
        prompt: data.prompt,
        createdAt: data.createdAt,
        price: data.price,
        purchaseLink: data.purchaseLink,
      };
    });
    
    res.status(200).json(items);

  } catch (error) {
    console.error('Error fetching marketplace items:', error);
    res.status(500).json({ message: 'Failed to fetch marketplace items.' });
  }
}
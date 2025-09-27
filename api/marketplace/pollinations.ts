// api/marketplace/pollinations.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../services/firebase';
import { PollinationBundle } from '../../services/apiService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  try {
    const bundlesCollectionRef = db.collection('pollinations_bundles');
    const snapshot = await bundlesCollectionRef
        .orderBy('createdAt', 'desc')
        .get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const items: PollinationBundle[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        price: data.price,
        imageUrls: data.imageUrls,
        purchaseLink: data.purchaseLink,
        createdAt: data.createdAt,
        polarProductId: data.polarProductId,
      };
    });
    
    // Set caching headers for Vercel's edge network (5 minutes).
    res.setHeader('Cache-Control', `s-maxage=300, stale-while-revalidate`);
    res.status(200).json(items);

  } catch (error) {
    console.error('Error fetching pollination bundles:', error);
    res.status(500).json({ message: 'Failed to fetch pollination bundles.' });
  }
}

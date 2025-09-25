// api/images/history.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../services/firebase';
import { ImageHistoryItem } from '../../services/apiService';

// MOCK: In a real app, you'd get this from a session cookie or JWT
const MOCK_USER_ID = 'user_demo_123';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  try {
    const historyCollectionRef = db.collection('users').doc(MOCK_USER_ID).collection('imageHistory');
    const snapshot = await historyCollectionRef.orderBy('createdAt', 'desc').get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const history: ImageHistoryItem[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        url: data.url,
        prompt: data.prompt,
        createdAt: data.createdAt,
      };
    });
    
    res.status(200).json(history);

  } catch (error) {
    console.error('Error fetching image history:', error);
    res.status(500).json({ message: 'Failed to fetch image history.' });
  }
}

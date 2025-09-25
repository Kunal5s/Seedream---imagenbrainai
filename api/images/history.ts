// api/images/history.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ImageHistoryItem } from '../../services/apiService';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // --- MOCK BACKEND IMPLEMENTATION ---
  // This simulates fetching the user's image history.
  // A real backend would query the 'imageHistory' sub-collection in Firestore for the current user.

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const mockHistory: ImageHistoryItem[] = [
    {
      id: '1',
      url: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=600',
      prompt: 'A beautiful landscape with mountains and a lake at sunset, cinematic lighting',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      url: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=600',
      prompt: 'An astronaut floating in space looking at a colorful nebula, digital art',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      url: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=600',
      prompt: 'A close-up portrait of a robot with glowing blue eyes, photorealistic',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      url: 'https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=600',
      prompt: 'A fantasy castle on a floating island, surrounded by clouds',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
     {
      id: '5',
      url: 'https://images.pexels.com/photos/1528640/pexels-photo-1528640.jpeg?auto=compress&cs=tinysrgb&w=600',
      prompt: 'A dense, mystical forest with sunbeams filtering through the trees',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
     {
      id: '6',
      url: 'https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg?auto=compress&cs=tinysrgb&w=600',
      prompt: 'A sleek, futuristic sports car driving on a neon-lit highway at night',
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
  
  res.status(200).json(mockHistory);
}

// api/images/generate.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // --- MOCK BACKEND IMPLEMENTATION ---
  // This simulates the image generation process.
  // A real backend would call an AI service, upload to R2, and deduct credits from Firestore.

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  
  const { numberOfImages = 1, prompt } = req.body;
  
  if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required to generate an image.' });
  }

  // Simulate a delay to make it feel real
  setTimeout(() => {
    // Return placeholder images
    const placeholderImages = [
      'https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    ];
    
    const imageUrls = Array.from({ length: numberOfImages }, (_, i) => placeholderImages[i % placeholderImages.length]);

    // Simulate credit deduction
    const MOCK_CURRENT_CREDITS = 500;
    const CREDITS_PER_IMAGE = 5;
    const updatedCredits = MOCK_CURRENT_CREDITS - (numberOfImages * CREDITS_PER_IMAGE);

    res.status(200).json({ 
      imageUrls,
      credits: updatedCredits 
    });
  }, 2000); // 2-second delay
}

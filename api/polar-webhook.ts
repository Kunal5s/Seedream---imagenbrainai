// api/polar-webhook.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // --- MOCK BACKEND IMPLEMENTATION ---
  // A real backend would verify the signature and update the database.
  // For now, we'll just log the request and return a success response to Polar.
  
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  
  console.log('Polar webhook received:', req.body);
  
  // Acknowledge receipt to Polar.sh so it doesn't keep retrying.
  res.status(200).json({ message: 'Webhook received successfully.' });
}

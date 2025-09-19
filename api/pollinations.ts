import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * This Vercel Serverless Function acts as a robust server-side proxy for the Pollinations AI API.
 * It permanently solves the "Failed to fetch" CORS error by:
 * 1. Correctly handling the browser's preflight (OPTIONS) requests.
 * 2. Adding the necessary 'Access-Control-Allow-Origin' headers to all responses.
 * 3. Securely forwarding the client's request to the external API from the server-side.
 * 4. Returning the external API's response (or a structured error) back to the client.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Set CORS headers for all responses to allow cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // The browser sends an OPTIONS request first to check if the actual request is safe to send.
  // We need to respond with a 200 OK status to this preflight request.
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // We only want to proxy POST requests.
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Forward the client's request to the actual Pollinations API endpoint.
    const externalApiResponse = await fetch('https://api.pollinations.ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // The body from the client's request is passed through.
      body: JSON.stringify(req.body),
    });

    // If the external API returns an error, we forward that error to our client.
    if (!externalApiResponse.ok) {
      const errorText = await externalApiResponse.text();
      console.error(`Pollinations API Error: ${externalApiResponse.status} - ${errorText}`);
      return res.status(externalApiResponse.status).json({ message: `External API Error: ${errorText || externalApiResponse.statusText}` });
    }

    // If the request was successful, we forward the JSON data back to our client.
    const data = await externalApiResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error in Vercel proxy function:', error);
    const message = error instanceof Error ? error.message : 'An unknown internal server error occurred.';
    return res.status(500).json({ message: 'Internal Server Error', error: message });
  }
}

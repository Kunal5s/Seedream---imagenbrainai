// This API endpoint is obsolete and no longer in use.
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Allow', []);
    return res.status(410).json({ message: 'This endpoint is no longer available.' });
}

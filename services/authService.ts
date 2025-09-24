
import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Verifies a JWT token using the secret key.
 * @param {string} token - The JWT token to verify.
 * @returns {DecodedToken | null} The decoded token payload if valid, otherwise null.
 */
export const verifyToken = (token: string): DecodedToken | null => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not configured on the server.');
    throw new Error('Server configuration error.');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as DecodedToken;
    return decoded;
  } catch (error) {
    // This will catch expired tokens, invalid signatures, etc.
    console.error('Token verification failed:', error);
    return null;
  }
};

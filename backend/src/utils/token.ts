import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate a JWT token
 * @param payload - Token payload
 * @returns JWT token
 */
export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Generate a refresh token
 * @param payload - Token payload
 * @returns Refresh token
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
};

/**
 * Verify a JWT token
 * @param token - JWT token
 * @returns Decoded token payload
 */
export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

/**
 * Extract token from authorization header
 * @param header - Authorization header
 * @returns Token or null
 */
export const extractTokenFromHeader = (header: string | undefined): string | null => {
  if (!header) {
    return null;
  }

  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) {
    return null;
  }

  return token;
};
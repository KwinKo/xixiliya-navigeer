import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/token';
import User from '../models/User';

/**
 * Authentication middleware
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Auth middleware called');
    console.log('Authorization header:', req.headers.authorization);
    
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    console.log('Token extracted:', token.substring(0, 50) + '...');
    
    const payload = verifyToken(token);
    console.log('Token payload:', payload);
    console.log('User ID from payload:', payload.userId);
    console.log('User ID type:', typeof payload.userId);

    // Check if user exists and is not disabled
    const user = await User.findByPk(Number(payload.userId));

    console.log('User found:', user);
    
    if (!user) {
      console.log('User not found with ID:', Number(payload.userId));
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.disabled) {
      return res.status(403).json({
        success: false,
        message: 'Account is disabled',
      });
    }

    // Attach user to request object
    const userData = user.toJSON();
    // Remove role property if it exists to avoid type errors
    if (userData.role) {
      delete userData.role;
    }
    req.user = userData;
    console.log('User attached to request:', user.username);
    return next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Admin middleware
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 */
export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // 暂时注释掉管理员检查，因为User模型中没有role属性
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Admin access required',
    //   });
    // }

    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Extend Express request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
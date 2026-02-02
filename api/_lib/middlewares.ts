import { VercelRequest, VercelResponse } from '@vercel/node';
import { extractTokenFromHeader, verifyToken, errorResponse } from './utils';
import { User } from './models';

// 认证中间件
export const authMiddleware = async (req: VercelRequest, res: VercelResponse, next: () => void) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return errorResponse(res, 'Access token required', 401);
    }

    const payload = verifyToken(token);

    // 查找用户
    const user = await User.findByPk(payload.userId);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (user.disabled) {
      return errorResponse(res, 'Account is disabled', 403);
    }

    // 将用户信息添加到请求对象
    (req as any).user = user;
    (req as any).userId = user.id;

    next();
  } catch (error) {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

// 管理员中间件
export const adminMiddleware = async (req: VercelRequest, res: VercelResponse, next: () => void) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    // 暂时注释，后续可以添加角色检查
    // if (user.role !== 'admin') {
    //   return errorResponse(res, 'Admin access required', 403);
    // }

    next();
  } catch (error) {
    return errorResponse(res, 'Internal server error', 500);
  }
};

// CORS中间件
export const corsMiddleware = (req: VercelRequest, res: VercelResponse, next: () => void) => {
  const allowedOrigins = [
    process.env.CORS_ORIGIN || 'http://localhost:5174',
    'http://localhost:5173',
    'http://localhost:5174',
  ];

  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
};
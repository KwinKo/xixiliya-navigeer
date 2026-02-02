import { VercelRequest, VercelResponse } from '@vercel/node';
import { successResponse, errorResponse, errorHandler, generateToken, generateRefreshToken } from '../_lib/utils.js';
import { corsMiddleware } from '../_lib/middlewares.js';

// 处理CORS
const handleCors = (req: VercelRequest, res: VercelResponse, next: () => void) => {
  corsMiddleware(req, res, next);
};

// 刷新令牌
export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    handleCors(req, res, async () => {
      if (req.method !== 'POST') {
        return errorResponse(res, 'Method not allowed', 405);
      }

      const { refreshToken } = req.body;

      if (!refreshToken) {
        return errorResponse(res, 'Refresh token required', 400);
      }

      // 这里可以添加刷新令牌的验证逻辑
      // 为了简化，暂时直接生成新令牌

      // 从请求中获取用户信息（实际应用中应该从刷新令牌中解析）
      const user = (req as any).user;

      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      // 生成新令牌
      const tokenPayload = {
        userId: user.id,
        username: user.username,
        role: user.role,
      };

      const newToken = generateToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      return successResponse(res, 'Token refreshed', {
        user: user.toJSON(),
        token: newToken,
        refreshToken: newRefreshToken
      });
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

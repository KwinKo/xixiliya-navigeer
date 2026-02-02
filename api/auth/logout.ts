import { VercelRequest, VercelResponse } from '@vercel/node';
import { successResponse, errorResponse, errorHandler } from '../../_lib/utils.js';
import { corsMiddleware } from '../../_lib/middlewares.js';

// 处理CORS
const handleCors = (req: VercelRequest, res: VercelResponse, next: () => void) => {
  corsMiddleware(req, res, next);
};

// 退出登录
export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    handleCors(req, res, async () => {
      if (req.method !== 'POST') {
        return errorResponse(res, 'Method not allowed', 405);
      }

      // 这里可以添加令牌失效逻辑
      // 为了简化，暂时直接返回成功

      return successResponse(res, 'Logout successful');
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

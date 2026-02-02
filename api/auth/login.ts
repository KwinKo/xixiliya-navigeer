import { VercelRequest, VercelResponse } from '@vercel/node';
import { User } from '../../_lib/models.js';
import { successResponse, errorResponse, errorHandler, generateToken, generateRefreshToken } from '../../_lib/utils.js';
import { corsMiddleware } from '../../_lib/middlewares.js';

// 处理CORS
const handleCors = (req: VercelRequest, res: VercelResponse, next: () => void) => {
  corsMiddleware(req, res, next);
};

// 登录用户
export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    handleCors(req, res, async () => {
      if (req.method !== 'POST') {
        return errorResponse(res, 'Method not allowed', 405);
      }

      const { username, password } = req.body;

      // 查找用户
      const user = await User.findOne({
        where: { username },
      });

      if (!user) {
        return errorResponse(res, 'Username not found', 404);
      }

      if (user.disabled) {
        return errorResponse(res, 'Account is disabled', 403);
      }

      // 验证密码
      const passwordMatch = await user.validatePassword(password);

      if (!passwordMatch) {
        return errorResponse(res, 'Incorrect password', 401);
      }

      // 生成令牌
      const tokenPayload = {
        userId: user.id,
        username: user.username,
        role: user.role,
      };

      const token = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      return successResponse(res, 'Login successful', {
        user: user.toJSON(),
        token,
        refreshToken
      });
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

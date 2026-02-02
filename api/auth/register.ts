import { VercelRequest, VercelResponse } from '@vercel/node';
import { User } from '../../_lib/models.js';
import { successResponse, errorResponse, errorHandler, validatePassword, generateToken, generateRefreshToken } from '../../_lib/utils.js';
import { corsMiddleware } from '../../_lib/middlewares.js';

// 处理CORS
const handleCors = (req: VercelRequest, res: VercelResponse, next: () => void) => {
  corsMiddleware(req, res, next);
};

// 注册用户
export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    handleCors(req, res, async () => {
      if (req.method !== 'POST') {
        return errorResponse(res, 'Method not allowed', 405);
      }

      const { username, email, password } = req.body;

      // 验证密码
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return errorResponse(res, passwordValidation.message, 400);
      }

      // 检查用户名是否存在
      const existingUser = await User.findOne({
        where: { username },
      });

      if (existingUser) {
        return errorResponse(res, 'Username already exists', 400);
      }

      // 检查邮箱是否存在
      const existingEmail = await User.findOne({
        where: { email },
      });

      if (existingEmail) {
        return errorResponse(res, 'Email already registered', 400);
      }

      // 创建用户
      const user = await User.create({
        username,
        email,
        password,
      });

      // 生成令牌
      const tokenPayload = {
        userId: user.id,
        username: user.username,
        role: user.role,
      };

      const token = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      return successResponse(res, 'Registration successful', {
        user: user.toJSON(),
        token,
        refreshToken
      }, 201);
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

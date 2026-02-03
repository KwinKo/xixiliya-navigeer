import { VercelRequest, VercelResponse } from '@vercel/node';
import { User } from '../_lib/models.js';
import { successResponse, errorResponse, errorHandler, validatePassword, generateToken, generateRefreshToken } from '../_lib/utils.js';
import { corsMiddleware } from '../_lib/middlewares.js';
import { safeDbOperation } from '../_lib/db-manager.js';

// 注册用户
export default async (req: VercelRequest, res: VercelResponse) => {
  // 先处理CORS
  try {
    corsMiddleware(req, res, () => {});
  } catch (corsError) {
    console.error('CORS middleware error:', corsError);
    return res.status(500).json({
      success: false,
      message: 'CORS setup failed',
    });
  }

  try {
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
    const existingUser = await safeDbOperation(async () => {
      return await User.findOne({
        where: { username },
      });
    });

    if (existingUser) {
      return errorResponse(res, 'Username already exists', 400);
    }

    // 检查邮箱是否存在
    const existingEmail = await safeDbOperation(async () => {
      return await User.findOne({
        where: { email },
      });
    });

    if (existingEmail) {
      return errorResponse(res, 'Email already registered', 400);
    }

    // 创建用户
    const user = await safeDbOperation(async () => {
      return await User.create({
        username,
        email,
        password,
      });
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
  } catch (error) {
    console.error('Registration error:', error);
    errorHandler(error, res);
  }
};

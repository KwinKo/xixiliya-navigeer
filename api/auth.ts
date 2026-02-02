import { VercelRequest, VercelResponse } from '@vercel/node';
import { User, Bookmark, Category } from './_lib/models';
import { successResponse, errorResponse, errorHandler, validatePassword, generateToken, generateRefreshToken } from './_lib/utils';
import { corsMiddleware } from './_lib/middlewares';

// 处理CORS
const handleCors = (req: VercelRequest, res: VercelResponse, next: () => void) => {
  corsMiddleware(req, res, next);
};

// 注册用户
export const register = async (req: VercelRequest, res: VercelResponse) => {
  try {
    handleCors(req, res, async () => {
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
        tokens: {
          accessToken: token,
          refreshToken: refreshToken
        }
      }, 201);
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

// 登录用户
export const login = async (req: VercelRequest, res: VercelResponse) => {
  try {
    handleCors(req, res, async () => {
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
        tokens: {
          accessToken: token,
          refreshToken: refreshToken
        }
      });
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

// 刷新令牌
export const refresh = async (req: VercelRequest, res: VercelResponse) => {
  try {
    handleCors(req, res, async () => {
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
        tokens: {
          accessToken: newToken,
          refreshToken: newRefreshToken
        }
      });
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

// 退出登录
export const logout = async (req: VercelRequest, res: VercelResponse) => {
  try {
    handleCors(req, res, async () => {
      // 这里可以添加令牌失效逻辑
      // 为了简化，暂时直接返回成功

      return successResponse(res, 'Logout successful');
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

// 导出处理函数
export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    handleCors(req, res, async () => {
      switch (req.method) {
        case 'POST':
          if (req.query.action === 'register') {
            await register(req, res);
          } else if (req.query.action === 'login') {
            await login(req, res);
          } else if (req.query.action === 'refresh') {
            await refresh(req, res);
          } else if (req.query.action === 'logout') {
            await logout(req, res);
          } else {
            return errorResponse(res, 'Invalid action', 400);
          }
          break;
        default:
          return errorResponse(res, 'Method not allowed', 405);
      }
    });
  } catch (error) {
    errorHandler(error, res);
  }
};
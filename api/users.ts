import { VercelRequest, VercelResponse } from '@vercel/node';
import { User } from './_lib/models.js';
import { successResponse, errorResponse, errorHandler } from './_lib/utils.js';
import { corsMiddleware, authMiddleware } from './_lib/middlewares.js';

// 处理CORS
const handleCors = (req: VercelRequest, res: VercelResponse, next: () => void) => {
  corsMiddleware(req, res, next);
};

// 处理认证
const handleAuth = async (req: VercelRequest, res: VercelResponse, next: () => void) => {
  try {
    await authMiddleware(req, res, next);
  } catch (error) {
    errorHandler(error, res);
  }
};

// 获取当前用户信息
export const getCurrentUser = async (req: VercelRequest, res: VercelResponse) => {
  try {
    handleCors(req, res, async () => {
      await handleAuth(req, res, async () => {
        const user = (req as any).user;

        return successResponse(res, 'User information retrieved successfully', user.toJSON());
      });
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

// 更新用户信息
export const updateCurrentUser = async (req: VercelRequest, res: VercelResponse) => {
  try {
    handleCors(req, res, async () => {
      await handleAuth(req, res, async () => {
        const userId = (req as any).userId;
        const updateData = req.body;

        // 查找用户
        const user = await User.findByPk(userId);
        if (!user) {
          return errorResponse(res, 'User not found', 404);
        }

        // 更新用户信息
        await user.update(updateData);

        return successResponse(res, 'User information updated successfully', user.toJSON());
      });
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

// 获取用户公开信息
export const getUserByUsername = async (req: VercelRequest, res: VercelResponse) => {
  try {
    handleCors(req, res, async () => {
      const { username } = req.query;

      if (!username) {
        return errorResponse(res, 'Username is required', 400);
      }

      // 查找用户
      const user = await User.findOne({
        where: { username: String(username) },
      });

      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      if (user.disabled) {
        return errorResponse(res, 'User account is disabled', 403);
      }

      // 移除敏感信息
      const publicUser = user.toJSON();
      delete publicUser.email;
      delete publicUser.disabled;
      delete publicUser.bookmarkLimit;

      return successResponse(res, 'User profile retrieved successfully', publicUser);
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

// 删除用户账户
export const deleteCurrentUser = async (req: VercelRequest, res: VercelResponse) => {
  try {
    handleCors(req, res, async () => {
      await handleAuth(req, res, async () => {
        const userId = (req as any).userId;

        // 查找用户
        const user = await User.findByPk(userId);
        if (!user) {
          return errorResponse(res, 'User not found', 404);
        }

        // 删除用户
        await user.destroy();

        return successResponse(res, 'Account deleted successfully');
      });
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
        case 'GET':
          if (req.query.action === 'me') {
            await getCurrentUser(req, res);
          } else if (req.query.username) {
            await getUserByUsername(req, res);
          } else {
            return errorResponse(res, 'Invalid action', 400);
          }
          break;
        case 'PUT':
          if (req.query.action === 'me') {
            await updateCurrentUser(req, res);
          } else {
            return errorResponse(res, 'Invalid action', 400);
          }
          break;
        case 'DELETE':
          if (req.query.action === 'me') {
            await deleteCurrentUser(req, res);
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
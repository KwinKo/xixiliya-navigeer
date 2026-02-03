import { VercelRequest, VercelResponse } from '@vercel/node';
import { User } from './_lib/models.js';
import { successResponse, errorResponse, errorHandler } from './_lib/utils.js';
import { corsMiddleware, authMiddleware } from './_lib/middlewares.js';
import { safeDbOperation } from './_lib/db-manager.js';

// 获取当前用户信息
export const getCurrentUser = async (req: VercelRequest, res: VercelResponse) => {
  // 处理CORS
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
    await authMiddleware(req, res, async () => {
      try {
        const user = (req as any).user;
        return successResponse(res, 'User information retrieved successfully', user.toJSON());
      } catch (error: any) {
        console.error('Get current user error:', error);
        return errorHandler(error, res);
      }
    });
  } catch (authError: any) {
    console.error('Auth middleware error:', authError);
    return errorHandler(authError, res);
  }
};

// 更新用户信息
export const updateCurrentUser = async (req: VercelRequest, res: VercelResponse) => {
  // 处理CORS
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
    await authMiddleware(req, res, async () => {
      try {
        const userId = (req as any).userId;
        const updateData = req.body;

        // 查找用户
        const user = await safeDbOperation(async () => {
          return await User.findByPk(userId);
        });

        if (!user) {
          return errorResponse(res, 'User not found', 404);
        }

        // 更新用户信息
        await safeDbOperation(async () => {
          await user.update(updateData);
        });

        return successResponse(res, 'User information updated successfully', user.toJSON());
      } catch (error: any) {
        console.error('Update current user error:', error);
        return errorHandler(error, res);
      }
    });
  } catch (authError: any) {
    console.error('Auth middleware error:', authError);
    return errorHandler(authError, res);
  }
};

// 获取用户公开信息
export const getUserByUsername = async (req: VercelRequest, res: VercelResponse) => {
  // 处理CORS
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
    const { username } = req.query;

    if (!username) {
      return errorResponse(res, 'Username is required', 400);
    }

    // 查找用户
    const user = await safeDbOperation(async () => {
      return await User.findOne({
        where: { username: String(username) },
      });
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
  } catch (error: any) {
    console.error('Get user by username error:', error);
    return errorHandler(error, res);
  }
};

// 删除用户账户
export const deleteCurrentUser = async (req: VercelRequest, res: VercelResponse) => {
  // 处理CORS
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
    await authMiddleware(req, res, async () => {
      try {
        const userId = (req as any).userId;

        // 查找用户
        const user = await safeDbOperation(async () => {
          return await User.findByPk(userId);
        });

        if (!user) {
          return errorResponse(res, 'User not found', 404);
        }

        // 删除用户
        await safeDbOperation(async () => {
          await user.destroy();
        });

        return successResponse(res, 'Account deleted successfully');
      } catch (error: any) {
        console.error('Delete current user error:', error);
        return errorHandler(error, res);
      }
    });
  } catch (authError: any) {
    console.error('Auth middleware error:', authError);
    return errorHandler(authError, res);
  }
};

// 导出处理函数
export default async (req: VercelRequest, res: VercelResponse) => {
  // 处理CORS
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
  } catch (error: any) {
    console.error('Users API error:', error);
    return errorHandler(error, res);
  }
};
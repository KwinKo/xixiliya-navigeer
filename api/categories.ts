import { VercelRequest, VercelResponse } from '@vercel/node';
import { Category, User } from './_lib/models';
import { successResponse, errorResponse, errorHandler } from './_lib/utils';
import { corsMiddleware, authMiddleware } from './_lib/middlewares';

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

// 获取用户分类
export const getCategories = async (req: VercelRequest, res: VercelResponse) => {
  try {
    handleCors(req, res, async () => {
      await handleAuth(req, res, async () => {
        const userId = (req as any).userId;

        // 获取分类
        const categories = await Category.findAll({
          where: { userId },
          order: [['createdAt', 'ASC']],
        });

        return successResponse(res, 'Categories retrieved successfully', categories);
      });
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

// 创建分类
export const createCategory = async (req: VercelRequest, res: VercelResponse) => {
  try {
    handleCors(req, res, async () => {
      await handleAuth(req, res, async () => {
        const userId = (req as any).userId;
        const { name } = req.body;

        // 验证字段
        if (!name || !name.trim()) {
          return errorResponse(res, 'Category name is required', 400);
        }

        // 检查分类名是否已存在
        const existingCategory = await Category.findOne({
          where: {
            userId,
            name: name.trim(),
          },
        });

        if (existingCategory) {
          return errorResponse(res, 'Category name already exists', 400);
        }

        // 创建分类
        const category = await Category.create({
          userId,
          name: name.trim(),
        });

        return successResponse(res, 'Category created successfully', category, 201);
      });
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

// 删除分类
export const deleteCategory = async (req: VercelRequest, res: VercelResponse) => {
  try {
    handleCors(req, res, async () => {
      await handleAuth(req, res, async () => {
        const userId = (req as any).userId;
        const { id } = req.query;

        if (!id) {
          return errorResponse(res, 'Category ID is required', 400);
        }

        // 查找分类
        const category = await Category.findOne({
          where: {
            id: parseInt(id as string),
            userId,
          },
        });

        if (!category) {
          return errorResponse(res, 'Category not found', 404);
        }

        // 删除分类
        await category.destroy();

        return successResponse(res, 'Category deleted successfully');
      });
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

// 获取用户公开分类
export const getPublicCategories = async (req: VercelRequest, res: VercelResponse) => {
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

      // 获取分类
      const categories = await Category.findAll({
        where: { userId: user.id },
        order: [['createdAt', 'ASC']],
      });

      return successResponse(res, 'Public categories retrieved successfully', categories);
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
          if (req.query.action === 'public') {
            await getPublicCategories(req, res);
          } else {
            await getCategories(req, res);
          }
          break;
        case 'POST':
          await createCategory(req, res);
          break;
        case 'DELETE':
          await deleteCategory(req, res);
          break;
        default:
          return errorResponse(res, 'Method not allowed', 405);
      }
    });
  } catch (error) {
    errorHandler(error, res);
  }
};
import { VercelRequest, VercelResponse } from '@vercel/node';
import { Bookmark, Category, User } from './_lib/models.js';
import { successResponse, errorResponse, errorHandler, validateUrl } from './_lib/utils.js';
import { corsMiddleware, authMiddleware } from './_lib/middlewares.js';
import { safeDbOperation } from './_lib/db-manager.js';

// 获取用户书签
export const getBookmarks = async (req: VercelRequest, res: VercelResponse) => {
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

        // 获取书签（包含分类信息）
        const bookmarks = await safeDbOperation(async () => {
          return await Bookmark.findAll({
            where: { userId },
            include: [{
              model: Category,
              required: false
            }],
            order: [['createdAt', 'DESC']],
          });
        });

        return successResponse(res, 'Bookmarks retrieved successfully', bookmarks);
      } catch (error: any) {
        console.error('Get bookmarks error:', error);
        return errorHandler(error, res);
      }
    });
  } catch (authError: any) {
    console.error('Auth middleware error:', authError);
    return errorHandler(authError, res);
  }
};

// 创建书签
export const createBookmark = async (req: VercelRequest, res: VercelResponse) => {
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
        const { title, url, description, icon, categoryId, isPublic } = req.body;

        // 验证必要字段
        if (!title || !title.trim()) {
          return errorResponse(res, 'Title is required', 400);
        }

        if (!url || !url.trim()) {
          return errorResponse(res, 'URL is required', 400);
        }

        // 验证URL格式
        if (!validateUrl(url.trim())) {
          return errorResponse(res, 'Invalid URL format', 400);
        }

        // 检查书签限制
        const bookmarkCount = await safeDbOperation(async () => {
          return await Bookmark.count({
            where: { userId },
          });
        });

        const user = await safeDbOperation(async () => {
          return await User.findByPk(userId);
        });

        if (user && bookmarkCount >= user.bookmarkLimit) {
          return errorResponse(res, 'Bookmark limit reached', 403);
        }

        // 检查分类是否存在
        if (categoryId) {
          const category = await safeDbOperation(async () => {
            return await Category.findOne({
              where: {
                id: categoryId,
                userId,
              },
            });
          });

          if (!category) {
            return errorResponse(res, 'Category not found', 404);
          }
        }

        // 创建书签
        const bookmark = await safeDbOperation(async () => {
          return await Bookmark.create({
            userId,
            title: title.trim(),
            url: url.trim(),
            description: description?.trim(),
            icon: icon || '🔗',
            categoryId,
            isPublic: isPublic || false,
          });
        });

        // 加载分类信息
        const createdBookmark = await safeDbOperation(async () => {
          return await Bookmark.findByPk(bookmark.id, {
            include: [{
              model: Category,
              required: false
            }],
          });
        });

        return successResponse(res, 'Bookmark created successfully', createdBookmark, 201);
      } catch (error: any) {
        console.error('Create bookmark error:', error);
        return errorHandler(error, res);
      }
    });
  } catch (authError: any) {
    console.error('Auth middleware error:', authError);
    return errorHandler(authError, res);
  }
};

// 获取单个书签
export const getBookmarkById = async (req: VercelRequest, res: VercelResponse) => {
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
        const { id } = req.query;

        if (!id) {
          return errorResponse(res, 'Bookmark ID is required', 400);
        }

        // 查找书签
        const bookmark = await safeDbOperation(async () => {
          return await Bookmark.findOne({
            where: {
              id: parseInt(id as string),
              userId,
            },
            include: [{
              model: Category,
              required: false
            }],
          });
        });

        if (!bookmark) {
          return errorResponse(res, 'Bookmark not found', 404);
        }

        return successResponse(res, 'Bookmark retrieved successfully', bookmark);
      } catch (error: any) {
        console.error('Get bookmark by ID error:', error);
        return errorHandler(error, res);
      }
    });
  } catch (authError: any) {
    console.error('Auth middleware error:', authError);
    return errorHandler(authError, res);
  }
};

// 更新书签
export const updateBookmark = async (req: VercelRequest, res: VercelResponse) => {
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
        const { id } = req.query;
        const { title, url, description, icon, categoryId, isPublic } = req.body;

        if (!id) {
          return errorResponse(res, 'Bookmark ID is required', 400);
        }

        // 查找书签
        const bookmark = await safeDbOperation(async () => {
          return await Bookmark.findOne({
            where: {
              id: parseInt(id as string),
              userId,
            },
          });
        });

        if (!bookmark) {
          return errorResponse(res, 'Bookmark not found', 404);
        }

        // 验证字段
        if (title !== undefined && !title.trim()) {
          return errorResponse(res, 'Title is required', 400);
        }

        if (url !== undefined && !url.trim()) {
          return errorResponse(res, 'URL is required', 400);
        }

        if (url !== undefined && !validateUrl(url.trim())) {
          return errorResponse(res, 'Invalid URL format', 400);
        }

        // 检查分类是否存在
        if (categoryId) {
          const category = await safeDbOperation(async () => {
            return await Category.findOne({
              where: {
                id: categoryId,
                userId,
              },
            });
          });

          if (!category) {
            return errorResponse(res, 'Category not found', 404);
          }
        }

        // 更新书签
        await safeDbOperation(async () => {
          await bookmark.update({
            title: title?.trim(),
            url: url?.trim(),
            description: description?.trim(),
            icon,
            categoryId,
            isPublic,
          });
        });

        // 加载分类信息
        const updatedBookmark = await safeDbOperation(async () => {
          return await Bookmark.findByPk(bookmark.id, {
            include: [{
              model: Category,
              required: false
            }],
          });
        });

        return successResponse(res, 'Bookmark updated successfully', updatedBookmark);
      } catch (error: any) {
        console.error('Update bookmark error:', error);
        return errorHandler(error, res);
      }
    });
  } catch (authError: any) {
    console.error('Auth middleware error:', authError);
    return errorHandler(authError, res);
  }
};

// 删除书签
export const deleteBookmark = async (req: VercelRequest, res: VercelResponse) => {
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
        const { id } = req.query;

        if (!id) {
          return errorResponse(res, 'Bookmark ID is required', 400);
        }

        // 查找书签
        const bookmark = await safeDbOperation(async () => {
          return await Bookmark.findOne({
            where: {
              id: parseInt(id as string),
              userId,
            },
          });
        });

        if (!bookmark) {
          return errorResponse(res, 'Bookmark not found', 404);
        }

        // 删除书签
        await safeDbOperation(async () => {
          await bookmark.destroy();
        });

        return successResponse(res, 'Bookmark deleted successfully');
      } catch (error: any) {
        console.error('Delete bookmark error:', error);
        return errorHandler(error, res);
      }
    });
  } catch (authError: any) {
    console.error('Auth middleware error:', authError);
    return errorHandler(authError, res);
  }
};

// 获取公开书签
export const getPublicBookmarks = async (req: VercelRequest, res: VercelResponse) => {
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

    // 获取公开书签
    const bookmarks = await safeDbOperation(async () => {
      return await Bookmark.findAll({
        where: {
          userId: user.id,
          isPublic: true,
        },
        include: [{
          model: Category,
          required: false
        }],
        order: [['createdAt', 'DESC']],
      });
    });

    return successResponse(res, 'Public bookmarks retrieved successfully', bookmarks);
  } catch (error: any) {
    console.error('Get public bookmarks error:', error);
    return errorHandler(error, res);
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
        if (req.query.action === 'public') {
          await getPublicBookmarks(req, res);
        } else if (req.query.id) {
          await getBookmarkById(req, res);
        } else {
          await getBookmarks(req, res);
        }
        break;
      case 'POST':
        await createBookmark(req, res);
        break;
      case 'PUT':
        await updateBookmark(req, res);
        break;
      case 'DELETE':
        await deleteBookmark(req, res);
        break;
      default:
        return errorResponse(res, 'Method not allowed', 405);
    }
  } catch (error: any) {
    console.error('Bookmarks API error:', error);
    return errorHandler(error, res);
  }
};
import { Request, Response } from 'express';
import { ApiResponse, ImportData } from '../types';
import User from '../models/User';
import Bookmark from '../models/Bookmark';
import Category from '../models/Category';
import { sequelize } from '../config/database';

/**
 * Export user data
 * @param req - Express request
 * @param res - Express response
 */
export const exportData = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    // Get user information
    const user = await User.findByPk(userId);

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
      };
      return res.status(404).json(response);
    }

    // Get bookmarks
    const bookmarks = await Bookmark.findAll({
      where: { userId },
      include: [
        {
          model: Category,
        },
      ],
    });

    // Get categories
    const categories = await Category.findAll({
      where: { userId },
    });

    // Remove sensitive information from user
    const userWithoutPassword = user.toJSON();

    // Prepare export data
    const exportData = {
      user: userWithoutPassword,
      bookmarks,
      categories,
    };

    const response: ApiResponse = {
      success: true,
      message: 'Data exported successfully',
      data: exportData,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Export data error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};

/**
 * Import user data
 * @param req - Express request
 * @param res - Express response
 */
export const importData = async (req: Request, res: Response) => {
  try {
    const data: ImportData = req.body;
    const userId = req.user.id;

    // Check bookmark limit
    const existingBookmarkCount = await Bookmark.count({
      where: { userId },
    });

    const totalBookmarkCount = existingBookmarkCount + (data.bookmarks?.length || 0);

    if (totalBookmarkCount > req.user.bookmarkLimit) {
      const response: ApiResponse = {
        success: false,
        message: 'Import would exceed bookmark limit',
      };
      return res.status(403).json(response);
    }

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Import categories
      const importedCategories: { [key: string]: number } = {};

      if (data.categories && data.categories.length > 0) {
        for (const category of data.categories) {
          // Check if category name already exists
          const existingCategory = await Category.findOne({
            where: {
              userId,
              name: category.name,
            },
            transaction,
          });

          if (existingCategory) {
            importedCategories[category.name] = existingCategory.id;
          } else {
            const newCategory = await Category.create({
              name: category.name,
              userId,
            }, {
              transaction,
            });
            importedCategories[category.name] = newCategory.id;
          }
        }
      }

      // Import bookmarks
      if (data.bookmarks && data.bookmarks.length > 0) {
        for (const bookmark of data.bookmarks) {
          // Find category ID if category name is provided
          let categoryId: number | undefined;
          if (bookmark.category && bookmark.category.name) {
            categoryId = importedCategories[bookmark.category.name];
          }

          await Bookmark.create({
            title: bookmark.title,
            url: bookmark.url,
            description: bookmark.description,
            icon: bookmark.icon || '🔗',
            categoryId,
            isPublic: bookmark.isPublic || false,
            userId,
          }, {
            transaction,
          });
        }
      }

      // Commit transaction
      await transaction.commit();

      const response: ApiResponse = {
        success: true,
        message: 'Data imported successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      // Rollback transaction
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Import data error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};
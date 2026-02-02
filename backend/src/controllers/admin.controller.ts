import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import User from '../models/User';
import Bookmark from '../models/Bookmark';
import Category from '../models/Category';

/**
 * Get all users (admin only)
 * @param req - Express request
 * @param res - Express response
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    // Get users with pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Get users
    const users = await User.findAll({
      offset,
      limit,
      order: [
        ['createdAt', 'DESC'],
      ],
    });

    // Get total count
    const total = await User.count();

    // Remove passwords from response
    const usersWithoutPassword = users.map((user) => user.toJSON());

    const response: ApiResponse = {
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: usersWithoutPassword,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get users error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};

/**
 * Update user status (admin only)
 * @param req - Express request
 * @param res - Express response
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { disabled, bookmarkLimit, role } = req.body;

    // Cannot update super admin
    if (parseInt(id) === 1) {
      const response: ApiResponse = {
        success: false,
        message: 'Cannot update super admin',
      };
      return res.status(403).json(response);
    }

    // Find user
    const user = await User.findByPk(parseInt(id));

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
      };
      return res.status(404).json(response);
    }

    // Update user
    await user.update({
      disabled,
      bookmarkLimit,
      role,
    });

    // Remove password from response
    const userWithoutPassword = user.toJSON();

    const response: ApiResponse = {
      success: true,
      message: 'User updated successfully',
      data: userWithoutPassword,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Update user error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};

/**
 * Delete user (admin only)
 * @param req - Express request
 * @param res - Express response
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Cannot delete super admin
    if (parseInt(id) === 1) {
      const response: ApiResponse = {
        success: false,
        message: 'Cannot delete super admin',
      };
      return res.status(403).json(response);
    }

    // Find user
    const user = await User.findByPk(parseInt(id));

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
      };
      return res.status(404).json(response);
    }

    // Delete user's bookmarks and categories first
    await Bookmark.destroy({
      where: { userId: parseInt(id) },
    });

    await Category.destroy({
      where: { userId: parseInt(id) },
    });

    // Delete user
    await user.destroy();

    const response: ApiResponse = {
      success: true,
      message: 'User deleted successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Delete user error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};

/**
 * Get system stats (admin only)
 * @param req - Express request
 * @param res - Express response
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    // Get total users
    const totalUsers = await User.count();

    // Get active users
    const activeUsers = await User.count({
      where: { disabled: false },
    });

    // Get total bookmarks
    const totalBookmarks = await Bookmark.count();

    // Get total categories
    const totalCategories = await Category.count();

    // Get recent users
    const recentUsers = await User.findAll({
      limit: 5,
      order: [
        ['createdAt', 'DESC'],
      ],
      attributes: ['id', 'username', 'email', 'createdAt', 'disabled'],
    });

    const response: ApiResponse = {
      success: true,
      message: 'System stats retrieved successfully',
      data: {
        totalUsers,
        activeUsers,
        totalBookmarks,
        totalCategories,
        recentUsers,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get stats error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};
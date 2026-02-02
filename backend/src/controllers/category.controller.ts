import { Request, Response } from 'express';
import { CategoryCreate, ApiResponse } from '../types';
import Category from '../models/Category';
import Bookmark from '../models/Bookmark';
import User from '../models/User';

/**
 * Get user categories
 * @param req - Express request
 * @param res - Express response
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    // Get categories
    const categories = await Category.findAll({
      where: { userId },
      order: [['createdAt', 'ASC']],
    });

    const response: ApiResponse = {
      success: true,
      message: 'Categories retrieved successfully',
      data: categories,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get categories error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};

/**
 * Create a new category
 * @param req - Express request
 * @param res - Express response
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const data: CategoryCreate = req.body;
    const userId = req.user.id;

    // Check if category name already exists
    const existingCategory = await Category.findOne({
      where: {
        userId,
        name: data.name,
      },
    });

    if (existingCategory) {
      const response: ApiResponse = {
        success: false,
        message: 'Category name already exists',
      };
      return res.status(400).json(response);
    }

    // Create category
    const category = await Category.create({
      ...data,
      userId,
    });

    const response: ApiResponse = {
      success: true,
      message: 'Category created successfully',
      data: category,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create category error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};

/**
 * Delete a category
 * @param req - Express request
 * @param res - Express response
 */
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find category
    const category = await Category.findOne({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!category) {
      const response: ApiResponse = {
        success: false,
        message: 'Category not found',
      };
      return res.status(404).json(response);
    }

    // Update bookmarks with this category to have null categoryId
    await Bookmark.update(
      { categoryId: null },
      {
        where: {
          userId,
          categoryId: parseInt(id),
        },
      }
    );

    // Delete category
    await category.destroy();

    const response: ApiResponse = {
      success: true,
      message: 'Category deleted successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Delete category error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};

/**
 * Get public categories by username
 * @param req - Express request
 * @param res - Express response
 */
export const getPublicCategories = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    // Find user
    const user = await User.findOne({
      where: { username },
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
      };
      return res.status(404).json(response);
    }

    if (user.disabled) {
      const response: ApiResponse = {
        success: false,
        message: 'User account is disabled',
      };
      return res.status(403).json(response);
    }

    // Get categories
    const categories = await Category.findAll({
      where: { userId: user.id },
      order: [['createdAt', 'ASC']],
    });

    const response: ApiResponse = {
      success: true,
      message: 'Public categories retrieved successfully',
      data: categories,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get public categories error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};
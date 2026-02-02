import { Request, Response } from 'express';
import { BookmarkCreate, BookmarkUpdate, ApiResponse } from '../types';
import Bookmark from '../models/Bookmark';
import Category from '../models/Category';
import User from '../models/User';

/**
 * Get user bookmarks
 * @param req - Express request
 * @param res - Express response
 */
export const getBookmarks = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    // Get bookmarks with categories
    const bookmarks = await Bookmark.findAll({
      where: { userId },
      include: [{
        model: Category,
        required: false
      }],
      order: [['createdAt', 'DESC']],
    });

    const response: ApiResponse = {
      success: true,
      message: 'Bookmarks retrieved successfully',
      data: bookmarks,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get bookmarks error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};

/**
 * Create a new bookmark
 * @param req - Express request
 * @param res - Express response
 */
export const createBookmark = async (req: Request, res: Response) => {
  try {
    const data: BookmarkCreate = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!data.title || !data.title.trim()) {
      const response: ApiResponse = {
        success: false,
        message: 'Title is required',
      };
      return res.status(400).json(response);
    }

    if (!data.url || !data.url.trim()) {
      const response: ApiResponse = {
        success: false,
        message: 'URL is required',
      };
      return res.status(400).json(response);
    }

    // Validate URL format
    try {
      new URL(data.url.trim());
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid URL format',
      };
      return res.status(400).json(response);
    }

    // Check bookmark limit
    const bookmarkCount = await Bookmark.count({
      where: { userId },
    });

    if (bookmarkCount >= req.user.bookmarkLimit) {
      const response: ApiResponse = {
        success: false,
        message: 'Bookmark limit reached',
      };
      return res.status(403).json(response);
    }

    // Check if category exists and belongs to user
    if (data.categoryId) {
      const category = await Category.findOne({
        where: {
          id: data.categoryId,
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
    }

    // Create bookmark
    const bookmark = await Bookmark.create({
      ...data,
      userId,
      icon: data.icon || '🔗',
      isPublic: data.isPublic || false,
    });

    // Load category relation
    const createdBookmark = await Bookmark.findByPk(bookmark.id, {
      include: [{ model: Category, required: false }],
    });

    const response: ApiResponse = {
      success: true,
      message: 'Bookmark created successfully',
      data: createdBookmark,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create bookmark error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};

/**
 * Get bookmark by ID
 * @param req - Express request
 * @param res - Express response
 */
export const getBookmarkById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find bookmark
    const bookmark = await Bookmark.findOne({
      where: {
        id: parseInt(id),
        userId,
      },
      include: [{
        model: Category,
        required: false
      }],
    });

    if (!bookmark) {
      const response: ApiResponse = {
        success: false,
        message: 'Bookmark not found',
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Bookmark retrieved successfully',
      data: bookmark,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get bookmark by ID error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};

/**
 * Update bookmark
 * @param req - Express request
 * @param res - Express response
 */
export const updateBookmark = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: BookmarkUpdate = req.body;
    const userId = req.user.id;

    // Find bookmark
    const bookmark = await Bookmark.findOne({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!bookmark) {
      const response: ApiResponse = {
        success: false,
        message: 'Bookmark not found',
      };
      return res.status(404).json(response);
    }

    // Validate required fields if provided
    if (data.title !== undefined && !data.title.trim()) {
      const response: ApiResponse = {
        success: false,
        message: 'Title is required',
      };
      return res.status(400).json(response);
    }

    if (data.url !== undefined && !data.url.trim()) {
      const response: ApiResponse = {
        success: false,
        message: 'URL is required',
      };
      return res.status(400).json(response);
    }

    // Validate URL format if provided
    if (data.url !== undefined) {
      try {
        new URL(data.url.trim());
      } catch (error) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid URL format',
        };
        return res.status(400).json(response);
      }
    }

    // Check if category exists and belongs to user
    if (data.categoryId) {
      const category = await Category.findOne({
        where: {
          id: data.categoryId,
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
    }

    // Update bookmark
    await bookmark.update(data);

    // Load category relation
    const updatedBookmark = await Bookmark.findByPk(bookmark.id, {
      include: [{ model: Category, required: false }],
    });

    const response: ApiResponse = {
      success: true,
      message: 'Bookmark updated successfully',
      data: updatedBookmark,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Update bookmark error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};

/**
 * Delete bookmark
 * @param req - Express request
 * @param res - Express response
 */
export const deleteBookmark = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find bookmark
    const bookmark = await Bookmark.findOne({
      where: {
        id: parseInt(id),
        userId,
      },
    });

    if (!bookmark) {
      const response: ApiResponse = {
        success: false,
        message: 'Bookmark not found',
      };
      return res.status(404).json(response);
    }

    // Delete bookmark
    await bookmark.destroy();

    const response: ApiResponse = {
      success: true,
      message: 'Bookmark deleted successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Delete bookmark error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};

/**
 * Get public bookmarks by username
 * @param req - Express request
 * @param res - Express response
 */
export const getPublicBookmarks = async (req: Request, res: Response) => {
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

    // Get public bookmarks
    const bookmarks = await Bookmark.findAll({
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

    const response: ApiResponse = {
      success: true,
      message: 'Public bookmarks retrieved successfully',
      data: bookmarks,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get public bookmarks error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};
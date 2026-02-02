import { Request, Response } from 'express';
import { UserUpdate, ApiResponse } from '../types';
import User from '../models/User';

/**
 * Get current user information
 * @param req - Express request
 * @param res - Express response
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    const response: ApiResponse = {
      success: true,
      message: 'User information retrieved successfully',
      data: userWithoutPassword,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get current user error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};

/**
 * Update current user information
 * @param req - Express request
 * @param res - Express response
 */
export const updateCurrentUser = async (req: Request, res: Response) => {
  try {
    const data: UserUpdate = req.body;

    // Update user
    const user = await User.findByPk(req.user.id);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
      };
      return res.status(404).json(response);
    }

    await user.update(data);

    const response: ApiResponse = {
      success: true,
      message: 'User information updated successfully',
      data: user.toJSON(),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Update current user error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};

/**
 * Get user by username (public profile)
 * @param req - Express request
 * @param res - Express response
 */
export const getUserByUsername = async (req: Request, res: Response) => {
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

    // Get public user data
    const publicUser = user.toJSON();
    // Remove sensitive information
    delete publicUser.password;
    delete publicUser.email;
    delete publicUser.disabled;
    delete publicUser.bookmarkLimit;

    const response: ApiResponse = {
      success: true,
      message: 'User profile retrieved successfully',
      data: publicUser,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Get user by username error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};

/**
 * Delete current user account
 * @param req - Express request
 * @param res - Express response
 */
export const deleteCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    // Delete user (this will also delete associated bookmarks and categories due to cascading)
    const user = await User.findByPk(userId);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
      };
      return res.status(404).json(response);
    }

    await user.destroy();

    const response: ApiResponse = {
      success: true,
      message: 'Account deleted successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Delete current user error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};
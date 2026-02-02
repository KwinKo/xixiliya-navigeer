import { Request, Response } from 'express';
import { validatePassword } from '../utils/password';
import { generateToken, generateRefreshToken } from '../utils/token';
import { UserCreate, UserLogin, AuthResponse, ApiResponse, UserPasswordChange, UserForgotPassword, UserResetPassword } from '../types';
import User from '../models/User';

/**
 * Register a new user
 * @param req - Express request
 * @param res - Express response
 */
export const register = async (req: Request, res: Response) => {
  try {
    const data: UserCreate = req.body;

    // Validate password
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      const response: AuthResponse = {
        success: false,
        message: passwordValidation.message,
      };
      return res.status(400).json(response);
    }

    // Check if username exists
    const existingUser = await User.findOne({
      where: { username: data.username },
    });

    if (existingUser) {
      const response: AuthResponse = {
        success: false,
        message: 'Username already exists',
      };
      return res.status(400).json(response);
    }

    // Check if email exists
    const existingEmail = await User.findOne({
      where: { email: data.email },
    });

    if (existingEmail) {
      const response: AuthResponse = {
        success: false,
        message: 'Email already registered',
      };
      return res.status(400).json(response);
    }

    // Create user (password will be hashed by BeforeCreate hook)
    const user = await User.create({
      username: data.username,
      email: data.email,
      password: data.password,
    });

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const response: AuthResponse = {
      success: true,
      message: 'Registration successful',
      data: {
        user: user.toJSON(),
        token,
        refreshToken,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Register error:', error);
    const response: AuthResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};

/**
 * Login user
 * @param req - Express request
 * @param res - Express response
 */
export const login = async (req: Request, res: Response) => {
  try {
    const data: UserLogin = req.body;

    // Find user
    const user = await User.findOne({
      where: { username: data.username },
    });

    if (!user) {
      const response: AuthResponse = {
        success: false,
        message: 'Username not found',
      };
      return res.status(404).json(response);
    }

    if (user.disabled) {
      const response: AuthResponse = {
        success: false,
        message: 'Account is disabled',
      };
      return res.status(403).json(response);
    }

    // Compare password
    const passwordMatch = await user.validatePassword(data.password);

    if (!passwordMatch) {
      const response: AuthResponse = {
        success: false,
        message: 'Incorrect password',
      };
      return res.status(401).json(response);
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const response: AuthResponse = {
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token,
        refreshToken,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Login error:', error);
    const response: AuthResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};

/**
 * Refresh token
 * @param req - Express request
 * @param res - Express response
 */
export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      const response: AuthResponse = {
        success: false,
        message: 'Refresh token required',
      };
      return res.status(400).json(response);
    }

    // Verify refresh token
    // Note: In production, you should store refresh tokens in a database
    // and validate them properly

    // Generate new tokens
    const tokenPayload = {
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
    };

    const newToken = generateToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    const response: AuthResponse = {
      success: true,
      message: 'Token refreshed',
      data: {
        user: req.user,
        token: newToken,
        refreshToken: newRefreshToken,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Refresh token error:', error);
    const response: AuthResponse = {
      success: false,
      message: 'Invalid or expired refresh token',
    };
    res.status(401).json(response);
  }
};

/**
 * Logout user
 * @param req - Express request
 * @param res - Express response
 */
export const logout = async (req: Request, res: Response) => {
  try {
    // Note: In production, you should invalidate the token in a database

    const response: ApiResponse = {
      success: true,
      message: 'Logout successful',
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Logout error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};

/**
 * Change password
 * @param req - Express request
 * @param res - Express response
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const data: UserPasswordChange = req.body;

    // Find user by id
    const user = await User.findByPk(req.user.id);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found',
      };
      return res.status(404).json(response);
    }

    // Compare current password
    const passwordMatch = await user.validatePassword(data.currentPassword);

    if (!passwordMatch) {
      const response: ApiResponse = {
        success: false,
        message: 'Current password is incorrect',
      };
      return res.status(401).json(response);
    }

    // Validate new password
    const passwordValidation = validatePassword(data.newPassword);
    if (!passwordValidation.valid) {
      const response: ApiResponse = {
        success: false,
        message: passwordValidation.message,
      };
      return res.status(400).json(response);
    }

    // Update password (will be hashed by BeforeUpdate hook)
    await user.update({ password: data.newPassword });

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Change password error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};

/**
 * Forgot password
 * @param req - Express request
 * @param res - Express response
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const data: UserForgotPassword = req.body;

    // Find user
    const user = await User.findOne({
      where: { email: data.email },
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'Email not found',
      };
      return res.status(404).json(response);
    }

    // Note: In production, you should send a verification code to the user's email
    // For demo purposes, we'll just return a success message

    const response: ApiResponse = {
      success: true,
      message: 'Verification code sent to your email',
      data: {
        // In production, this would be a generated code
        code: '123456',
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Forgot password error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};

/**
 * Reset password
 * @param req - Express request
 * @param res - Express response
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const data: UserResetPassword = req.body;

    // Find user
    const user = await User.findOne({
      where: { email: data.email },
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'Email not found',
      };
      return res.status(404).json(response);
    }

    // Validate verification code
    // Note: In production, you should validate the code against a stored value
    if (data.code !== '123456') {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid verification code',
      };
      return res.status(400).json(response);
    }

    // Validate new password
    const passwordValidation = validatePassword(data.newPassword);
    if (!passwordValidation.valid) {
      const response: ApiResponse = {
        success: false,
        message: passwordValidation.message,
      };
      return res.status(400).json(response);
    }

    // Update password (will be hashed by BeforeUpdate hook)
    await user.update({ password: data.newPassword });

    const response: ApiResponse = {
      success: true,
      message: 'Password reset successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Reset password error:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Internal server error',
    };
    res.status(500).json(response);
  }
};
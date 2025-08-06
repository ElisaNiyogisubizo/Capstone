import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User';

const generateToken = (userId: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg).join(', ');
      res.status(400).json({
        success: false,
        message: errorMessages,
        errors: errors.array(),
      });
      return;
    }

    const { name, email, password, role, bio, location, specializations } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    // Create new user
    const userData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'community',
    };

    if (bio) userData.bio = bio.trim();
    if (location) userData.location = location.trim();
    if (role === 'artist' && specializations && Array.isArray(specializations)) {
      userData.specializations = specializations.map((s: string) => s.trim());
    }

    const user = new User(userData);
    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: user.toJSON(),
      token,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg).join(', ');
      res.status(400).json({
        success: false,
        message: errorMessages,
        errors: errors.array(),
      });
      return;
    }

    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Remove password from response
    const userResponse = user.toJSON();

    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    res.json({
      success: true,
      user: req.user.toJSON(),
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const allowedUpdates = ['name', 'bio', 'location', 'phone', 'socialLinks', 'specializations'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      res.status(400).json({
        success: false,
        message: 'Invalid updates',
      });
      return;
    }

    // Update user fields
    updates.forEach(update => {
      if (req.body[update] !== undefined) {
        (req.user as any)[update] = req.body[update];
      }
    });

    await req.user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: req.user.toJSON(),
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
      return;
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
      return;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
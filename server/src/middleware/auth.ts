import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface JWTPayload {
  userId: string;
  iat: number;
  exp: number;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('🔐 AUTHENTICATE MIDDLEWARE ===');
    console.log('🔐 Request URL:', req.url);
    console.log('🔐 Request method:', req.method);
    
    const authHeader = req.header('Authorization');
    console.log('🔐 Auth header present:', !!authHeader);
    console.log('🔐 Auth header starts with Bearer:', authHeader?.startsWith('Bearer '));
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header found');
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!process.env.JWT_SECRET) {
      res.status(500).json({
        success: false,
        message: 'JWT secret not configured',
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    console.log('🔐 JWT decoded successfully, userId:', decoded.userId);
    
    const user = await User.findById(decoded.userId).select('-password');
    console.log('🔐 User found in database:', !!user);
    console.log('🔐 User role:', user?.role);
    console.log('🔐 User isActive:', user?.isActive);
    
    if (!user) {
      console.log('❌ User not found in database');
      res.status(401).json({
        success: false,
        message: 'Token is not valid - user not found',
      });
      return;
    }

    if (!user.isActive) {
      console.log('❌ User account is deactivated');
      res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
      return;
    }

    console.log('✅ Authentication successful, user attached to request');
    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        message: 'Token is not valid',
      });
      return;
    }
    
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token has expired',
      });
      return;
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication',
    });
    return;
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    console.log('🔒 AUTHORIZE MIDDLEWARE ===');
    console.log('🔒 Required roles:', roles);
    console.log('🔒 User present:', !!req.user);
    console.log('🔒 User role:', req.user?.role);
    
    if (!req.user) {
      console.log('❌ No user in request - authorization failed');
      res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      console.log('❌ User role not authorized:', req.user.role);
      console.log('❌ Required roles:', roles);
      res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`,
      });
      return;
    }

    console.log('✅ Authorization successful');
    next();
  };
};

// Optional authentication - doesn't fail if no token provided
export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next(); // Continue without authentication
      return;
    }

    const token = authHeader.substring(7);
    
    if (!process.env.JWT_SECRET) {
      next();
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};
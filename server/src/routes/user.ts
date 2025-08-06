import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import User from '../models/User';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Validation rules
const createUserValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['artist', 'community', 'admin'])
    .withMessage('Role must be artist, community, or admin'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),
  body('specializations')
    .optional()
    .isArray()
    .withMessage('Specializations must be an array'),
];

const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .optional()
    .isIn(['artist', 'community', 'admin'])
    .withMessage('Role must be artist, community, or admin'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),
  body('specializations')
    .optional()
    .isArray()
    .withMessage('Specializations must be an array'),
];

// Get all artists
router.get('/artists', async (req, res) => {
  try {
    const { page = 1, limit = 12, search, specialization } = req.query;

    const query: any = { role: 'artist', isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (specialization) {
      query.specializations = { $in: [specialization] };
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [artists, total] = await Promise.all([
      User.find(query)
        .select('name avatar bio location verified specializations rating totalSales totalRatings createdAt')
        .sort({ verified: -1, rating: -1, totalSales: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    const pages = Math.ceil(total / limitNum);

    return res.json({
      success: true,
      artists,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages,
        hasNext: pageNum < pages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error: any) {
    console.error('Get artists error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch artists',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Get artist by ID
router.get('/artists/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const artist = await User.findOne({ _id: id, role: 'artist', isActive: true })
      .select('name avatar bio location verified specializations rating totalSales totalRatings socialLinks createdAt');

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found',
      });
    }

    return res.json({
      success: true,
      artist,
    });
  } catch (error: any) {
    console.error('Get artist by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch artist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Create user (admin only)
router.post('/', authenticate, authorize('admin'), createUserValidation, async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, bio, location, phone, specializations, socialLinks } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create new user
    const userData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
    };

    if (bio) userData.bio = bio.trim();
    if (location) userData.location = location.trim();
    if (phone) userData.phone = phone.trim();
    if (role === 'artist' && specializations && Array.isArray(specializations)) {
      userData.specializations = specializations.map((s: string) => s.trim());
    }
    if (socialLinks) userData.socialLinks = socialLinks;

    const user = new User(userData);
    await user.save();

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: user.toJSON(),
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Update user (admin only)
router.put('/:id', authenticate, authorize('admin'), updateUserValidation, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update user fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        (user as any)[key] = updates[key];
      }
    });

    await user.save();

    return res.json({
      success: true,
      message: 'User updated successfully',
      user: user.toJSON(),
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await User.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Admin routes
router.get('/', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;

    const query: any = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('name email role avatar verified isActive lastLogin createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    const pages = Math.ceil(total / limitNum);

    return res.json({
      success: true,
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages,
        hasNext: pageNum < pages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Toggle user active status (admin only)
router.patch('/:id/toggle-status', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error: any) {
    console.error('Toggle user status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle user status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Verify artist (admin only)
router.patch('/:id/verify', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ _id: id, role: 'artist' });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found',
      });
    }

    user.verified = !user.verified;
    await user.save();

    return res.json({
      success: true,
      message: `Artist ${user.verified ? 'verified' : 'unverified'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        verified: user.verified,
      },
    });
  } catch (error: any) {
    console.error('Verify artist error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify artist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
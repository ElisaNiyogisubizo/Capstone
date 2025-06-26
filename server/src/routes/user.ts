import express from 'express';
import User from '../models/User';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

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

// Admin routes
router.get('/', authenticate, authorize('admin'), async (req, res) => {
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
router.patch('/:id/toggle-status', authenticate, authorize('admin'), async (req, res) => {
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
router.patch('/:id/verify', authenticate, authorize('admin'), async (req, res) => {
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
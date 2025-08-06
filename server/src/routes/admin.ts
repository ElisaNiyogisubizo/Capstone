import express, { Request, Response } from 'express';
import User from '../models/User';
import Artwork from '../models/Artwork';
import Exhibition from '../models/Exhibition';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Get dashboard statistics (admin only)
router.get('/stats', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalArtists,
      totalArtworks,
      totalExhibitions,
      recentUsers,
      recentArtworks
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'artist' }),
      Artwork.countDocuments(),
      Exhibition.countDocuments(),
      User.find()
        .select('name email role createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Artwork.find()
        .populate('artist', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalArtists,
        totalArtworks,
        totalExhibitions,
        recentUsers,
        recentArtworks
      }
    });
  } catch (error: any) {
    console.error('Get admin stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Get platform overview (admin only)
router.get('/overview', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const [
      usersByRole,
      artworksByCategory,
      exhibitionsByStatus,
      monthlyStats
    ] = await Promise.all([
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      Artwork.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Exhibition.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    return res.json({
      success: true,
      overview: {
        usersByRole,
        artworksByCategory,
        exhibitionsByStatus,
        monthlyStats
      }
    });
  } catch (error: any) {
    console.error('Get admin overview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch platform overview',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Verify user (admin only)
router.patch('/users/:id/verify', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { verified: Boolean(verified) },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      message: `User ${verified ? 'verified' : 'unverified'} successfully`,
      user,
    });
  } catch (error: any) {
    console.error('Verify user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Update user stats (admin only)
router.patch('/users/:id/stats', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { totalSales, rating, totalRatings } = req.body;

    const updateData: any = {};
    if (totalSales !== undefined) updateData.totalSales = totalSales;
    if (rating !== undefined) updateData.rating = rating;
    if (totalRatings !== undefined) updateData.totalRatings = totalRatings;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      message: 'User stats updated successfully',
      user,
    });
  } catch (error: any) {
    console.error('Update user stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Get all users (admin only)
router.get('/users', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, role, verified } = req.query;

    const query: any = {};
    if (role) query.role = role;
    if (verified !== undefined) query.verified = verified === 'true';

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
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

// Get user by ID (admin only)
router.get('/users/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Update user (admin only)
router.put('/users/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, bio, location, phone, socialLinks, specializations, verified, totalSales, rating, totalRatings } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (phone !== undefined) updateData.phone = phone;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
    if (specializations !== undefined) updateData.specializations = specializations;
    if (verified !== undefined) updateData.verified = verified;
    if (totalSales !== undefined) updateData.totalSales = totalSales;
    if (rating !== undefined) updateData.rating = rating;
    if (totalRatings !== undefined) updateData.totalRatings = totalRatings;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.json({
      success: true,
      message: 'User updated successfully',
      user,
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
router.delete('/users/:id', authenticate, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

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

export default router; 
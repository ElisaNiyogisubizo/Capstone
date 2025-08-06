import { Request, Response } from 'express';
import Follow from '../models/Follow';
import User from '../models/User';

// Follow a user
export const followUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const followerId = (req as any).user.id;

    // Check if trying to follow self
    if (followerId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself',
      });
    }

    // Check if user exists
    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: userId,
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user',
      });
    }

    // Create follow relationship
    const follow = new Follow({
      follower: followerId,
      following: userId,
    });

    await follow.save();

    // Update user follower/following counts
    await User.findByIdAndUpdate(followerId, {
      $push: { following: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $push: { followers: followerId }
    });

    return res.status(200).json({
      success: true,
      message: 'Successfully followed user',
    });
  } catch (error: any) {
    console.error('Error following user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to follow user',
      error: error.message,
    });
  }
};

// Unfollow a user
export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const followerId = (req as any).user.id;

    // Check if follow relationship exists
    const follow = await Follow.findOne({
      follower: followerId,
      following: userId,
    });

    if (!follow) {
      return res.status(400).json({
        success: false,
        message: 'Not following this user',
      });
    }

    // Remove follow relationship
    await Follow.findByIdAndDelete(follow._id);

    // Update user follower/following counts
    await User.findByIdAndUpdate(followerId, {
      $pull: { following: userId }
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { followers: followerId }
    });

    return res.status(200).json({
      success: true,
      message: 'Successfully unfollowed user',
    });
  } catch (error: any) {
    console.error('Error unfollowing user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to unfollow user',
      error: error.message,
    });
  }
};

// Check if following a user
export const checkFollowStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const followerId = (req as any).user.id;

    const follow = await Follow.findOne({
      follower: followerId,
      following: userId,
    });

    return res.status(200).json({
      success: true,
      data: {
        isFollowing: !!follow,
      },
    });
  } catch (error: any) {
    console.error('Error checking follow status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check follow status',
      error: error.message,
    });
  }
};

// Get user's followers
export const getUserFollowers = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const [followers, total] = await Promise.all([
      User.find({ _id: { $in: user.followers } })
        .select('name avatar bio role verified')
        .sort({ name: 1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments({ _id: { $in: user.followers } }),
    ]);

    const pages = Math.ceil(total / Number(limit));

    return res.status(200).json({
      success: true,
      data: followers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages,
        hasNext: Number(page) < pages,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user followers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch followers',
      error: error.message,
    });
  }
};

// Get users that a user is following
export const getUserFollowing = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const [following, total] = await Promise.all([
      User.find({ _id: { $in: user.following } })
        .select('name avatar bio role verified')
        .sort({ name: 1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments({ _id: { $in: user.following } }),
    ]);

    const pages = Math.ceil(total / Number(limit));

    return res.status(200).json({
      success: true,
      data: following,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages,
        hasNext: Number(page) < pages,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user following:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch following',
      error: error.message,
    });
  }
};

// Get suggested users to follow
export const getSuggestedUsers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { limit = 10 } = req.query;

    // Get users that the current user is following
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Find users that the current user is not following
    const suggestedUsers = await User.find({
      _id: { 
        $nin: [...currentUser.following, userId] 
      },
      role: 'artist', // Suggest artists by default
      isActive: true,
    })
      .select('name avatar bio role verified specializations')
      .sort({ verified: -1, totalSales: -1 }) // Prioritize verified artists with sales
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: suggestedUsers,
    });
  } catch (error: any) {
    console.error('Error fetching suggested users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch suggested users',
      error: error.message,
    });
  }
}; 
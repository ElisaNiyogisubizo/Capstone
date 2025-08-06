import { Request, Response } from 'express';
import Artwork from '../models/Artwork';
import Comment from '../models/Comment';
import Follow from '../models/Follow';
import Exhibition from '../models/Exhibition';
import VirtualExhibition from '../models/VirtualExhibition';
import User from '../models/User';

// Get artist analytics overview
export const getArtistAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Verify user is an artist
    const user = await User.findById(userId);
    if (!user || user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: 'Only artists can view analytics',
      });
    }

    // Get all artist's artworks
    const artworks = await Artwork.find({ artist: userId });

    // Calculate artwork statistics
    const artworkStats = {
      total: artworks.length,
      available: artworks.filter(a => a.status === 'available').length,
      sold: artworks.filter(a => a.status === 'sold').length,
      reserved: artworks.filter(a => a.status === 'reserved').length,
      totalViews: artworks.reduce((sum, a) => sum + a.views, 0),
      totalLikes: artworks.reduce((sum, a) => sum + a.likes.length, 0),
      totalComments: artworks.reduce((sum, a) => sum + a.comments.length, 0),
    };

    // Get follower statistics
    const followerStats = {
      followers: user.followers.length,
      following: user.following.length,
    };

    // Get exhibition statistics
    const [exhibitions, virtualExhibitions] = await Promise.all([
      Exhibition.find({ organizer: userId }),
      VirtualExhibition.find({ organizer: userId }),
    ]);

    const exhibitionStats = {
      total: exhibitions.length + virtualExhibitions.length,
      regular: exhibitions.length,
      virtual: virtualExhibitions.length,
      totalAttendees: virtualExhibitions.reduce((sum, e) => sum + e.attendees.length, 0),
      totalViews: virtualExhibitions.reduce((sum, e) => sum + e.views, 0),
    };

    // Get recent engagement (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentComments = await Comment.find({
      artwork: { $in: artworks.map(a => a._id) },
      createdAt: { $gte: thirtyDaysAgo },
      isDeleted: false,
    }).populate('author', 'name avatar');

    const recentFollowers = await Follow.find({
      following: userId,
      createdAt: { $gte: thirtyDaysAgo },
    }).populate('follower', 'name avatar');

    return res.status(200).json({
      success: true,
      data: {
        artworkStats,
        followerStats,
        exhibitionStats,
        recentEngagement: {
          comments: recentComments.length,
          newFollowers: recentFollowers.length,
          recentComments: recentComments.slice(0, 5),
          recentFollowers: recentFollowers.slice(0, 5),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching artist analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message,
    });
  }
};

// Get artwork analytics
export const getArtworkAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { artworkId } = req.params;

    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: 'Artwork not found',
      });
    }

    // Check if user owns this artwork
    if (artwork.artist.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this artwork analytics',
      });
    }

    // Get comments for this artwork
    const comments = await Comment.find({
      artwork: artworkId,
      isDeleted: false,
    }).populate('author', 'name avatar');

    // Get likes for this artwork
    const likes = await User.find({
      _id: { $in: artwork.likes },
    }).select('name avatar');

    // Calculate engagement metrics
    const engagementMetrics = {
      views: artwork.views,
      likes: artwork.likes.length,
      comments: comments.length,
      engagementRate: artwork.views > 0 ? ((artwork.likes.length + comments.length) / artwork.views * 100).toFixed(2) : 0,
    };

    return res.status(200).json({
      success: true,
      data: {
        artwork: {
          _id: artwork._id,
          title: artwork.title,
          status: artwork.status,
          price: artwork.price,
          createdAt: artwork.createdAt,
        },
        engagementMetrics,
        comments,
        likes,
      },
    });
  } catch (error: any) {
    console.error('Error fetching artwork analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch artwork analytics',
      error: error.message,
    });
  }
};

// Get exhibition analytics
export const getExhibitionAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { exhibitionId } = req.params;
    const { type = 'virtual' } = req.query;

    let exhibition;
    if (type === 'virtual') {
      exhibition = await VirtualExhibition.findById(exhibitionId);
    } else {
      exhibition = await Exhibition.findById(exhibitionId);
    }

    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Exhibition not found',
      });
    }

    // Check if user is the organizer
    if (exhibition.organizer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this exhibition analytics',
      });
    }

    let analytics;
    if (type === 'virtual') {
      const virtualExhibition = exhibition as any;
      const attendees = await User.find({
        _id: { $in: virtualExhibition.attendees },
      }).select('name avatar email createdAt');

      analytics = {
        views: virtualExhibition.views,
        visits: virtualExhibition.visits,
        attendeeCount: virtualExhibition.attendees.length,
        attendees,
        engagementRate: virtualExhibition.views > 0 ? (virtualExhibition.visits / virtualExhibition.views * 100).toFixed(2) : 0,
      };
    } else {
      const regularExhibition = exhibition as any;
      const registeredUsers = await User.find({
        _id: { $in: regularExhibition.registeredUsers },
      }).select('name avatar email createdAt');

      analytics = {
        registeredCount: regularExhibition.registeredUsers.length,
        registeredUsers,
        maxCapacity: regularExhibition.maxCapacity,
        capacityUtilization: regularExhibition.maxCapacity ? 
          (regularExhibition.registeredUsers.length / regularExhibition.maxCapacity * 100).toFixed(2) : 0,
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        exhibition: {
          _id: exhibition._id,
          title: exhibition.title,
          status: exhibition.status,
          startDate: exhibition.startDate,
          endDate: exhibition.endDate,
        },
        analytics,
      },
    });
  } catch (error: any) {
    console.error('Error fetching exhibition analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch exhibition analytics',
      error: error.message,
    });
  }
};

// Get follower analytics
export const getFollowerAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findById(userId);
    if (!user || user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: 'Only artists can view follower analytics',
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Get followers with additional data
    const [followers, total] = await Promise.all([
      User.find({ _id: { $in: user.followers } })
        .select('name avatar bio role verified createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments({ _id: { $in: user.followers } }),
    ]);

    // Get engagement data for each follower
    const followersWithEngagement = await Promise.all(
      followers.map(async (follower) => {
        const followerArtworks = await Artwork.find({ artist: follower._id });
        const totalLikes = followerArtworks.reduce((sum, a) => sum + a.likes.length, 0);
        const totalViews = followerArtworks.reduce((sum, a) => sum + a.views, 0);

        return {
          ...follower.toObject(),
          engagement: {
            artworksCount: followerArtworks.length,
            totalLikes,
            totalViews,
          },
        };
      })
    );

    const pages = Math.ceil(total / Number(limit));

    return res.status(200).json({
      success: true,
      data: followersWithEngagement,
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
    console.error('Error fetching follower analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch follower analytics',
      error: error.message,
    });
  }
};

// Get sales analytics
export const getSalesAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { period = '30' } = req.query;

    const user = await User.findById(userId);
    if (!user || user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: 'Only artists can view sales analytics',
      });
    }

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(period));

    // Get sold artworks in the specified period
    const soldArtworks = await Artwork.find({
      artist: userId,
      status: 'sold',
      updatedAt: { $gte: daysAgo },
    }).sort({ updatedAt: -1 });

    const salesData = {
      totalSales: soldArtworks.reduce((sum, a) => sum + a.price, 0),
      soldCount: soldArtworks.length,
      averagePrice: soldArtworks.length > 0 ? 
        (soldArtworks.reduce((sum, a) => sum + a.price, 0) / soldArtworks.length).toFixed(2) : 0,
      period: Number(period),
      soldArtworks: soldArtworks.map(a => ({
        _id: a._id,
        title: a.title,
        price: a.price,
        soldAt: a.updatedAt,
      })),
    };

    return res.status(200).json({
      success: true,
      data: salesData,
    });
  } catch (error: any) {
    console.error('Error fetching sales analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sales analytics',
      error: error.message,
    });
  }
}; 
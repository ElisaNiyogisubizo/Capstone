import { Request, Response } from 'express';
import VirtualExhibition from '../models/VirtualExhibition';
import User from '../models/User';
import Artwork from '../models/Artwork';

// Get all virtual exhibitions with filtering
export const getVirtualExhibitions = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      organizer,
      theme,
      isFree,
      search,
    } = req.query;

    const query: any = {};

    if (status) query.status = status;
    if (organizer) query.organizer = organizer;
    if (theme) query.theme = { $regex: theme, $options: 'i' };
    if (isFree !== undefined) query.isFree = isFree === 'true';

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { theme: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [exhibitions, total] = await Promise.all([
      VirtualExhibition.find(query)
        .populate('organizer', 'name avatar')
        .populate('featuredArtworks', 'title images price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      VirtualExhibition.countDocuments(query),
    ]);

    const pages = Math.ceil(total / Number(limit));

    return res.status(200).json({
      success: true,
      data: exhibitions,
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
    console.error('Error fetching virtual exhibitions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch virtual exhibitions',
      error: error.message,
    });
  }
};

// Get virtual exhibition by ID
export const getVirtualExhibition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const exhibition = await VirtualExhibition.findById(id)
      .populate('organizer', 'name avatar bio')
      .populate('featuredArtworks', 'title images price artist')
      .populate('attendees', 'name avatar');

    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Virtual exhibition not found',
      });
    }

    // Increment views
    exhibition.views += 1;
    await exhibition.save();

    return res.status(200).json({
      success: true,
      data: exhibition,
    });
  } catch (error: any) {
    console.error('Error fetching virtual exhibition:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch virtual exhibition',
      error: error.message,
    });
  }
};

// Create virtual exhibition
export const createVirtualExhibition = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      theme,
      artistNotes,
      startDate,
      endDate,
      isFree,
      price,
      tags,
      coverImage,
      additionalImages,
      settings,
    } = req.body;

    const userId = req.user?._id;

    // Verify user is an artist
    const user = await User.findById(userId);
    if (!user || user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: 'Only artists can create virtual exhibitions',
      });
    }

    const exhibition = new VirtualExhibition({
      title,
      description,
      theme,
      artistNotes,
      startDate,
      endDate,
      organizer: userId,
      isFree: isFree || true,
      price: price || 0,
      tags: tags || [],
      coverImage,
      additionalImages: additionalImages || [],
      settings: settings || {
        allowComments: true,
        allowSharing: true,
        requireRegistration: false,
      },
    });

    await exhibition.save();

    const populatedExhibition = await VirtualExhibition.findById(exhibition._id)
      .populate('organizer', 'name avatar');

    return res.status(201).json({
      success: true,
      data: populatedExhibition,
      message: 'Virtual exhibition created successfully',
    });
  } catch (error: any) {
    console.error('Error creating virtual exhibition:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create virtual exhibition',
      error: error.message,
    });
  }
};

// Update virtual exhibition
export const updateVirtualExhibition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const exhibition = await VirtualExhibition.findById(id);
    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Virtual exhibition not found',
      });
    }

    // Check if user is the organizer or admin
    if (exhibition.organizer.toString() !== userId && (req as any).user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this virtual exhibition',
      });
    }

    const updatedExhibition = await VirtualExhibition.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('organizer', 'name avatar');

    return res.status(200).json({
      success: true,
      data: updatedExhibition,
      message: 'Virtual exhibition updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating virtual exhibition:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update virtual exhibition',
      error: error.message,
    });
  }
};

// Delete virtual exhibition
export const deleteVirtualExhibition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const exhibition = await VirtualExhibition.findById(id);
    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Virtual exhibition not found',
      });
    }

    // Check if user is the organizer or admin
    if (exhibition.organizer.toString() !== userId && (req as any).user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this virtual exhibition',
      });
    }

    await VirtualExhibition.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Virtual exhibition deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting virtual exhibition:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete virtual exhibition',
      error: error.message,
    });
  }
};

// Join virtual exhibition
export const joinVirtualExhibition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const exhibition = await VirtualExhibition.findById(id);
    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Virtual exhibition not found',
      });
    }

    if (exhibition.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Virtual exhibition is not published',
      });
    }

    // Check if user is already an attendee
    if (exhibition.attendees.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Already joined this virtual exhibition',
      });
    }

    // Check capacity if set
    if (exhibition.settings.maxAttendees && 
        exhibition.attendees.length >= exhibition.settings.maxAttendees) {
      return res.status(400).json({
        success: false,
        message: 'Virtual exhibition is at full capacity',
      });
    }

    exhibition.attendees.push(userId);
    exhibition.visits += 1;
    await exhibition.save();

    return res.status(200).json({
      success: true,
      message: 'Successfully joined virtual exhibition',
    });
  } catch (error: any) {
    console.error('Error joining virtual exhibition:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to join virtual exhibition',
      error: error.message,
    });
  }
};

// Get virtual exhibition analytics
export const getVirtualExhibitionAnalytics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const exhibition = await VirtualExhibition.findById(id);
    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Virtual exhibition not found',
      });
    }

    // Check if user is the organizer or admin
    if (exhibition.organizer.toString() !== userId && (req as any).user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics',
      });
    }

    const analytics = {
      views: exhibition.views,
      visits: exhibition.visits,
      attendeeCount: exhibition.attendees.length,
      attendees: await User.find({ _id: { $in: exhibition.attendees } })
        .select('name avatar email createdAt'),
    };

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    console.error('Error fetching virtual exhibition analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message,
    });
  }
}; 
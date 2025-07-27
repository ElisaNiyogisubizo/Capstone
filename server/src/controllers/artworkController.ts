import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Artwork from '../models/Artwork';
import User from '../models/User';

export const getArtworks = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      artist,
      minPrice,
      maxPrice,
      status = 'available',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build query
    const query: any = {};
    
    if (category) query.category = category;
    if (artist) query.artist = artist;
    if (status) query.status = status;
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit))); // Max 50 items per page
    const skip = (pageNum - 1) * limitNum;

    const [artworks, total] = await Promise.all([
      Artwork.find(query)
        .populate('artist', 'name avatar location verified rating')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Artwork.countDocuments(query),
    ]);

    const pages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      artworks,
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
    console.error('Get artworks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artworks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const getArtworkById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const artwork = await Artwork.findById(id)
      .populate('artist', 'name avatar bio location verified rating totalSales socialLinks')
      .populate('likes', 'name avatar');

    if (!artwork) {
      res.status(404).json({
        success: false,
        message: 'Artwork not found',
      });
      return;
    }

    // Increment view count (but not for the artist viewing their own work)
    if (!req.user || req.user._id.toString() !== artwork.artist._id.toString()) {
      artwork.views += 1;
      await artwork.save();
    }

    res.json({
      success: true,
      artwork,
    });
  } catch (error: any) {
    console.error('Get artwork by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artwork',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const createArtwork = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    if (req.user.role !== 'artist') {
      res.status(403).json({
        success: false,
        message: 'Only artists can create artworks',
      });
      return;
    }

    const { title, description, price, category, medium, dimensions } = req.body;

    // Handle image uploads
    const images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      // Process uploaded files
      for (const file of req.files) {
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/artworks/${file.filename}`;
        images.push(imageUrl);
      }
    } else {
      // Fallback to placeholder image if no files uploaded
      images.push('https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg');
    }

    // Handle tags from form data
    const tags: string[] = [];
    if (req.body.tags) {
      // If tags is an array, use it directly
      if (Array.isArray(req.body.tags)) {
        tags.push(...req.body.tags.map((tag: string) => tag.trim().toLowerCase()));
      } else {
        // If it's a string, try to parse it as JSON
        try {
          const parsedTags = JSON.parse(req.body.tags);
          if (Array.isArray(parsedTags)) {
            tags.push(...parsedTags.map((tag: string) => tag.trim().toLowerCase()));
          }
        } catch (e) {
          // If parsing fails, treat it as a single tag
          tags.push(req.body.tags.trim().toLowerCase());
        }
      }
    }

    const artworkData = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      medium: medium.trim(),
      dimensions: dimensions.trim(),
      images,
      artist: req.user._id,
      tags,
    };

    const artwork = new Artwork(artworkData);
    await artwork.save();

    // Populate artist info for response
    await artwork.populate('artist', 'name avatar location verified rating');

    res.status(201).json({
      success: true,
      message: 'Artwork created successfully',
      artwork,
    });
  } catch (error: any) {
    console.error('Create artwork error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create artwork',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const updateArtwork = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const artwork = await Artwork.findById(id);
    if (!artwork) {
      res.status(404).json({
        success: false,
        message: 'Artwork not found',
      });
      return;
    }

    // Check if user owns the artwork or is admin
    if (artwork.artist.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this artwork',
      });
      return;
    }

    const allowedUpdates = ['title', 'description', 'price', 'category', 'medium', 'dimensions', 'tags', 'status'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      res.status(400).json({
        success: false,
        message: 'Invalid updates',
      });
      return;
    }

    // Update artwork fields
    updates.forEach(update => {
      if (req.body[update] !== undefined) {
        if (update === 'tags' && Array.isArray(req.body[update])) {
          artwork.tags = req.body[update].map((tag: string) => tag.trim().toLowerCase());
        } else {
          (artwork as any)[update] = req.body[update];
        }
      }
    });

    await artwork.save();
    await artwork.populate('artist', 'name avatar location verified rating');

    res.json({
      success: true,
      message: 'Artwork updated successfully',
      artwork,
    });
  } catch (error: any) {
    console.error('Update artwork error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update artwork',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const deleteArtwork = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const artwork = await Artwork.findById(id);
    if (!artwork) {
      res.status(404).json({
        success: false,
        message: 'Artwork not found',
      });
      return;
    }

    // Check if user owns the artwork or is admin
    if (artwork.artist.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this artwork',
      });
      return;
    }

    await Artwork.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Artwork deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete artwork error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete artwork',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const likeArtwork = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const artwork = await Artwork.findById(id);
    if (!artwork) {
      res.status(404).json({
        success: false,
        message: 'Artwork not found',
      });
      return;
    }

    const userId = req.user._id;
    const isLiked = artwork.likes.includes(userId);

    if (isLiked) {
      // Unlike
      artwork.likes = artwork.likes.filter(like => like.toString() !== userId.toString());
    } else {
      // Like
      artwork.likes.push(userId);
    }

    await artwork.save();

    res.json({
      success: true,
      message: isLiked ? 'Artwork unliked' : 'Artwork liked',
      liked: !isLiked,
      likeCount: artwork.likes.length,
    });
  } catch (error: any) {
    console.error('Like artwork error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like/unlike artwork',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = [
      'Painting',
      'Photography',
      'Sculpture',
      'Digital Art',
      'Mixed Media',
      'Abstract',
      'Portrait',
      'Landscape',
      'Still Life',
      'Street Art',
      'Other'
    ];

    res.json({
      success: true,
      categories,
    });
  } catch (error: any) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
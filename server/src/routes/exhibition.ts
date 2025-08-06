import express, { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import Exhibition from '../models/Exhibition';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';

const router = express.Router();

// Get all exhibitions
router.get('/', optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 12, status, upcoming, organizer } = req.query;

    const query: any = {};
    
    if (status) {
      query.status = status;
    } else if (upcoming === 'true') {
      query.status = { $in: ['upcoming', 'ongoing'] };
    }

    if (organizer) {
      query.organizer = organizer;
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [exhibitions, total] = await Promise.all([
      Exhibition.find(query)
        .populate('organizer', 'name avatar')
        .populate('featuredArtworks', 'title images artist')
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Exhibition.countDocuments(query),
    ]);

    const pages = Math.ceil(total / limitNum);

    return res.json({
      success: true,
      exhibitions,
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
    console.error('Get exhibitions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch exhibitions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Get exhibition by ID
router.get('/:id', optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const exhibition = await Exhibition.findById(id)
      .populate('organizer', 'name avatar bio')
      .populate({
        path: 'featuredArtworks',
        populate: {
          path: 'artist',
          select: 'name avatar verified',
        },
      })
      .populate('registeredUsers', 'name avatar');

    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Exhibition not found',
      });
    }

    return res.json({
      success: true,
      exhibition,
    });
  } catch (error: any) {
    console.error('Get exhibition by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch exhibition',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Create exhibition (admin and artists)
router.post(
  '/',
  authenticate,
  authorize('admin', 'artist'),
  (req: Request, res: Response, next: NextFunction) => {
    console.log('=== EXHIBITION CREATE ROUTE ===');
    console.log('🔐 User authenticated:', !!req.user);
    console.log('👤 User object:', req.user);
    console.log('👤 User ID:', req.user?._id);
    console.log('👤 User role:', req.user?.role);
    console.log('📝 Request body:', req.body);
    next();
  },
  [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('description')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    body('startDate')
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    body('endDate')
      .isISO8601()
      .withMessage('End date must be a valid date'),
    body('location')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Location must be between 1 and 200 characters'),
    body('image')
      .isURL()
      .withMessage('Image must be a valid URL'),
  ],
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const {
        title,
        description,
        startDate,
        endDate,
        location,
        image,
        featuredArtworks,
        maxCapacity,
        price,
        isFree,
        tags,
        additionalImages,
      } = req.body;

      const exhibitionData: any = {
        title: title.trim(),
        description: description.trim(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location: location.trim(),
        image,
        organizer: req.user._id,
      };

      if (featuredArtworks && Array.isArray(featuredArtworks)) {
        exhibitionData.featuredArtworks = featuredArtworks;
      }

      if (maxCapacity) {
        exhibitionData.maxCapacity = Number(maxCapacity);
      }

      if (price !== undefined) {
        exhibitionData.price = Number(price);
      }

      if (isFree !== undefined) {
        exhibitionData.isFree = Boolean(isFree);
      }

      if (tags && Array.isArray(tags)) {
        exhibitionData.tags = tags;
      }

      if (additionalImages && Array.isArray(additionalImages)) {
        exhibitionData.additionalImages = additionalImages;
      }

      const exhibition = new Exhibition(exhibitionData);
      await exhibition.save();

      await exhibition.populate('organizer', 'name avatar');

      return res.status(201).json({
        success: true,
        message: 'Exhibition created successfully',
        exhibition,
      });
    } catch (error: any) {
      console.error('Create exhibition error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create exhibition',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

// Register for exhibition
router.post('/:id/register', authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { id } = req.params;

    const exhibition = await Exhibition.findById(id);
    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Exhibition not found',
      });
    }

    if (exhibition.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for completed exhibition',
      });
    }

    const userId = req.user._id;
    const isAlreadyRegistered = exhibition.registeredUsers.includes(userId);

    if (isAlreadyRegistered) {
      // Unregister
      exhibition.registeredUsers = exhibition.registeredUsers.filter(
        user => user.toString() !== userId.toString()
      );
    } else {
      // Check capacity
      if (exhibition.maxCapacity && exhibition.registeredUsers.length >= exhibition.maxCapacity) {
        return res.status(400).json({
          success: false,
          message: 'Exhibition is at full capacity',
        });
      }

      // Register
      exhibition.registeredUsers.push(userId);
    }

    await exhibition.save();

    return res.json({
      success: true,
      message: isAlreadyRegistered ? 'Unregistered from exhibition' : 'Registered for exhibition',
      registered: !isAlreadyRegistered,
      registrationCount: exhibition.registeredUsers.length,
    });
  } catch (error: any) {
    console.error('Register for exhibition error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register for exhibition',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Update exhibition (admin only)
router.put('/:id', authenticate, authorize('admin'), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location must be between 1 and 200 characters'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
], async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const exhibition = await Exhibition.findById(id);
    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Exhibition not found',
      });
    }

    // Update exhibition fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        if (key === 'startDate' || key === 'endDate') {
          (exhibition as any)[key] = new Date(updates[key]);
        } else {
          (exhibition as any)[key] = updates[key];
        }
      }
    });

    await exhibition.save();
    await exhibition.populate('organizer', 'name avatar');

    return res.json({
      success: true,
      message: 'Exhibition updated successfully',
      exhibition,
    });
  } catch (error: any) {
    console.error('Update exhibition error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update exhibition',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Delete exhibition (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;

    const exhibition = await Exhibition.findById(id);
    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: 'Exhibition not found',
      });
    }

    await Exhibition.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'Exhibition deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete exhibition error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete exhibition',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
import express from 'express';
import { body } from 'express-validator';
import Message from '../models/Message';
import User from '../models/User';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get conversations for current user
router.get('/conversations', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const userId = req.user._id;

    // Get latest message for each conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$receiver',
              '$sender',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', userId] },
                    { $eq: ['$read', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'otherUser',
        },
      },
      {
        $unwind: '$otherUser',
      },
      {
        $project: {
          otherUser: {
            _id: 1,
            name: 1,
            avatar: 1,
            role: 1,
          },
          lastMessage: 1,
          unreadCount: 1,
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    return res.json({
      success: true,
      conversations,
    });
  } catch (error: any) {
    console.error('Get conversations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Get messages between two users
router.get('/:userId', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const currentUserId = req.user._id;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .populate('artwork', 'title images price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        read: false,
      },
      { read: true }
    );

    return res.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
    });
  } catch (error: any) {
    console.error('Get messages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Send a message
router.post(
  '/',
  authenticate,
  [
    body('receiver').isMongoId().withMessage('Invalid receiver ID'),
    body('content')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Message content must be between 1 and 1000 characters'),
    body('artwork').optional().isMongoId().withMessage('Invalid artwork ID'),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const { receiver, content, artwork } = req.body;

      // Check if receiver exists
      const receiverUser = await User.findById(receiver);
      if (!receiverUser) {
        return res.status(404).json({
          success: false,
          message: 'Receiver not found',
        });
      }

      const messageData: any = {
        sender: req.user._id,
        receiver,
        content: content.trim(),
      };

      if (artwork) {
        messageData.artwork = artwork;
      }

      const message = new Message(messageData);
      await message.save();

      await message.populate([
        { path: 'sender', select: 'name avatar' },
        { path: 'receiver', select: 'name avatar' },
        { path: 'artwork', select: 'title images price' },
      ]);

      return res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message,
      });
    } catch (error: any) {
      console.error('Send message error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

// Mark messages as read
router.patch('/:userId/read', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { userId } = req.params;

    await Message.updateMany(
      {
        sender: userId,
        receiver: req.user._id,
        read: false,
      },
      { read: true }
    );

    return res.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error: any) {
    console.error('Mark messages as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
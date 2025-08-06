import express from 'express';
import { body } from 'express-validator';
import {
  getConversations,
  getMessages,
  sendMessage,
  markConversationAsRead,
  getUnreadCount,
} from '../controllers/messageController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get conversations for current user
router.get('/conversations', authenticate, getConversations);

// Get unread message count
router.get('/unread-count', authenticate, getUnreadCount);

// Get messages for a specific conversation
router.get('/conversation/:conversationId', authenticate, getMessages);

// Send a message
router.post(
  '/',
  authenticate,
  [
    body('receiverId').isMongoId().withMessage('Invalid receiver ID'),
    body('content')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Message content must be between 1 and 1000 characters'),
    body('artworkId').optional().isMongoId().withMessage('Invalid artwork ID'),
  ],
  sendMessage
);

// Mark conversation as read
router.patch('/conversation/:conversationId/read', authenticate, markConversationAsRead);

export default router;
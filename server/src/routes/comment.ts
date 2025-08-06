import express from 'express';
import {
  getArtworkComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  getCommentReplies,
} from '../controllers/commentController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/artwork/:artworkId', getArtworkComments);
router.get('/:id/replies', getCommentReplies);

// Protected routes
router.use(authenticate);

router.post('/artwork/:artworkId', createComment);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);
router.post('/:id/like', toggleCommentLike);

export default router; 
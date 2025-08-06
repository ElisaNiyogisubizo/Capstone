import express from 'express';
import {
  followUser,
  unfollowUser,
  checkFollowStatus,
  getUserFollowers,
  getUserFollowing,
  getSuggestedUsers,
} from '../controllers/followController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/:userId/followers', getUserFollowers);
router.get('/:userId/following', getUserFollowing);

// Protected routes
router.use(authenticate);

router.post('/:userId', followUser);
router.delete('/:userId', unfollowUser);
router.get('/:userId/status', checkFollowStatus);
router.get('/suggested', getSuggestedUsers);

export default router; 
import express from 'express';
import {
  getArtistAnalytics,
  getArtworkAnalytics,
  getExhibitionAnalytics,
  getFollowerAnalytics,
  getSalesAnalytics,
} from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All analytics routes require authentication
router.use(authenticate);

router.get('/artist', getArtistAnalytics);
router.get('/artwork/:artworkId', getArtworkAnalytics);
router.get('/exhibition/:exhibitionId', getExhibitionAnalytics);
router.get('/followers', getFollowerAnalytics);
router.get('/sales', getSalesAnalytics);

export default router; 
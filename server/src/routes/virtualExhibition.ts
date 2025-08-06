import express from 'express';
import {
  getVirtualExhibitions,
  getVirtualExhibition,
  createVirtualExhibition,
  updateVirtualExhibition,
  deleteVirtualExhibition,
  joinVirtualExhibition,
  getVirtualExhibitionAnalytics,
} from '../controllers/virtualExhibitionController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getVirtualExhibitions);
router.get('/:id', getVirtualExhibition);

// Protected routes
router.use(authenticate);

router.post('/', createVirtualExhibition);
router.put('/:id', updateVirtualExhibition);
router.delete('/:id', deleteVirtualExhibition);
router.post('/:id/join', joinVirtualExhibition);
router.get('/:id/analytics', getVirtualExhibitionAnalytics);

export default router; 
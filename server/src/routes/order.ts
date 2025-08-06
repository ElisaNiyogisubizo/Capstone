import express from 'express';
import {
  createCheckoutSession,
  handleStripeWebhook,
  getUserOrders,
  getOrder,
  cancelOrder,
} from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Stripe webhook (no authentication required)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Protected routes
router.use(authenticate);

router.post('/checkout', createCheckoutSession);
router.get('/', getUserOrders);
router.get('/:id', getOrder);
router.patch('/:id/cancel', cancelOrder);

export default router; 
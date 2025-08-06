import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/item/:artworkId', updateCartItem);
router.delete('/item/:artworkId', removeFromCart);
router.delete('/', clearCart);

export default router; 
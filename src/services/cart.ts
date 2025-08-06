import api from './api';
import { Cart } from '../types';

export const cartService = {
  // Get user's cart
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Add item to cart
  addToCart: async (artworkId: string, quantity: number = 1) => {
    const response = await api.post('/cart/add', { artworkId, quantity });
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (artworkId: string, quantity: number) => {
    const response = await api.put(`/cart/item/${artworkId}`, { quantity });
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (artworkId: string) => {
    const response = await api.delete(`/cart/item/${artworkId}`);
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  },
}; 
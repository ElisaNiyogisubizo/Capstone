import api from './api';
import { Order } from '../types';

export const orderService = {
  // Create checkout session
  createCheckoutSession: async (shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }) => {
    const response = await api.post('/orders/checkout', { shippingAddress });
    return response.data;
  },

  // Get user's orders
  getUserOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  // Get order by ID
  getOrder: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id: string) => {
    const response = await api.patch(`/orders/${id}/cancel`);
    return response.data;
  },
}; 
import api from './api';
import { User, RegisterData } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(userData: RegisterData): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },
};
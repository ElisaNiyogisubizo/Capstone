import api from './api';
import { User, Artist } from '../types';

export const userService = {
  async getArtists(params?: {
    page?: number;
    limit?: number;
    search?: string;
    specialization?: string;
  }): Promise<{ artists: Artist[]; total: number; pages: number }> {
    const response = await api.get('/users/artists', { params });
    return response.data;
  },

  async getArtistById(id: string): Promise<Artist> {
    const response = await api.get(`/users/artists/${id}`);
    return response.data.artist;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }): Promise<{ users: User[]; total: number; pages: number }> {
    const response = await api.get('/users', { params });
    return response.data;
  },

  async toggleUserStatus(userId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.patch(`/users/${userId}/toggle-status`);
    return response.data;
  },

  async verifyArtist(artistId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.patch(`/users/${artistId}/verify`);
    return response.data;
  },
}; 
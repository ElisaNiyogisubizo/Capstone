import api from './api';
import { User, Artwork, Exhibition } from '../types';

export const adminService = {
  // User Management
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }): Promise<{ users: User[]; total: number; pages: number }> {
    const response = await api.get('/users', { params });
    return response.data;
  },

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: 'artist' | 'community' | 'admin';
    bio?: string;
    location?: string;
    phone?: string;
    specializations?: string[];
    socialLinks?: {
      instagram?: string;
      website?: string;
      facebook?: string;
    };
  }): Promise<User> {
    const response = await api.post('/users', userData);
    return response.data.user;
  },

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data.user;
  },

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/users/${userId}`);
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

  // Artwork Management
  async getArtworks(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    artist?: string;
    status?: string;
  }): Promise<{ artworks: Artwork[]; total: number; pages: number }> {
    const response = await api.get('/artworks', { params });
    return response.data;
  },

  async createArtwork(artworkData: {
    title: string;
    description: string;
    price: number;
    category: string;
    medium: string;
    dimensions: string;
    images: string[];
    artist: string;
    tags?: string[];
  }): Promise<Artwork> {
    const response = await api.post('/artworks', artworkData);
    return response.data.artwork;
  },

  async updateArtwork(artworkId: string, artworkData: Partial<Artwork>): Promise<Artwork> {
    const response = await api.put(`/artworks/${artworkId}`, artworkData);
    return response.data.artwork;
  },

  async deleteArtwork(artworkId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/artworks/${artworkId}`);
    return response.data;
  },

  // Exhibition Management
  async getExhibitions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    upcoming?: boolean;
  }): Promise<{ exhibitions: Exhibition[]; total: number; pages: number }> {
    const response = await api.get('/exhibitions', { params });
    return response.data;
  },

  async createExhibition(exhibitionData: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    image: string;
    featuredArtworks?: string[];
    maxCapacity?: number;
  }): Promise<Exhibition> {
    const response = await api.post('/exhibitions', exhibitionData);
    return response.data.exhibition;
  },

  async updateExhibition(exhibitionId: string, exhibitionData: Partial<Exhibition>): Promise<Exhibition> {
    const response = await api.put(`/exhibitions/${exhibitionId}`, exhibitionData);
    return response.data.exhibition;
  },

  async deleteExhibition(exhibitionId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/exhibitions/${exhibitionId}`);
    return response.data;
  },

  // Statistics
  async getDashboardStats(): Promise<{
    totalUsers: number;
    totalArtists: number;
    totalArtworks: number;
    totalExhibitions: number;
    recentUsers: User[];
    recentArtworks: Artwork[];
  }> {
    const response = await api.get('/admin/stats');
    return response.data;
  },
}; 
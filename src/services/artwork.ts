import api from './api';
import { Artwork, ArtworkFormData } from '../types';

export const artworkService = {
  async getArtworks(params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    artist?: string;
  }): Promise<{ artworks: Artwork[]; total: number; pages: number }> {
    const response = await api.get('/artworks', { params });
    return {
      artworks: response.data.artworks,
      total: response.data.pagination.total,
      pages: response.data.pagination.pages
    };
  },

  async getArtworkById(id: string): Promise<Artwork> {
    const response = await api.get(`/artworks/${id}`);
    return response.data.artwork;
  },

  async createArtwork(formData: FormData): Promise<Artwork> {
    // Don't set Content-Type header - let the browser set it automatically
    const response = await api.post('/artworks', formData);
    return response.data.artwork;
  },

  async updateArtwork(id: string, artworkData: Partial<ArtworkFormData>): Promise<Artwork> {
    const response = await api.put(`/artworks/${id}`, artworkData);
    return response.data;
  },

  async deleteArtwork(id: string): Promise<void> {
    await api.delete(`/artworks/${id}`);
  },

  async likeArtwork(id: string): Promise<void> {
    await api.post(`/artworks/${id}/like`);
  },

  async getCategories(): Promise<string[]> {
    const response = await api.get('/artworks/categories');
    return response.data.categories;
  },
};
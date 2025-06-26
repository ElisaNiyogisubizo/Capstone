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
    return response.data;
  },

  async getArtworkById(id: string): Promise<Artwork> {
    const response = await api.get(`/artworks/${id}`);
    return response.data;
  },

  async createArtwork(artworkData: ArtworkFormData): Promise<Artwork> {
    const formData = new FormData();
    
    // Append text fields
    Object.keys(artworkData).forEach(key => {
      if (key !== 'images' && key !== 'tags') {
        const value = (artworkData as any)[key];
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value.toString());
        }
      }
    });

    // Append tags individually (not as JSON string)
    if (artworkData.tags && artworkData.tags.length > 0) {
      artworkData.tags.forEach(tag => {
        if (tag.trim()) {
          formData.append('tags', tag.trim());
        }
      });
    }

    // Append images
    if (artworkData.images && artworkData.images.length > 0) {
      artworkData.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    // Don't set Content-Type header - let the browser set it automatically
    const response = await api.post('/artworks', formData);
    return response.data;
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
    return response.data;
  },
};
import api from './api';
import { ArtistAnalytics } from '../types';

export const analyticsService = {
  // Get artist analytics overview
  getArtistAnalytics: async () => {
    const response = await api.get('/analytics/artist');
    return response.data;
  },

  // Get artwork analytics
  getArtworkAnalytics: async (artworkId: string) => {
    const response = await api.get(`/analytics/artwork/${artworkId}`);
    return response.data;
  },

  // Get exhibition analytics
  getExhibitionAnalytics: async (exhibitionId: string, type: 'virtual' | 'regular' = 'virtual') => {
    const response = await api.get(`/analytics/exhibition/${exhibitionId}`, {
      params: { type }
    });
    return response.data;
  },

  // Get follower analytics
  getFollowerAnalytics: async (params?: {
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/analytics/followers', { params });
    return response.data;
  },

  // Get sales analytics
  getSalesAnalytics: async (params?: {
    period?: number;
  }) => {
    const response = await api.get('/analytics/sales', { params });
    return response.data;
  },
}; 
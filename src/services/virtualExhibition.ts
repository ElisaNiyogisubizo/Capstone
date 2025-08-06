import api from './api';
import { VirtualExhibition } from '../types';

export const virtualExhibitionService = {
  // Get all virtual exhibitions
  getVirtualExhibitions: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    organizer?: string;
    theme?: string;
    isFree?: boolean;
    search?: string;
  }) => {
    const response = await api.get('/virtual-exhibitions', { params });
    return response.data;
  },

  // Get virtual exhibition by ID
  getVirtualExhibition: async (id: string) => {
    const response = await api.get(`/virtual-exhibitions/${id}`);
    return response.data;
  },

  // Create virtual exhibition
  createVirtualExhibition: async (data: {
    title: string;
    description: string;
    theme: string;
    artistNotes?: string;
    startDate: string;
    endDate: string;
    isFree: boolean;
    price?: number;
    tags?: string[];
    coverImage: string;
    additionalImages?: string[];
    settings?: {
      allowComments: boolean;
      allowSharing: boolean;
      requireRegistration: boolean;
      maxAttendees?: number;
    };
  }) => {
    const response = await api.post('/virtual-exhibitions', data);
    return response.data;
  },

  // Update virtual exhibition
  updateVirtualExhibition: async (id: string, data: Partial<VirtualExhibition>) => {
    const response = await api.put(`/virtual-exhibitions/${id}`, data);
    return response.data;
  },

  // Delete virtual exhibition
  deleteVirtualExhibition: async (id: string) => {
    const response = await api.delete(`/virtual-exhibitions/${id}`);
    return response.data;
  },

  // Join virtual exhibition
  joinVirtualExhibition: async (id: string) => {
    const response = await api.post(`/virtual-exhibitions/${id}/join`);
    return response.data;
  },

  // Get virtual exhibition analytics
  getVirtualExhibitionAnalytics: async (id: string) => {
    const response = await api.get(`/virtual-exhibitions/${id}/analytics`);
    return response.data;
  },
}; 
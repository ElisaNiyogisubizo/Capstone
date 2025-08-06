import api from './api';
import { Exhibition } from '../types';

export const exhibitionService = {
  async getExhibitions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    upcoming?: boolean;
    organizer?: string;
  }): Promise<{ exhibitions: Exhibition[]; total: number; pages: number }> {
    const response = await api.get('/exhibitions', { params });
    return response.data;
  },

  async getExhibitionById(id: string): Promise<Exhibition> {
    const response = await api.get(`/exhibitions/${id}`);
    return response.data.exhibition;
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
    price?: number;
    isFree?: boolean;
    tags?: string[];
    additionalImages?: string[];
    organizer?: string;
    status?: string;
  }): Promise<Exhibition> {
    console.log('🔗 Exhibition service - createExhibition called');
    console.log('🔗 Data being sent:', exhibitionData);
    console.log('🔗 Token in localStorage:', !!localStorage.getItem('token'));
    
    try {
      const response = await api.post('/exhibitions', exhibitionData);
      console.log('✅ Exhibition service - API call successful');
      console.log('✅ Response:', response.data);
      return response.data.exhibition;
    } catch (error) {
      console.error('❌ Exhibition service - API call failed');
      console.error('❌ Error:', error);
      throw error;
    }
  },

  async registerForExhibition(exhibitionId: string): Promise<{ success: boolean; message: string; registered: boolean }> {
    const response = await api.post(`/exhibitions/${exhibitionId}/register`);
    return response.data;
  },
}; 
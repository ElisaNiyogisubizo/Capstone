import api from './api';
import { User } from '../types';

export const followService = {
  // Follow a user
  followUser: async (userId: string) => {
    const response = await api.post(`/follows/${userId}`);
    return response.data;
  },

  // Unfollow a user
  unfollowUser: async (userId: string) => {
    const response = await api.delete(`/follows/${userId}`);
    return response.data;
  },

  // Check if following a user
  checkFollowStatus: async (userId: string) => {
    const response = await api.get(`/follows/${userId}/status`);
    return response.data;
  },

  // Get user's followers
  getUserFollowers: async (userId: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get(`/follows/${userId}/followers`, { params });
    return response.data;
  },

  // Get users that a user is following
  getUserFollowing: async (userId: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get(`/follows/${userId}/following`, { params });
    return response.data;
  },

  // Get suggested users to follow
  getSuggestedUsers: async (params?: {
    limit?: number;
  }) => {
    const response = await api.get('/follows/suggested', { params });
    return response.data;
  },
}; 
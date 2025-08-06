import api from './api';
import { Comment } from '../types';

export const commentService = {
  // Get comments for artwork
  getArtworkComments: async (artworkId: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get(`/comments/artwork/${artworkId}`, { params });
    return response.data;
  },

  // Create comment
  createComment: async (artworkId: string, data: {
    content: string;
    parentCommentId?: string;
  }) => {
    const response = await api.post(`/comments/artwork/${artworkId}`, data);
    return response.data;
  },

  // Update comment
  updateComment: async (id: string, data: { content: string }) => {
    const response = await api.put(`/comments/${id}`, data);
    return response.data;
  },

  // Delete comment
  deleteComment: async (id: string) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },

  // Like/unlike comment
  toggleCommentLike: async (id: string) => {
    const response = await api.post(`/comments/${id}/like`);
    return response.data;
  },

  // Get comment replies
  getCommentReplies: async (id: string, params?: {
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get(`/comments/${id}/replies`, { params });
    return response.data;
  },
}; 
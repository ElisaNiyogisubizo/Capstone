import api from './api';
import { Message } from '../types';

export interface Conversation {
  _id: string;
  otherUser: {
    _id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  lastMessage: {
    _id: string;
    content: string;
    sender: string;
    receiver: string;
    createdAt: string;
  };
  unreadCount: number;
  artwork?: {
    _id: string;
    title: string;
    images: string[];
  };
  lastMessageAt: string;
}

export interface SendMessageData {
  receiverId: string;
  content: string;
  artworkId?: string;
}

export const messageService = {
  // Get all conversations for the current user
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get('/messages/conversations');
    return response.data.conversations;
  },

  // Get messages for a specific conversation
  async getMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<Message[]> {
    const response = await api.get(`/messages/conversation/${conversationId}`, {
      params: { page, limit }
    });
    return response.data.messages;
  },

  // Send a message
  async sendMessage(messageData: SendMessageData): Promise<Message> {
    const response = await api.post('/messages', messageData);
    return response.data.data;
  },

  // Mark conversation as read
  async markConversationAsRead(conversationId: string): Promise<void> {
    await api.patch(`/messages/conversation/${conversationId}/read`);
  },

  // Get unread message count
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/messages/unread-count');
    return response.data.unreadCount;
  },
}; 
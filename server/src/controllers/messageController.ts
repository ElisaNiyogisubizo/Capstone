import { Request, Response } from 'express';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import User from '../models/User';
import Artwork from '../models/Artwork';

// Get conversations for current user
export const getConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const userId = req.user._id;

    // Find conversations where user is a participant
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'name avatar role')
      .populate('lastMessage')
      .populate('artwork', 'title images')
      .sort({ lastMessageAt: -1 })
      .lean();

    // Transform conversations to include other user info
    const transformedConversations = conversations.map(conv => {
      const otherUser = conv.participants.find(
        (participant: any) => participant._id.toString() !== userId.toString()
      );
      
      return {
        _id: conv._id,
        otherUser,
        lastMessage: conv.lastMessage,
        unreadCount: (conv.unreadCount as any)?.get?.(userId.toString()) || 0,
        artwork: conv.artwork,
        lastMessageAt: conv.lastMessageAt,
      };
    });

    res.json({
      success: true,
      conversations: transformedConversations,
    });
  } catch (error: any) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get messages for a specific conversation
export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const currentUserId = req.user._id;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(currentUserId)) {
      res.status(403).json({
        success: false,
        message: 'Access denied to this conversation',
      });
      return;
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: currentUserId,
        read: false,
      },
      { 
        read: true,
        readAt: new Date()
      }
    );

    // Update unread count
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { [`unreadCount.${currentUserId}`]: 0 }
    });

    res.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
    });
  } catch (error: any) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Send a message
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { receiverId, content, artworkId } = req.body;
    const senderId = req.user._id;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      res.status(404).json({
        success: false,
        message: 'Receiver not found',
      });
      return;
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
        unreadCount: {},
        artwork: artworkId || undefined,
      });
      await conversation.save();
    }

    // Create message
    const message = new Message({
      conversation: conversation._id,
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
    });

    await message.save();

    // Update conversation
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
      $inc: { [`unreadCount.${receiverId}`]: 1 }
    });

    // Populate message with user info
    await message.populate([
      { path: 'sender', select: 'name avatar' },
      { path: 'receiver', select: 'name avatar' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error: any) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Mark conversation as read
export const markConversationAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      res.status(403).json({
        success: false,
        message: 'Access denied to this conversation',
      });
      return;
    }

    // Mark all messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: userId,
        read: false,
      },
      { 
        read: true,
        readAt: new Date()
      }
    );

    // Update unread count
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { [`unreadCount.${userId}`]: 0 }
    });

    res.json({
      success: true,
      message: 'Conversation marked as read',
    });
  } catch (error: any) {
    console.error('Mark conversation as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark conversation as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get unread message count for user
export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    });

    const totalUnread = conversations.reduce((total, conv) => {
      return total + ((conv.unreadCount as any)?.get?.(userId.toString()) || 0);
    }, 0);

    res.json({
      success: true,
      unreadCount: totalUnread,
    });
  } catch (error: any) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}; 
import React, { useState, useEffect } from 'react';
import { Send, Search, MoreVertical, User, Clock } from 'lucide-react';
import { Message } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { messageService, Conversation } from '../services/message';
import Avatar from '../components/Avatar';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Handle URL parameters for auto-selecting conversation
  useEffect(() => {
    if (conversations.length > 0) {
      const params = new URLSearchParams(location.search);
      const artistId = params.get('artist');
      
      if (artistId) {
        const conversation = conversations.find(conv => conv.otherUser._id === artistId);
        if (conversation) {
          setSelectedConversation(conversation);
          fetchMessages(conversation._id);
        }
      }
    }
  }, [conversations, location.search]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const conversationsData = await messageService.getConversations();
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      setMessagesLoading(true);
      const messagesData = await messageService.getMessages(conversationId);
      setMessages(messagesData);
      
      // Mark conversation as read
      await messageService.markConversationAsRead(conversationId);
      
      // Update conversation unread count
      setConversations(prev => 
        prev.map(conv => 
          conv._id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      setSendingMessage(true);
      const messageData = {
        receiverId: selectedConversation.otherUser._id,
        content: newMessage.trim(),
      };

      const newMsg = await messageService.sendMessage(messageData);
      
      // Add the new message to the current conversation
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');

      // Update the last message in conversations
      setConversations(prev => 
        prev.map(conv => 
          conv._id === selectedConversation._id 
            ? {
                ...conv,
                lastMessage: {
                  _id: newMsg._id,
                  content: newMsg.content,
                  sender: newMsg.sender,
                  receiver: newMsg.receiver,
                  createdAt: newMsg.createdAt,
                },
                unreadCount: 0,
              }
            : conv
        )
      );

      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation._id);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Please Log In</h2>
          <p className="text-gray-600">You need to be logged in to view messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl lg:text-4xl text-gray-900 mb-4">
            Messages
          </h1>
          <p className="text-lg text-gray-600">
            Connect with artists and discuss artwork details
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px]">
            {/* Conversations List */}
            <div className="border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="overflow-y-auto h-[calc(600px-80px)]">
                {loading ? (
                  <div className="p-4 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                    <p className="text-gray-600">Start browsing artworks to connect with artists</p>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation._id}
                      onClick={() => handleConversationSelect(conversation)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?._id === conversation._id ? 'bg-primary/5 border-primary/20' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <Avatar
                            src={conversation.otherUser.avatar}
                            alt={conversation.otherUser.name}
                            size="md"
                          />
                          {conversation.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 truncate">
                              {conversation.otherUser.name}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.lastMessage.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {conversation.lastMessage.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="lg:col-span-2 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Conversation Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar
                          src={selectedConversation.otherUser.avatar}
                          alt={selectedConversation.otherUser.name}
                          size="md"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {selectedConversation.otherUser.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {selectedConversation.otherUser.role === 'artist' ? 'Artist' : 'Community Member'}
                          </p>
                        </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                          <p className="text-gray-600">Start the conversation!</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${message.sender === user._id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender === user._id
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center mt-1 text-xs ${
                              message.sender === user._id ? 'text-primary-100' : 'text-gray-500'
                            }`}>
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTime(message.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !sendingMessage && handleSendMessage()}
                        placeholder="Type your message..."
                        disabled={sendingMessage}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {sendingMessage ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages; 
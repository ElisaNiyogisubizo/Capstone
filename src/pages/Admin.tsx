import React, { useState, useEffect } from 'react';
import { Users, Palette, Shield, BarChart3, Settings, Eye, Edit, Trash2, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { User, Artwork } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/user';
import { artworkService } from '../services/artwork';
import { messageService } from '../services/message';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.role !== 'admin') {
      // Redirect non-admin users
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch users, artworks, and conversations
      const [usersResponse, artworksResponse, conversationsData, unreadCountData] = await Promise.all([
        userService.getUsers(),
        artworkService.getArtworks(),
        messageService.getConversations(),
        messageService.getUnreadCount()
      ]);
      
      setUsers(usersResponse.users);
      setArtworks(artworksResponse.artworks);
      setConversations(conversationsData);
      setUnreadCount(unreadCountData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Users', value: '1,234', icon: Users, color: 'text-blue-600' },
    { label: 'Total Artworks', value: '567', icon: Palette, color: 'text-green-600' },
    { label: 'Active Artists', value: '89', icon: Shield, color: 'text-purple-600' },
    { label: 'Monthly Sales', value: '$12,345', icon: BarChart3, color: 'text-orange-600' },
  ];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'artworks', label: 'Artworks', icon: Palette },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl lg:text-4xl text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage users, artworks, and platform settings
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-gray-100 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">New user registration: John Doe</span>
                        <span className="text-xs text-gray-400">2 hours ago</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">New artwork uploaded: Abstract Harmony</span>
                        <span className="text-xs text-gray-400">4 hours ago</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Artwork sold: Digital Dreams</span>
                        <span className="text-xs text-gray-400">1 day ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Shield className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium">Verify Artist</span>
                        </div>
                      </button>
                      <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Palette className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium">Review Artwork</span>
                        </div>
                      </button>
                      <button className="w-full text-left p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Users className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-medium">Manage Users</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    Add User
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.role === 'artist' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="flex items-center text-sm text-gray-900">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'artworks' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Artwork Management</h3>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    Review All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Artwork
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Artist
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {artworks.map((artwork) => (
                        <tr key={artwork._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={artwork.images[0]}
                                alt={artwork.title}
                                className="w-10 h-10 rounded object-cover"
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{artwork.title}</div>
                                <div className="text-sm text-gray-500">{artwork.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{artwork.artist?.name || 'Unknown Artist'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">${artwork.price}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              artwork.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {artwork.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
                  <span className="px-3 py-1 bg-primary text-white rounded-full text-xs font-medium">
                    {unreadCount} Unread
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Conversation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Message
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unread
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {conversations.map((conversation) => (
                        <tr key={conversation._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img
                                src={conversation.users[0].avatar}
                                alt={conversation.users[0].name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {conversation.users.map((user: any) => user.name).join(', ')}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {conversation.lastMessage?.text || 'No messages yet'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {conversation.lastMessage?.sender?.name || 'System'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              conversation.unreadCount > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {conversation.unreadCount}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link to={`/admin/messages/${conversation._id}`}>
                              <button className="text-blue-600 hover:text-blue-900">
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        defaultValue="The Sundays Art Hub"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        defaultValue="admin@thesundaysarthub.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Commission Rate (%)
                      </label>
                      <input
                        type="number"
                        defaultValue="10"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin; 
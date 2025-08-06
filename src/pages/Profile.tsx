import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Edit, 
  Settings, 
  Plus, 
  Heart, 
  Eye, 
  MessageCircle, 
  MapPin, 
  Star, 
  Calendar,
  Trash2,
  Camera
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { artworkService } from '../services/artwork';
import { userService } from '../services/user';
import { Artwork, User } from '../types';
import Avatar from '../components/Avatar';
import { defaultImages } from '../utils/images';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<User | null>(null);
  const [userArtworks, setUserArtworks] = useState<Artwork[]>([]);
  const [likedArtworks, setLikedArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    avatar: '',
    coverImage: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch user profile
      const profileResponse = await userService.getUserProfile(user._id);
      setProfileData(profileResponse);
      setEditForm({
        name: profileResponse.name || '',
        email: profileResponse.email || '',
        bio: profileResponse.bio || '',
        location: profileResponse.location || '',
        avatar: profileResponse.avatar || '',
        coverImage: profileResponse.coverImage || ''
      });

      // Fetch user's artworks
      const artworksResponse = await artworkService.getArtworks({ artist: user._id });
      setUserArtworks(artworksResponse.artworks || []);

      // Fetch liked artworks
      const likedResponse = await artworkService.getLikedArtworks();
      setLikedArtworks(likedResponse.artworks || []);

    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditForm({
      name: profileData?.name || '',
      email: profileData?.email || '',
      bio: profileData?.bio || '',
      location: profileData?.location || '',
      avatar: profileData?.avatar || '',
      coverImage: profileData?.coverImage || ''
    });
  };

  const handleSave = async () => {
    try {
      const updatedProfile = await userService.updateProfile(editForm);
      setProfileData(updatedProfile);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handleDeleteArtwork = async (artworkId: string) => {
    if (!confirm('Are you sure you want to delete this artwork?')) return;

    try {
      await artworkService.deleteArtwork(artworkId);
      setUserArtworks(prev => prev.filter(artwork => artwork._id !== artworkId));
      toast.success('Artwork deleted successfully');
    } catch (error) {
      console.error('Error deleting artwork:', error);
      toast.error('Failed to delete artwork');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Please Log In</h2>
          <Link to="/login" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${profileData?.coverImage || defaultImages.cover})`,
            backgroundBlendMode: 'overlay'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        {editing && (
          <div className="absolute top-4 right-4">
            <button className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors">
              <Camera className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-8">
          <div className="relative">
            <Avatar 
              src={profileData?.avatar || defaultImages.avatar} 
              alt={profileData?.name || 'User'} 
              size="xl" 
            />
            {editing && (
              <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profileData?.name || 'User'}
                </h1>
                <div className="flex items-center space-x-4 text-gray-600 mb-4">
                  {profileData?.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{profileData.location}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Joined {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'Recently'}</span>
                  </div>
                </div>
                {profileData?.bio && (
                  <p className="text-gray-700 mb-4">{profileData.bio}</p>
                )}
              </div>

              <div className="flex space-x-2">
                {editing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </button>
                    <Link
                      to="/settings"
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{userArtworks.length}</div>
            <div className="text-gray-600">Artworks</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{likedArtworks.length}</div>
            <div className="text-gray-600">Liked</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{profileData?.totalSales || 0}</div>
            <div className="text-gray-600">Sales</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-primary">{profileData?.rating ? profileData.rating.toFixed(1) : '0.0'}</div>
            <div className="text-gray-600">Rating</div>
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="bg-white rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button className="py-4 px-1 border-b-2 border-primary text-primary font-medium">
                My Artworks
              </button>
              <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium">
                Liked Artworks
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* My Artworks */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">My Artworks</h3>
                {user.role === 'artist' && (
                  <Link
                    to="/artist/dashboard"
                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Artwork
                  </Link>
                )}
              </div>

              {userArtworks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userArtworks.map((artwork) => (
                    <div key={artwork._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="relative aspect-[4/3]">
                        <img
                          src={artwork.images[0] || defaultImages.artwork}
                          alt={artwork.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            artwork.status === 'available' 
                              ? 'bg-green-100 text-green-800' 
                              : artwork.status === 'sold'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {artwork.status.charAt(0).toUpperCase() + artwork.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{artwork.title}</h4>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{artwork.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">${artwork.price.toLocaleString()}</span>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <Eye className="w-4 h-4 mr-1" />
                              <span>{artwork.views}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Heart className="w-4 h-4 mr-1" />
                              <span>{artwork.likes?.length || 0}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteArtwork(artwork._id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No artworks yet</h3>
                  <p className="text-gray-500 mb-4">Start creating and uploading your artwork</p>
                  {user.role === 'artist' && (
                    <Link
                      to="/artist/dashboard"
                      className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Artwork
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
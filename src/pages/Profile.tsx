import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Camera, 
  Save, 
  X, 
  Eye, 
  Heart, 
  TrendingUp, 
  Award, 
  Users, 
  Globe, 
  Instagram, 
  Twitter, 
  Facebook,
  Linkedin,
  ExternalLink,
  Settings,
  Lock,
  Bell,
  Palette,
  Star,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Artwork } from '../types';
import { artworkService } from '../services/artwork';

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  website: string;
  avatar: string;
  coverImage: string;
  dateJoined: string;
  specialties: string[];
  socialLinks: {
    instagram: string;
    twitter: string;
    facebook: string;
    linkedin: string;
  };
  preferences: {
    emailNotifications: boolean;
    publicProfile: boolean;
    showContactInfo: boolean;
  };
}

interface ProfileStats {
  totalArtworks: number;
  totalViews: number;
  totalLikes: number;
  followers: number;
  totalSales: number;
  rating: number;
  reviews: number;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'artworks' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    _id: '',
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    avatar: '',
    coverImage: '',
    dateJoined: '',
    specialties: [],
    socialLinks: {
      instagram: '',
      twitter: '',
      facebook: '',
      linkedin: ''
    },
    preferences: {
      emailNotifications: true,
      publicProfile: true,
      showContactInfo: false
    }
  });

  const [stats, setStats] = useState<ProfileStats>({
    totalArtworks: 0,
    totalViews: 0,
    totalLikes: 0,
    followers: 0,
    totalSales: 0,
    rating: 0,
    reviews: 0
  });

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const availableSpecialties = [
    'Oil Painting', 'Watercolor', 'Acrylic', 'Digital Art', 'Photography',
    'Sculpture', 'Mixed Media', 'Abstract', 'Portrait', 'Landscape',
    'Still Life', 'Street Art', 'Illustration', 'Printmaking', 'Ceramics'
  ];

  useEffect(() => {
    loadProfileData();
    loadArtworks();
  }, []);

  const loadProfileData = async () => {
    try {
      // Simulate API call - replace with actual service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API call
      setProfileData({
        _id: user?._id || '',
        name: user?.name || '',
        email: user?.email || '',
        phone: '+1 (555) 123-4567',
        bio: 'Passionate artist exploring the intersection of traditional and digital mediums. My work focuses on capturing emotions through vibrant colors and dynamic compositions.',
        location: 'New York, NY',
        website: 'https://myartportfolio.com',
        avatar: user?.avatar || '',
        coverImage: 'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg',
        dateJoined: '2023-01-15',
        specialties: ['Oil Painting', 'Digital Art', 'Portrait'],
        socialLinks: {
          instagram: '@artist_username',
          twitter: '@artist_username',
          facebook: 'artist.page',
          linkedin: 'artist-name'
        },
        preferences: {
          emailNotifications: true,
          publicProfile: true,
          showContactInfo: false
        }
      });

      setStats({
        totalArtworks: 24,
        totalViews: 15420,
        totalLikes: 892,
        followers: 156,
        totalSales: 8,
        rating: 4.8,
        reviews: 23
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadArtworks = async () => {
    try {
      const response = await artworkService.getArtworks({ artist: user?._id, limit: 6 });
      setArtworks(response.artworks);
    } catch (error) {
      console.error('Error loading artworks:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call - replace with actual service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user context if needed
      if (updateUser) {
        updateUser({
          ...user,
          name: profileData.name,
          email: profileData.email,
          avatar: profileData.avatar
        });
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (type: 'avatar' | 'cover') => {
    const input = type === 'avatar' ? avatarInputRef.current : coverInputRef.current;
    input?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfileData(prev => ({
        ...prev,
        [type === 'avatar' ? 'avatar' : 'coverImage']: url
      }));
    }
  };

  const addSpecialty = () => {
    if (newSpecialty && !profileData.specialties.includes(newSpecialty)) {
      setProfileData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setProfileData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  const StatCard = ({ icon: Icon, label, value, color }: { 
    icon: any, 
    label: string, 
    value: string | number, 
    color: string 
  }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="relative h-64 bg-gradient-to-r from-purple-500 to-pink-500">
        <img
          src={profileData.coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        {isEditing && (
          <button
            onClick={() => handleImageUpload('cover')}
            className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-opacity"
          >
            <Camera className="w-5 h-5" />
          </button>
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleImageChange(e, 'cover')}
          className="hidden"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={profileData.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'}
                  alt={profileData.name}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                />
                {isEditing && (
                  <button
                    onClick={() => handleImageUpload('avatar')}
                    className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, 'avatar')}
                  className="hidden"
                />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                <p className="text-gray-600 flex items-center mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {profileData.location}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Member since {new Date(profileData.dateJoined).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'artworks', label: 'Artworks', icon: Palette },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <StatCard icon={Palette} label="Artworks" value={stats.totalArtworks} color="bg-blue-500" />
              <StatCard icon={Eye} label="Views" value={stats.totalViews.toLocaleString()} color="bg-green-500" />
              <StatCard icon={Heart} label="Likes" value={stats.totalLikes} color="bg-red-500" />
              <StatCard icon={Users} label="Followers" value={stats.followers} color="bg-purple-500" />
              <StatCard icon={TrendingUp} label="Sales" value={stats.totalSales} color="bg-yellow-500" />
              <StatCard icon={Star} label="Rating" value={stats.rating} color="bg-orange-500" />
              <StatCard icon={MessageCircle} label="Reviews" value={stats.reviews} color="bg-indigo-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* About Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                  {isEditing ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Tell us about yourself and your art..."
                    />
                  ) : (
                    <p className="text-gray-600">{profileData.bio}</p>
                  )}
                </div>

                {/* Specialties */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Specialties</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profileData.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                      >
                        {specialty}
                        {isEditing && (
                          <button
                            onClick={() => removeSpecialty(specialty)}
                            className="ml-2 text-primary hover:text-primary/70"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  
                  {isEditing && (
                    <div className="flex gap-2">
                      <select
                        value={newSpecialty}
                        onChange={(e) => setNewSpecialty(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select a specialty</option>
                        {availableSpecialties.filter(s => !profileData.specialties.includes(s)).map(specialty => (
                          <option key={specialty} value={specialty}>{specialty}</option>
                        ))}
                      </select>
                      <button
                        onClick={addSpecialty}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>

                {/* Recent Artworks */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Artworks</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {artworks.slice(0, 6).map((artwork) => (
                      <div key={artwork._id} className="group cursor-pointer">
                        <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={artwork.images[0] || 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg'}
                            alt={artwork.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <p className="mt-2 text-sm font-medium text-gray-900 truncate">{artwork.title}</p>
                        <p className="text-sm text-primary font-semibold">${artwork.price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Info & Social Links */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-3" />
                      {isEditing ? (
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                        />
                      ) : (
                        <span>{profileData.email}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-3" />
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                        />
                      ) : (
                        <span>{profileData.phone}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Globe className="w-4 h-4 mr-3" />
                      {isEditing ? (
                        <input
                          type="url"
                          value={profileData.website}
                          onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                          placeholder="https://your-website.com"
                        />
                      ) : (
                        <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                          {profileData.website}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
                  <div className="space-y-3">
                    {[
                      { platform: 'instagram', icon: Instagram, color: 'text-pink-500' },
                      { platform: 'twitter', icon: Twitter, color: 'text-blue-400' },
                      { platform: 'facebook', icon: Facebook, color: 'text-blue-600' },
                      { platform: 'linkedin', icon: Linkedin, color: 'text-blue-700' }
                    ].map(({ platform, icon: Icon, color }) => (
                      <div key={platform} className="flex items-center">
                        <Icon className={`w-4 h-4 mr-3 ${color}`} />
                        {isEditing ? (
                          <input
                            type="text"
                            value={profileData.socialLinks[platform as keyof typeof profileData.socialLinks]}
                            onChange={(e) => setProfileData(prev => ({
                              ...prev,
                              socialLinks: {
                                ...prev.socialLinks,
                                [platform]: e.target.value
                              }
                            }))}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                            placeholder={`@username`}
                          />
                        ) : (
                          <span className="text-gray-600">
                            {profileData.socialLinks[platform as keyof typeof profileData.socialLinks] || 'Not connected'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'artworks' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">My Artworks</h3>
              <button className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                <Palette className="w-4 h-4 mr-2" />
                Add New Artwork
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {artworks.map((artwork) => (
                <div key={artwork._id} className="group cursor-pointer">
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-3">
                    <img
                      src={artwork.images[0] || 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg'}
                      alt={artwork.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <h4 className="font-medium text-gray-900 truncate">{artwork.title}</h4>
                  <p className="text-sm text-gray-600 truncate">{artwork.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-primary font-semibold">${artwork.price.toLocaleString()}</span>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {artwork.views}
                      </span>
                      <span className="flex items-center">
                        <Heart className="w-3 h-3 mr-1" />
                        {artwork.likes.length}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Public Profile</h4>
                    <p className="text-sm text-gray-600">Make your profile visible to everyone</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileData.preferences.publicProfile}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          publicProfile: e.target.checked
                        }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Show Contact Info</h4>
                    <p className="text-sm text-gray-600">Display your contact information publicly</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileData.preferences.showContactInfo}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          showContactInfo: e.target.checked
                        }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive email updates about your artworks</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileData.preferences.emailNotifications}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          emailNotifications: e.target.checked
                        }
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20
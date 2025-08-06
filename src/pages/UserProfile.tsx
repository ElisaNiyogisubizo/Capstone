import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Edit, Save, X } from 'lucide-react';
import { userService } from '../services/user';
import Avatar from '../components/Avatar';
import toast from 'react-hot-toast';

const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      const updatedUser = await userService.updateProfile(formData);
      updateUser(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Please login</h2>
          <p className="text-gray-600">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <Avatar
                src={user.avatar}
                alt={user.name}
                size="xl"
                className="w-32 h-32 border-4 border-white shadow-lg mx-auto mb-4"
              />
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              {user.role === 'artist' && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Artist
                  </span>
                  {user.verified && (
                    <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium ml-2">
                      Verified
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{user.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="City, State"
                  />
                ) : (
                  <p className="text-gray-900">{user.location || 'Not specified'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-900">{user.bio || 'No bio added yet.'}</p>
                )}
              </div>

              {user.role === 'artist' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Artist Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{user.totalSales}</div>
                      <div className="text-sm text-gray-600">Total Sales</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{user.rating.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Rating</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{user.totalRatings}</div>
                      <div className="text-sm text-gray-600">Reviews</div>
                    </div>
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

export default UserProfile; 
import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { followService } from '../services/follow';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface FollowButtonProps {
  userId: string;
  userName: string;
  className?: string;
  variant?: 'default' | 'icon' | 'text';
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  userName,
  className = '',
  variant = 'default'
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user._id !== userId) {
      checkFollowStatus();
    }
  }, [user, userId]);

  const checkFollowStatus = async () => {
    try {
      const response = await followService.checkFollowStatus(userId);
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      toast.error('Please login to follow users');
      return;
    }

    if (user._id === userId) {
      toast.error('You cannot follow yourself');
      return;
    }

    try {
      setLoading(true);
      if (isFollowing) {
        await followService.unfollowUser(userId);
        setIsFollowing(false);
        toast.success(`Unfollowed ${userName}`);
      } else {
        await followService.followUser(userId);
        setIsFollowing(true);
        toast.success(`Following ${userName}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user._id === userId) return null;

  if (variant === 'icon') {
    return (
      <button
        onClick={handleFollowToggle}
        disabled={loading}
        className={`p-2 rounded-full transition-colors ${
          isFollowing
            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        } ${className}`}
        title={isFollowing ? 'Unfollow' : 'Follow'}
      >
        {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleFollowToggle}
        disabled={loading}
        className={`font-medium transition-colors ${
          isFollowing
            ? 'text-gray-600 hover:text-gray-800'
            : 'text-blue-600 hover:text-blue-700'
        } ${className}`}
      >
        {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
      </button>
    );
  }

  return (
    <button
      onClick={handleFollowToggle}
      disabled={loading}
      className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        isFollowing
          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } ${className}`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isFollowing ? (
        <UserCheck className="w-4 h-4" />
      ) : (
        <UserPlus className="w-4 h-4" />
      )}
      <span>{loading ? '...' : isFollowing ? 'Following' : 'Follow'}</span>
    </button>
  );
}; 
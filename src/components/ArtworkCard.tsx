import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, User } from 'lucide-react';
import { Artwork } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ArtworkCardProps {
  artwork: Artwork;
  onLike?: (id: string) => void;
}

const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork, onLike }) => {
  const { user } = useAuth();
  const isLiked = user && artwork.likes.includes(user._id);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLike && user) {
      onLike(artwork._id);
    }
  };

  return (
    <Link to={`/artwork/${artwork._id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={artwork.images[0] || 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg'}
            alt={artwork.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300">
            {/* Status Badge */}
            <div className="absolute top-3 left-3">
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

            {/* Actions */}
            <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {user && (
                <button
                  onClick={handleLike}
                  className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                    isLiked 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white/80 text-gray-700 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>

            {/* Views */}
            <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
              <Eye className="w-3 h-3" />
              <span>{artwork.views}</span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-display font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
            {artwork.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {artwork.description}
          </p>

          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold text-primary">
              ${artwork.price.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500 bg-secondary/30 px-2 py-1 rounded-full">
              {artwork.category}
            </span>
          </div>

          {/* Artist Info */}
          <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              {artwork.artist.avatar ? (
                <img 
                  src={artwork.artist.avatar} 
                  alt={artwork.artist.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {artwork.artist.name}
              </p>
              {artwork.artist.location && (
                <p className="text-xs text-gray-500 truncate">
                  {artwork.artist.location}
                </p>
              )}
            </div>
            {artwork.likes.length > 0 && (
              <div className="flex items-center space-x-1 text-gray-500">
                <Heart className="w-3 h-3" />
                <span className="text-xs">{artwork.likes.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArtworkCard;
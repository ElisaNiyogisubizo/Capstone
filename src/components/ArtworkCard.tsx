import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye, User, MessageCircle, ShoppingCart } from 'lucide-react';
import { Artwork } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Avatar from './Avatar';
import { AddToCartButton } from './AddToCartButton';
import { FollowButton } from './FollowButton';
import { defaultImages, getImageUrl } from '../utils/images';

interface ArtworkCardProps {
  artwork: Artwork;
  onLike?: (id: string) => void;
  onMessage?: (artworkId: string, artistId: string) => void;
}

const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork, onLike, onMessage }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isLiked = user && artwork.likes && artwork.likes.includes(user._id);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLike && user) {
      onLike(artwork._id);
    }
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMessage && user && artwork.artist && user._id !== artwork.artist._id) {
      onMessage(artwork._id, artwork.artist._id);
    }
  };

  const handleArtistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (artwork.artist) {
      navigate(`/artists/${artwork.artist._id}`);
    }
  };

  return (
    <Link to={`/artwork/${artwork._id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={getImageUrl(artwork.images[0])}
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
              {user && artwork.artist && user._id !== artwork.artist._id && artwork.status === 'available' && (
                <div onClick={(e) => e.preventDefault()}>
                  <AddToCartButton
                    artworkId={artwork._id}
                    artworkTitle={artwork.title}
                    price={artwork.price}
                    variant="icon"
                    className="p-2 rounded-full backdrop-blur-sm bg-white/80 text-gray-700 hover:bg-blue-500 hover:text-white transition-colors"
                  />
                </div>
              )}
              {user && artwork.artist && user._id !== artwork.artist._id && (
                <button
                  onClick={handleMessage}
                  className="p-2 rounded-full backdrop-blur-sm bg-white/80 text-gray-700 hover:bg-blue-500 hover:text-white transition-colors"
                  title="Send Message"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              )}
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
          {artwork.artist && (
            <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
              <button 
                onClick={handleArtistClick}
                className="flex items-center space-x-2 flex-1 min-w-0 hover:opacity-80 transition-opacity text-left hover:bg-gray-50 rounded-lg p-1 -m-1"
              >
                <Avatar src={artwork.artist.avatar} alt={artwork.artist.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {artwork.artist.name}
                  </p>
                  {artwork.artist.verified && (
                    <div className="flex items-center">
                      <span className="text-xs text-blue-600">✓ Verified</span>
                    </div>
                  )}
                </div>
              </button>
              
              {/* Follow Button */}
              <div onClick={(e) => e.preventDefault()}>
                <FollowButton
                  userId={artwork.artist._id}
                  userName={artwork.artist.name}
                  variant="icon"
                  className="p-1"
                />
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          {user && artwork.artist && user._id !== artwork.artist._id && artwork.status === 'available' && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <AddToCartButton
                artworkId={artwork._id}
                artworkTitle={artwork.title}
                price={artwork.price}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ArtworkCard;
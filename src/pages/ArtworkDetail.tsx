import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Eye, MessageCircle, MapPin, Star, Share2, Calendar, ShoppingCart } from 'lucide-react';
import { Artwork } from '../types';
import { artworkService } from '../services/artwork';
import { messageService } from '../services/message';
import { useAuth } from '../contexts/AuthContext';
import Avatar from '../components/Avatar';
import { CommentSection } from '../components/CommentSection';
import { AddToCartButton } from '../components/AddToCartButton';
import { FollowButton } from '../components/FollowButton';
import { defaultImages } from '../utils/images';
import toast from 'react-hot-toast';

const ArtworkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchArtwork();
    }
  }, [id]);

  const fetchArtwork = async () => {
    try {
      setLoading(true);
      console.log('Fetching artwork with ID:', id);
      const artworkData = await artworkService.getArtworkById(id!);
      console.log('Fetched artwork data:', artworkData);
      setArtwork(artworkData);
    } catch (error) {
      console.error('Error fetching artwork:', error);
      toast.error('Failed to load artwork details');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please log in to like artworks');
      navigate('/login');
      return;
    }

    if (!artwork) return;

    try {
      await artworkService.likeArtwork(artwork._id);
      setArtwork(prev => prev ? {
        ...prev,
        likes: (prev.likes || []).includes(user._id) 
          ? (prev.likes || []).filter(id => id !== user._id)
          : [...(prev.likes || []), user._id]
      } : null);
      toast.success((artwork.likes || []).includes(user._id) ? 'Removed from likes' : 'Added to likes');
    } catch (error) {
      console.error('Error liking artwork:', error);
      toast.error('Failed to update like');
    }
  };

  const handleSendMessage = async () => {
    if (!user) {
      toast.error('Please log in to send messages');
      navigate('/login');
      return;
    }

    if (!artwork) return;

    if (!artwork.artist) {
      toast.error('Artist information not available');
      return;
    }

    if (user._id === artwork.artist._id) {
      toast.error('You cannot message yourself');
      return;
    }

    // Navigate to messages page with the artist conversation and artwork context
    navigate(`/messages?artist=${artwork.artist._id}&artwork=${artwork._id}`);
    toast.success(`Ready to message ${artwork.artist.name} about "${artwork.title}"!`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: artwork?.title,
        text: `Check out this amazing artwork: ${artwork?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-200 aspect-square rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Artwork Not Found</h2>
          <Link to="/browse" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const isLiked = user && artwork.likes && artwork.likes.includes(user._id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/browse" className="inline-flex items-center text-gray-600 hover:text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-lg shadow-lg overflow-hidden">
              <img
                src={artwork.images && artwork.images.length > 0 
                  ? (artwork.images[currentImageIndex] || artwork.images[0])
                  : defaultImages.artwork
                }
                alt={artwork.title}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {artwork.images && artwork.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : artwork.images.length - 1)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => prev < artwork.images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    →
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {artwork.images && artwork.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {artwork.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${artwork.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Artwork Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{artwork.title}</h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <span className="text-2xl font-bold text-primary">${(artwork.price || 0).toLocaleString()}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  artwork.status === 'available' 
                    ? 'bg-green-100 text-green-800' 
                    : artwork.status === 'sold'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {(artwork.status || 'available').charAt(0).toUpperCase() + (artwork.status || 'available').slice(1)}
                </span>
              </div>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">{artwork.description}</p>

            {/* Artwork Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Category</h3>
                <p className="text-gray-600">{artwork.category || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Medium</h3>
                <p className="text-gray-600">{artwork.medium || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Dimensions</h3>
                <p className="text-gray-600">{artwork.dimensions || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Views</h3>
                <p className="text-gray-600">{artwork.views || 0}</p>
              </div>
            </div>

            {/* Tags */}
            {artwork.tags && artwork.tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {artwork.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-secondary text-primary text-sm font-medium rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Artist Info */}
            {artwork.artist && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar src={artwork.artist.avatar} alt={artwork.artist.name || 'Artist'} size="md" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{artwork.artist.name || 'Unknown Artist'}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{artwork.artist.location || 'Location not specified'}</span>
                      {artwork.artist.verified && (
                        <span className="text-blue-600">✓ Verified</span>
                      )}
                    </div>
                  </div>
                  {/* Follow Button */}
                  <FollowButton
                    userId={artwork.artist._id}
                    userName={artwork.artist.name}
                    variant="icon"
                  />
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span>
                      {artwork.artist.rating ? artwork.artist.rating.toFixed(1) : '0.0'} 
                      ({artwork.artist.totalRatings || 0} reviews)
                    </span>
                  </div>
                  <span>{artwork.artist.totalSales || 0} sales</span>
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/artists/${artwork.artist._id}`}
                    className="flex-1 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors text-center"
                  >
                    View Artist Profile
                  </Link>
                  
                  {user && user._id !== artwork.artist._id && (
                    <button
                      onClick={handleSendMessage}
                      disabled={sendingMessage}
                      className="px-4 py-2 bg-secondary text-primary font-medium rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {sendingMessage ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message Artist
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleLike}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                  isLiked
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </button>
              
              <button
                onClick={handleShare}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Add to Cart Button */}
            {user && artwork.artist && user._id !== artwork.artist._id && artwork.status === 'available' && (
              <div className="pt-4 border-t border-gray-200">
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

        {/* Comments Section */}
        <div className="mt-12">
          <CommentSection artworkId={artwork._id} />
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetail; 
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, Eye, MapPin, Star, Share2, MessageCircle, Heart } from 'lucide-react';
import { VirtualExhibition } from '../types';
import { virtualExhibitionService } from '../services/virtualExhibition';
import { useAuth } from '../contexts/AuthContext';
import Avatar from '../components/Avatar';
import { FollowButton } from '../components/FollowButton';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const VirtualExhibitionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exhibition, setExhibition] = useState<VirtualExhibition | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchExhibition();
    }
  }, [id]);

  const fetchExhibition = async () => {
    try {
      setLoading(true);
      const exhibitionData = await virtualExhibitionService.getVirtualExhibition(id!);
      setExhibition(exhibitionData.data);
    } catch (error) {
      console.error('Error fetching virtual exhibition:', error);
      toast.error('Failed to load virtual exhibition details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user) {
      toast.error('Please login to join virtual exhibitions');
      navigate('/login');
      return;
    }

    try {
      setJoining(true);
      await virtualExhibitionService.joinVirtualExhibition(id!);
      await fetchExhibition(); // Refresh to get updated attendee count
      toast.success('Successfully joined virtual exhibition!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to join exhibition');
    } finally {
      setJoining(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: exhibition?.title,
        text: `Check out this virtual exhibition: ${exhibition?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const isActive = exhibition && new Date() >= new Date(exhibition.startDate) && new Date() <= new Date(exhibition.endDate);
  const isUpcoming = exhibition && new Date() < new Date(exhibition.startDate);
  const isEnded = exhibition && new Date() > new Date(exhibition.endDate);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-200 aspect-video rounded-lg"></div>
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

  if (!exhibition) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Virtual Exhibition Not Found</h2>
          <Link to="/virtual-exhibitions" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Virtual Exhibitions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/virtual-exhibitions" className="inline-flex items-center text-gray-600 hover:text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Virtual Exhibitions
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-video bg-white rounded-lg shadow-lg overflow-hidden">
              <img
                src={exhibition.coverImage || '/placeholder-exhibition.jpg'}
                alt={exhibition.title}
                className="w-full h-full object-cover"
              />
              
              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  isActive 
                    ? 'bg-green-100 text-green-800' 
                    : isUpcoming
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {isActive ? 'Live Now' : isUpcoming ? 'Upcoming' : 'Ended'}
                </span>
              </div>

              {/* Price Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  exhibition.isFree 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {exhibition.isFree ? 'Free' : `$${exhibition.price}`}
                </span>
              </div>
            </div>

            {/* Additional Images */}
            {exhibition.additionalImages && exhibition.additionalImages.length > 0 && (
              <div className="flex space-x-2 overflow-x-auto">
                {exhibition.additionalImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${exhibition.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Exhibition Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{exhibition.title}</h1>
              <div className="flex items-center space-x-4 text-gray-600 mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{formatDistanceToNow(new Date(exhibition.startDate), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>Virtual</span>
                </div>
              </div>
            </div>

            <p className="text-gray-700 text-lg leading-relaxed">{exhibition.description}</p>

            {/* Theme */}
            {exhibition.theme && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Theme</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {exhibition.theme}
                </span>
              </div>
            )}

            {/* Artist Notes */}
            {exhibition.artistNotes && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Artist Notes</h3>
                <p className="text-gray-600 italic">{exhibition.artistNotes}</p>
              </div>
            )}

            {/* Exhibition Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Start Date</h3>
                <p className="text-gray-600">{new Date(exhibition.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">End Date</h3>
                <p className="text-gray-600">{new Date(exhibition.endDate).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Views</h3>
                <p className="text-gray-600">{exhibition.views || 0}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Attendees</h3>
                <p className="text-gray-600">{exhibition.attendeeCount || 0}</p>
              </div>
            </div>

            {/* Tags */}
            {exhibition.tags && exhibition.tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {exhibition.tags.map((tag, index) => (
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

            {/* Organizer Info */}
            {exhibition.organizer && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar src={exhibition.organizer.avatar} alt={exhibition.organizer.name} size="md" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{exhibition.organizer.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{exhibition.organizer.location || 'Location not specified'}</span>
                      {exhibition.organizer.verified && (
                        <span className="text-blue-600">✓ Verified</span>
                      )}
                    </div>
                  </div>
                  <FollowButton
                    userId={exhibition.organizer._id}
                    userName={exhibition.organizer.name}
                    variant="icon"
                  />
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span>
                      {exhibition.organizer.rating ? exhibition.organizer.rating.toFixed(1) : '0.0'} 
                      ({exhibition.organizer.totalRatings || 0} reviews)
                    </span>
                  </div>
                  <span>{exhibition.organizer.totalSales || 0} sales</span>
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/artists/${exhibition.organizer._id}`}
                    className="flex-1 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors text-center"
                  >
                    View Artist Profile
                  </Link>
                  
                  {user && user._id !== exhibition.organizer._id && (
                    <button
                      onClick={() => navigate(`/messages?artist=${exhibition.organizer._id}`)}
                      className="px-4 py-2 bg-secondary text-primary font-medium rounded-lg hover:bg-secondary/80 transition-colors flex items-center justify-center"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message Artist
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {isActive && (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {joining ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Users className="w-5 h-5 mr-2" />
                      Join Exhibition
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={handleShare}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Settings Info */}
            {exhibition.settings && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Exhibition Settings</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${exhibition.settings.allowComments ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span>Comments {exhibition.settings.allowComments ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${exhibition.settings.allowSharing ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span>Sharing {exhibition.settings.allowSharing ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${exhibition.settings.requireRegistration ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span>Registration {exhibition.settings.requireRegistration ? 'Required' : 'Optional'}</span>
                  </div>
                  {exhibition.settings.maxAttendees && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>Max {exhibition.settings.maxAttendees} attendees</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualExhibitionDetail; 
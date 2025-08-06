import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  Star,
  ArrowLeft,
  Heart,
  Share2,
  User,
  Image as ImageIcon,
  Tag,
  Award,
  Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { exhibitionService } from '../services/exhibition';
import { Exhibition } from '../types';
import Avatar from '../components/Avatar';
import toast from 'react-hot-toast';

const ExhibitionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (id) {
      fetchExhibitionDetails();
    }
  }, [id]);

  const fetchExhibitionDetails = async () => {
    try {
      setLoading(true);
      const exhibitionData = await exhibitionService.getExhibitionById(id!);
      setExhibition(exhibitionData);
      
      // Check if user is registered
      if (user && exhibitionData.registeredUsers) {
        setIsRegistered(exhibitionData.registeredUsers.some((u: any) => u._id === user._id));
      }
    } catch (error) {
      console.error('Error fetching exhibition details:', error);
      toast.error('Failed to load exhibition details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please log in to register for exhibitions');
      return;
    }

    setRegistering(true);
    try {
      const result = await exhibitionService.registerForExhibition(id!);
      setIsRegistered(result.registered);
      toast.success(result.message);
      fetchExhibitionDetails(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to register for exhibition');
    } finally {
      setRegistering(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exhibition details...</p>
        </div>
      </div>
    );
  }

  if (!exhibition) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Exhibition Not Found</h2>
          <p className="text-gray-600 mb-4">The exhibition you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/exhibitions')}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Exhibitions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(exhibition.status)}`}>
                  {exhibition.status.charAt(0).toUpperCase() + exhibition.status.slice(1)}
                </span>
                {exhibition.featured && (
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                    Featured
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{exhibition.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{exhibition.description}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Image */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src={exhibition.image}
                alt={exhibition.title}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Additional Images */}
            {exhibition.additionalImages && exhibition.additionalImages.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {exhibition.additionalImages.map((image, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-lg">
                      <img
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Artworks */}
            {exhibition.featuredArtworks && exhibition.featuredArtworks.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Artworks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exhibition.featuredArtworks.map((artwork: any) => (
                    <div key={artwork._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <img
                        src={artwork.images[0]}
                        alt={artwork.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-3">
                        <h4 className="font-medium text-gray-900">{artwork.title}</h4>
                        <p className="text-sm text-gray-600">by {artwork.artist?.name || 'Unknown Artist'}</p>
                        <p className="text-sm font-semibold text-primary">${artwork.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {exhibition.tags && exhibition.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {exhibition.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <p className="font-medium">{formatDate(exhibition.startDate)}</p>
                    <p className="text-sm">{formatTime(exhibition.startDate)} - {formatTime(exhibition.endDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                  <p>{exhibition.location}</p>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <p>{exhibition.registeredUsers?.length || 0} registered</p>
                    {exhibition.maxCapacity && (
                      <p className="text-sm text-gray-500">
                        {exhibition.maxCapacity - (exhibition.registeredUsers?.length || 0)} spots left
                      </p>
                    )}
                  </div>
                </div>
                
                {!exhibition.isFree && (
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-5 h-5 mr-3 text-gray-400" />
                    <p>${exhibition.price} entry fee</p>
                  </div>
                )}
                
                {exhibition.isFree && (
                  <div className="flex items-center text-green-600">
                    <Award className="w-5 h-5 mr-3" />
                    <p className="font-medium">Free Entry</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                {user ? (
                  <button
                    onClick={handleRegister}
                    disabled={registering || exhibition.status === 'completed'}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      isRegistered
                        ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                        : registering
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : exhibition.status === 'completed'
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary/90'
                    }`}
                  >
                    {registering ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Registering...
                      </div>
                    ) : isRegistered ? (
                      'Already Registered'
                    ) : exhibition.status === 'completed' ? (
                      'Event Completed'
                    ) : (
                      'Register for Exhibition'
                    )}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="block w-full py-3 px-4 bg-primary text-white rounded-lg font-medium text-center hover:bg-primary/90 transition-colors"
                  >
                    Login to Register
                  </Link>
                )}
              </div>
            </div>

            {/* Organizer Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizer</h3>
              <div className="flex items-center">
                <Avatar
                  src={exhibition.organizer.avatar}
                  alt={exhibition.organizer.name}
                  size="lg"
                  className="mr-4"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{exhibition.organizer.name}</h4>
                  <p className="text-sm text-gray-600">{exhibition.organizer.location}</p>
                  {exhibition.organizer.verified && (
                    <div className="flex items-center mt-1">
                      <Star className="w-3 h-3 text-yellow-500 mr-1" />
                      <span className="text-xs text-gray-500">Verified Artist</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Registered Users */}
            {exhibition.registeredUsers && exhibition.registeredUsers.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Registered Attendees</h3>
                <div className="space-y-3">
                  {exhibition.registeredUsers.slice(0, 5).map((attendee: any) => (
                    <div key={attendee._id} className="flex items-center">
                      <Avatar
                        src={attendee.avatar}
                        alt={attendee.name}
                        size="sm"
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-900">{attendee.name}</span>
                    </div>
                  ))}
                  {exhibition.registeredUsers.length > 5 && (
                    <p className="text-sm text-gray-500">
                      +{exhibition.registeredUsers.length - 5} more attendees
                    </p>
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

export default ExhibitionDetails; 
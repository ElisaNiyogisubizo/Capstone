import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Palette, Award, ArrowLeft, Grid, List, MessageCircle } from 'lucide-react';
import { Artist, Artwork } from '../types';
import { userService } from '../services/user';
import { artworkService } from '../services/artwork';
import { messageService } from '../services/message';
import { useAuth } from '../contexts/AuthContext';
import ArtworkCard from '../components/ArtworkCard';
import Avatar from '../components/Avatar';
import toast from 'react-hot-toast';

const ArtistProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (id) {
      fetchArtistData();
    }
  }, [id]);

  const fetchArtistData = async () => {
    try {
      setLoading(true);
      const [artistData, artworksData] = await Promise.all([
        userService.getArtistById(id!),
        artworkService.getArtworks({ artist: id, limit: 50 })
      ]);
      setArtist(artistData);
      setArtworks(artworksData.artworks);
    } catch (error) {
      console.error('Error fetching artist data:', error);
      toast.error('Failed to load artist profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user) {
      toast.error('Please log in to send messages');
      navigate('/login');
      return;
    }

    if (!artist) return;

    // Navigate to messages page with the artist conversation
    navigate(`/messages?artist=${artist._id}`);
    toast.success(`Ready to message ${artist.name}!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
              <div className="flex items-center mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full mr-6"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Artist Not Found</h2>
          <Link to="/artists" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Artists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/artists" className="inline-flex items-center text-gray-600 hover:text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Artists
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <Avatar
              src={artist.avatar}
              alt={artist.name}
              size="xl"
              className="w-32 h-32 border-4 border-white shadow-lg"
            />

            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{artist.name}</h1>
                {artist.verified && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    <Award className="w-4 h-4" />
                    Verified
                  </div>
                )}
              </div>

              {artist.location && (
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{artist.location}</span>
                </div>
              )}

              {artist.bio && (
                <p className="text-gray-700 mb-6">{artist.bio}</p>
              )}

              {/* Action Buttons */}
              {user && user._id !== artist._id && (
                <div className="mb-6">
                  <button
                    onClick={handleSendMessage}
                    className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Send Message
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{artworks.length}</div>
                  <div className="text-sm text-gray-600">Artworks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{artist.totalSales}</div>
                  <div className="text-sm text-gray-600">Sales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{artist.rating.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{artist.totalRatings}</div>
                  <div className="text-sm text-gray-600">Reviews</div>
                </div>
              </div>

              {artist.specializations && artist.specializations.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {artist.specializations.map((spec, index) => (
                      <span key={index} className="px-3 py-1 bg-secondary text-primary rounded-full text-sm">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Artworks by {artist.name}</h2>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${
                  viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${
                  viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {artworks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No artworks yet</h3>
              <p className="text-gray-600">This artist hasn't uploaded any artworks yet.</p>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            }`}>
              {artworks.map((artwork) => (
                <ArtworkCard key={artwork._id} artwork={artwork} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile; 
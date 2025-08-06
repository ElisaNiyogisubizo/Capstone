import React, { useState, useEffect } from 'react';
import { Search, Star, MapPin, Palette, Grid, List, Eye, MessageCircle } from 'lucide-react';
import { Artist } from '../types';
import { userService } from '../services/user';
import { messageService } from '../services/message';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import toast from 'react-hot-toast';

const Artists: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sendingMessage, setSendingMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {};
      
      if (searchTerm) params.search = searchTerm;
      if (selectedSpecialization) params.specialization = selectedSpecialization;
      
      const response = await userService.getArtists(params);
      setArtists(response.artists);
    } catch (error) {
      console.error('Error fetching artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (artistId: string, artistName: string) => {
    if (!user) {
      toast.error('Please log in to send messages');
      navigate('/login');
      return;
    }

    if (user._id === artistId) {
      toast.error('You cannot message yourself');
      return;
    }

    // Navigate to messages page with the artist conversation
    navigate(`/messages?artist=${artistId}`);
    toast.success(`Ready to message ${artistName}!`);
  };

  const specializations = ['Abstract', 'Contemporary', 'Digital Art', 'Illustration', 'Mixed Media', 'Sculpture', 'Installation', 'Photography', 'Painting'];

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = !selectedSpecialization || artist.specializations.includes(selectedSpecialization);
    return matchesSearch && matchesSpecialization;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl lg:text-4xl text-gray-900 mb-4">
            Discover Artists
          </h1>
          <p className="text-lg text-gray-600">
            Connect with talented artists and explore their unique creative visions
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Specialization Filter */}
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="rating">Sort by Rating</option>
              <option value="name">Sort by Name</option>
              <option value="sales">Sort by Sales</option>
              <option value="recent">Sort by Recent</option>
            </select>

            {/* View Mode */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex-1 px-4 py-3 flex items-center justify-center transition-colors ${
                  viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex-1 px-4 py-3 flex items-center justify-center transition-colors ${
                  viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${filteredArtists.length} artists found`}
          </p>
        </div>

        {/* Artists Grid/List */}
        {loading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md animate-pulse">
                <div className={`bg-gray-200 ${viewMode === 'grid' ? 'aspect-[4/3]' : 'h-48'}`}></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredArtists.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No artists found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all artists</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialization('');
              }}
              className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredArtists.map((artist) => (
              <div key={artist._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className={`relative ${viewMode === 'grid' ? 'aspect-[4/3]' : 'h-48'}`}>
                  <Avatar
                    src={artist.avatar}
                    alt={artist.name}
                    size="xl"
                    className="w-full h-full object-cover"
                  />
                  {artist.verified && (
                    <div className="absolute top-4 right-4 bg-blue-500 text-white p-1 rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-display font-semibold text-xl text-gray-900 mb-1">
                        {artist.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{artist.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center mb-1">
                        {renderStars(artist.rating)}
                        <span className="ml-1 text-sm text-gray-600">({artist.totalRatings})</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {artist.totalSales} sales
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {artist.bio}
                  </p>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {artist.specializations.slice(0, 3).map((spec) => (
                        <span
                          key={spec}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                        >
                          {spec}
                        </span>
                      ))}
                      {artist.specializations.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          +{artist.specializations.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      to={`/artists/${artist._id}`}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </Link>
                    
                    {user && user._id !== artist._id && (
                      <button
                        onClick={() => handleSendMessage(artist._id, artist.name)}
                        disabled={sendingMessage === artist._id}
                        className="px-4 py-2 bg-secondary text-primary font-medium rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {sendingMessage === artist._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        ) : (
                          <>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Artists; 
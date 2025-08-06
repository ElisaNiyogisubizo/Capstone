import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Star, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Exhibition } from '../types';
import { exhibitionService } from '../services/exhibition';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Exhibitions: React.FC = () => {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    fetchExhibitions();
  }, [selectedStatus]);

  const fetchExhibitions = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number | boolean> = {};
      
      if (selectedStatus) {
        params.status = selectedStatus;
      }
      
      const response = await exhibitionService.getExhibitions(params);
      setExhibitions(response.exhibitions);
    } catch (error) {
      console.error('Error fetching exhibitions:', error);
      toast.error('Failed to load exhibitions');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (exhibitionId: string) => {
    if (!user) {
      toast.error('Please login to register for exhibitions');
      return;
    }

    try {
      const result = await exhibitionService.registerForExhibition(exhibitionId);
      toast.success(result.message);
      // Refresh exhibitions to update registration status
      fetchExhibitions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to register for exhibition');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Upcoming';
      case 'ongoing':
        return 'Ongoing';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl lg:text-4xl text-gray-900 mb-4">
            Art Exhibitions
          </h1>
          <p className="text-lg text-gray-600">
            Discover upcoming and ongoing art exhibitions from talented artists
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700 font-medium">Filter by:</span>
            </div>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Exhibitions</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${exhibitions.length} exhibitions found`}
          </p>
        </div>

        {/* Exhibitions Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 rounded-t-lg"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : exhibitions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No exhibitions found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later for new exhibitions.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exhibitions.map((exhibition) => (
              <div key={exhibition._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={exhibition.image}
                    alt={exhibition.title}
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(exhibition.status)}`}>
                      {getStatusText(exhibition.status)}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {exhibition.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {exhibition.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        {formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="line-clamp-1">{exhibition.location}</span>
                    </div>
                    
                    {exhibition.organizer && typeof exhibition.organizer === 'object' && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Organized by {exhibition.organizer.name}</span>
                      </div>
                    )}
                    
                    {exhibition.maxCapacity && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-2" />
                        <span>
                          {exhibition.registeredUsers?.length || 0} / {exhibition.maxCapacity} registered
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRegister(exhibition._id)}
                      disabled={exhibition.status === 'completed'}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        exhibition.status === 'completed'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-primary text-white hover:bg-primary/90'
                      }`}
                    >
                      {exhibition.status === 'completed' ? 'Completed' : 'Register'}
                    </button>
                    
                    <Link
                      to={`/exhibitions/${exhibition._id}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors inline-block text-center"
                    >
                      View Details
                    </Link>
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

export default Exhibitions; 
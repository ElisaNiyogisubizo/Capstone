import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Search,
  Grid,
  List
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { exhibitionService } from '../services/exhibition';
import { Exhibition } from '../types';
import CreateExhibitionForm from '../components/CreateExhibitionForm';
import toast from 'react-hot-toast';

const ArtistExhibitions: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Check if we should show create form on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('create') === '1') {
      setShowCreateForm(true);
    }
  }, [location.search]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (user) {
      fetchExhibitions();
    }
  }, [user]);

  const fetchExhibitions = async () => {
    try {
      setLoading(true);
      const response = await exhibitionService.getExhibitions({ 
        organizer: user?._id,
        limit: 50 
      });
      setExhibitions(response.exhibitions);
    } catch (error) {
      console.error('Error fetching exhibitions:', error);
      toast.error('Failed to load exhibitions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchExhibitions();
    toast.success('Exhibition created successfully!');
  };

  const handleDeleteExhibition = async (exhibitionId: string) => {
    if (!confirm('Are you sure you want to delete this exhibition?')) {
      return;
    }

    try {
      await exhibitionService.deleteExhibition(exhibitionId);
      toast.success('Exhibition deleted successfully');
      fetchExhibitions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete exhibition');
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredExhibitions = exhibitions.filter(exhibition => {
    const matchesSearch = exhibition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exhibition.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || exhibition.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!user || user.role !== 'artist') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only artists can manage exhibitions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Exhibitions</h1>
            <p className="text-gray-600 mt-2">Manage your exhibitions and create new ones</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 sm:mt-0 flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Exhibition
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search exhibitions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
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
          </div>
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CreateExhibitionForm
                onSuccess={handleCreateSuccess}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        )}

        {/* Exhibitions List */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredExhibitions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No exhibitions found</h3>
            <p className="text-gray-600 mb-6">
              {exhibitions.length === 0 
                ? "You haven't created any exhibitions yet." 
                : "No exhibitions match your search criteria."}
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Exhibition
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          }`}>
            {filteredExhibitions.map((exhibition) => (
              <div key={exhibition._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={exhibition.image}
                    alt={exhibition.title}
                    className={`w-full object-cover ${
                      viewMode === 'grid' ? 'h-48' : 'h-32'
                    }`}
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(exhibition.status)}`}>
                      {exhibition.status.charAt(0).toUpperCase() + exhibition.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {exhibition.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {exhibition.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{exhibition.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{exhibition.registeredUsers?.length || 0} registered</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/exhibitions/${exhibition._id}`}
                        className="flex items-center text-sm text-primary hover:text-primary/80"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Link>
                      <button
                        onClick={() => {/* TODO: Implement edit */}}
                        className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteExhibition(exhibition._id)}
                      className="flex items-center text-sm text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
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

export default ArtistExhibitions; 
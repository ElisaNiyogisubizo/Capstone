import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Calendar, Users } from 'lucide-react';
import { VirtualExhibitionCard } from '../components/VirtualExhibitionCard';
import { virtualExhibitionService } from '../services/virtualExhibition';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const VirtualExhibitions: React.FC = () => {
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchExhibitions();
  }, []);

  const fetchExhibitions = async () => {
    try {
      setLoading(true);
      const response = await virtualExhibitionService.getVirtualExhibitions();
      setExhibitions(response.data || []);
    } catch (error) {
      console.error('Error fetching virtual exhibitions:', error);
      toast.error('Failed to load virtual exhibitions');
    } finally {
      setLoading(false);
    }
  };

  const filteredExhibitions = exhibitions.filter(exhibition => {
    const matchesSearch = exhibition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exhibition.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exhibition.theme?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && new Date() >= new Date(exhibition.startDate) && new Date() <= new Date(exhibition.endDate)) ||
                         (filter === 'upcoming' && new Date() < new Date(exhibition.startDate)) ||
                         (filter === 'free' && exhibition.isFree) ||
                         (filter === 'paid' && !exhibition.isFree);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Virtual Exhibitions</h1>
            <p className="text-gray-600">Discover immersive digital art experiences from around the world</p>
          </div>
          
          {user?.role === 'artist' && (
            <Link
              to="/virtual-exhibitions/create"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors mt-4 md:mt-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Exhibition
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search exhibitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Exhibitions</option>
                <option value="active">Live Now</option>
                <option value="upcoming">Upcoming</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Exhibitions</p>
                <p className="text-2xl font-bold text-gray-900">{exhibitions.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Active Now</p>
                <p className="text-2xl font-bold text-gray-900">
                  {exhibitions.filter(e => new Date() >= new Date(e.startDate) && new Date() <= new Date(e.endDate)).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {exhibitions.filter(e => new Date() < new Date(e.startDate)).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Exhibitions Grid */}
        {filteredExhibitions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No exhibitions found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No virtual exhibitions are available at the moment'
              }
            </p>
            {(searchTerm || filter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExhibitions.map((exhibition) => (
              <VirtualExhibitionCard key={exhibition._id} exhibition={exhibition} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualExhibitions; 
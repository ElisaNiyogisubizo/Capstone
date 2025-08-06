import React, { useState, useEffect } from 'react';
import { Search, Grid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ArtworkCard from '../components/ArtworkCard';
import { Artwork } from '../types';
import { artworkService } from '../services/artwork';
import { messageService } from '../services/message';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Browse: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  useEffect(() => {
    fetchArtworks();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArtworks();
  }, [searchTerm, selectedCategory, sortBy, priceRange]);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {};
      
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (priceRange.min) params.minPrice = priceRange.min;
      if (priceRange.max) params.maxPrice = priceRange.max;
      
      const response = await artworkService.getArtworks(params);
      setArtworks(response.artworks);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await artworkService.getCategories();
      setCategories(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleLike = async (artworkId: string) => {
    try {
      await artworkService.likeArtwork(artworkId);
      // Update local state
      setArtworks(prev => prev.map(artwork => 
        artwork._id === artworkId 
          ? { ...artwork, likes: [...(artwork.likes || []), 'current-user'] }
          : artwork
      ));
    } catch (error) {
      console.error('Error liking artwork:', error);
    }
  };

  const handleMessage = async (artworkId: string, artistId: string) => {
    if (!user) {
      toast.error('Please log in to send messages');
      navigate('/login');
      return;
    }

    // Navigate to messages page with the artist conversation
    navigate(`/messages?artist=${artistId}&artwork=${artworkId}`);
    toast.success('Ready to message the artist!');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArtworks();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl lg:text-4xl text-gray-900 mb-4">
            Browse Artworks
          </h1>
          <p className="text-lg text-gray-600">
            Discover unique pieces from talented local artists
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search artworks, artists, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Categories</option>
                {Array.isArray(categories) && categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Price Range */}
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>

              {/* View Mode */}
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-4 py-2 flex items-center justify-center transition-colors ${
                    viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex-1 px-4 py-2 flex items-center justify-center transition-colors ${
                    viewMode === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Apply Filters
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${artworks.length} artworks found`}
          </p>
        </div>

        {/* Artwork Grid/List */}
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
        ) : artworks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No artworks found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or browse all artworks</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setPriceRange({ min: '', max: '' });
                fetchArtworks();
              }}
              className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {artworks.map((artwork) => (
              <ArtworkCard 
                key={artwork._id} 
                artwork={artwork} 
                onLike={handleLike}
                onMessage={handleMessage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
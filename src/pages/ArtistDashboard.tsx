import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  Star,
  Palette,
  Camera,
  Upload,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { artworkService } from '../services/artwork';
import { Artwork } from '../types';
import { defaultImages } from '../utils/images';
import toast from 'react-hot-toast';

const ArtistDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    medium: '',
    dimensions: '',
    tags: [] as string[],
    images: [] as string[]
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [newTag, setNewTag] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && user.role === 'artist') {
      fetchArtworks();
    } else {
      navigate('/');
      toast.error('Access denied. Artist account required.');
    }
  }, [user, navigate]);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      const response = await artworkService.getArtworks({ artist: user?._id });
      setArtworks(response.artworks || []);
    } catch (error) {
      console.error('Error fetching artworks:', error);
      toast.error('Failed to load artworks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const artworkData = {
        ...formData,
        price: parseFloat(formData.price),
        tags: formData.tags // Already an array, no need to split
      };

      if (editingArtwork) {
        await artworkService.updateArtwork(editingArtwork._id, artworkData);
        toast.success('Artwork updated successfully');
      } else {
        await artworkService.createArtwork(artworkData);
        toast.success('Artwork created successfully');
      }

      setShowForm(false);
      setEditingArtwork(null);
      resetForm();
      fetchArtworks();
    } catch (error) {
      console.error('Error saving artwork:', error);
      toast.error('Failed to save artwork');
    }
  };

  const handleEdit = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setFormData({
      title: artwork.title,
      description: artwork.description,
      price: artwork.price.toString(),
      category: artwork.category,
      medium: artwork.medium || '',
      dimensions: artwork.dimensions || '',
      tags: artwork.tags || [], // Already an array from the backend
      images: artwork.images || []
    });
    setSelectedFiles([]);
    setNewTag('');
    setShowForm(true);
  };

  const handleDelete = async (artworkId: string) => {
    if (!confirm('Are you sure you want to delete this artwork?')) return;

    try {
      await artworkService.deleteArtwork(artworkId);
      setArtworks(prev => prev.filter(artwork => artwork._id !== artworkId));
      toast.success('Artwork deleted successfully');
    } catch (error) {
      console.error('Error deleting artwork:', error);
      toast.error('Failed to delete artwork');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      medium: '',
      dimensions: '',
      tags: [],
      images: []
    });
    setSelectedFiles([]);
    setNewTag('');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingArtwork(null);
    resetForm();
  };

  // Tag management functions
  const addTag = () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setNewTag('');
    } else if (formData.tags.includes(trimmedTag)) {
      toast.error('Tag already exists');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // File upload handlers
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image file`);
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
      }
      
      return isValidType && isValidSize;
    });

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const stats = [
    {
      label: 'Total Artworks',
      value: artworks.length,
      icon: Palette,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Total Views',
      value: artworks.reduce((sum, artwork) => sum + (artwork.views || 0), 0),
      icon: Eye,
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Total Likes',
      value: artworks.reduce((sum, artwork) => sum + (artwork.likes?.length || 0), 0),
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-100'
    },
    {
      label: 'Total Sales',
      value: artworks.filter(artwork => artwork.status === 'sold').length,
      icon: DollarSign,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100'
    }
  ];

  if (!user || user.role !== 'artist') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need an artist account to access this page.</p>
          <Link to="/" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-12 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">Artist Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your artworks and track your performance</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Artwork
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Artwork Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingArtwork ? 'Edit Artwork' : 'Add New Artwork'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter artwork title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    <option value="Painting">Painting</option>
                    <option value="Sculpture">Sculpture</option>
                    <option value="Photography">Photography</option>
                    <option value="Digital Art">Digital Art</option>
                    <option value="Printmaking">Printmaking</option>
                    <option value="Mixed Media">Mixed Media</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medium
                  </label>
                  <input
                    type="text"
                    value={formData.medium}
                    onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Oil on canvas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., 24 x 36 inches"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={handleTagKeyPress}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter a tag"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        disabled={!newTag.trim()}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        Add Tag
                      </button>
                    </div>
                    
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                        {formData.tags.map((tag, index) => (
                          <span 
                            key={index} 
                            className="flex items-center bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full border border-primary/20"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-2 text-primary hover:text-primary/80 transition-colors"
                              title="Remove tag"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Describe your artwork..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images
                </label>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />

                {/* Upload area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragOver 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={openFileDialog}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Click to upload images or drag and drop</p>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 10MB each</p>
                </div>

                {/* Selected files preview */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Images:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {editingArtwork ? 'Update Artwork' : 'Create Artwork'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Artworks Grid */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">My Artworks</h2>
          </div>

          {artworks.length > 0 ? (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artworks.map((artwork) => (
                  <div key={artwork._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-[4/3]">
                      <img
                        src={artwork.images[0] || defaultImages.artwork}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
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
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{artwork.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{artwork.description}</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-primary">${artwork.price.toLocaleString()}</span>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {artwork.category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {artwork.views}
                          </span>
                          <span className="flex items-center">
                            <Heart className="w-4 h-4 mr-1" />
                            {artwork.likes?.length || 0}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(artwork)}
                          className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors flex items-center justify-center"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(artwork._id)}
                          className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No artworks yet</h3>
              <p className="text-gray-500 mb-4">Start by adding your first artwork</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Artwork
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistDashboard;
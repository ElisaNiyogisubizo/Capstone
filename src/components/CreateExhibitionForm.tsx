import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  X, 
  Plus, 
  Calendar, 
  MapPin, 
  Image as ImageIcon,
  FileText,
  Users,
  DollarSign,
  Save,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { exhibitionService } from '../services/exhibition';
import { artworkService } from '../services/artwork';
import { Artwork } from '../types';
import { defaultImages } from '../utils/images';
import toast from 'react-hot-toast';

interface CreateExhibitionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateExhibitionForm: React.FC<CreateExhibitionFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtworks, setSelectedArtworks] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    image: '',
    maxCapacity: 50,
    price: 0,
    isFree: true,
    tags: [] as string[],
    additionalImages: [] as string[],
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchUserArtworks();
  }, []);

  const fetchUserArtworks = async () => {
    try {
      const response = await artworkService.getArtworks({ artist: user?._id, limit: 100 });
      setArtworks(response.artworks);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // For demo purposes, we'll use the base64 data
        // In production, you'd upload to a cloud service like AWS S3
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (let i = 0; i < files.length; i++) {
        const url = await handleImageUpload(files[i]);
        uploadedUrls.push(url);
      }
      
      if (event.target.name === 'mainImage') {
        handleInputChange('image', uploadedUrls[0]);
      } else if (event.target.name === 'additionalImages') {
        handleInputChange('additionalImages', [...formData.additionalImages, ...uploadedUrls]);
      }
      
      toast.success('Images uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number, type: 'main' | 'additional') => {
    if (type === 'main') {
      handleInputChange('image', '');
    } else {
      const newImages = [...formData.additionalImages];
      newImages.splice(index, 1);
      handleInputChange('additionalImages', newImages);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const toggleArtworkSelection = (artworkId: string) => {
    setSelectedArtworks(prev => 
      prev.includes(artworkId) 
        ? prev.filter(id => id !== artworkId)
        : [...prev, artworkId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== CREATE EXHIBITION FORM SUBMIT ===');
    console.log('User object:', user);
    console.log('User ID:', user?._id);
    console.log('User role:', user?.role);
    console.log('User email:', user?.email);
    console.log('Token available:', !!localStorage.getItem('token'));
    
    if (!user) {
      console.log('❌ No user found - access denied');
      toast.error('Please login to create an exhibition');
      return;
    }
    
    if (user.role !== 'artist') {
      console.log('❌ User role is not artist:', user.role);
      toast.error('Only artists can create exhibitions');
      return;
    }
    
    console.log('✅ User authentication passed');

    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Preparing exhibition data...');
      const exhibitionData = {
        ...formData,
        featuredArtworks: selectedArtworks,
        organizer: user._id,
        status: 'upcoming' as const,
      };
      
      console.log('📤 Exhibition data to send:', exhibitionData);
      console.log('📤 Making API call to create exhibition...');

      await exhibitionService.createExhibition(exhibitionData);
      console.log('✅ Exhibition created successfully!');
      toast.success('Exhibition created successfully!');
      onSuccess?.();
    } catch (error: any) {
      console.error('❌ Error creating exhibition:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.response?.data?.message);
      toast.error(error.response?.data?.message || 'Failed to create exhibition');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create New Exhibition</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exhibition Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter exhibition title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Gallery name, address"
                required
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Describe your exhibition..."
            required
          />
        </div>

        {/* Main Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Main Exhibition Image *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {formData.image ? (
              <div className="relative">
                <img
                  src={formData.image}
                  alt="Exhibition"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(0, 'main')}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <label className="cursor-pointer bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                    <Upload className="w-4 h-4 inline mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      name="mainImage"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Recommended size: 1200x800px
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Images
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {formData.additionalImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Additional ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index, 'additional')}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <label className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              <Plus className="w-4 h-4 inline mr-2" />
              Add More Images
              <input
                type="file"
                name="additionalImages"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Capacity and Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Capacity
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={formData.maxCapacity}
                onChange={(e) => handleInputChange('maxCapacity', parseInt(e.target.value))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                min="1"
                max="1000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entry Fee
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isFree}
                  onChange={(e) => handleInputChange('isFree', e.target.checked)}
                  className="mr-2"
                />
                Free Entry
              </label>
              {!formData.isFree && (
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-primary hover:text-primary/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Add a tag..."
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Featured Artworks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Featured Artworks
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
            {artworks.map((artwork) => (
              <div
                key={artwork._id}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedArtworks.includes(artwork._id)
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleArtworkSelection(artwork._id)}
              >
                <img
                  src={artwork.images[0] || defaultImages.artwork}
                  alt={artwork.title}
                  className="w-full h-24 object-cover rounded mb-2"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = defaultImages.artwork;
                  }}
                />
                <h4 className="font-medium text-sm">{artwork.title}</h4>
                <p className="text-xs text-gray-500">${artwork.price}</p>
              </div>
            ))}
          </div>
          {artworks.length === 0 && (
            <p className="text-gray-500 text-sm">No artworks available. Create some artworks first!</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Exhibition
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateExhibitionForm; 
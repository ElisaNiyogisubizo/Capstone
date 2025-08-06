import mongoose, { Document, Schema } from 'mongoose';

export interface IArtwork extends Document {
  title: string;
  description: string;
  price: number;
  category: string;
  medium: string;
  dimensions: string;
  images: string[];
  artist: mongoose.Types.ObjectId;
  status: 'available' | 'sold' | 'reserved';
  tags: string[];
  likes: mongoose.Types.ObjectId[];
  views: number;
  featured: boolean;
  comments: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const artworkSchema = new Schema<IArtwork>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Painting',
      'Photography',
      'Sculpture',
      'Digital Art',
      'Mixed Media',
      'Abstract',
      'Portrait',
      'Landscape',
      'Still Life',
      'Street Art',
      'Other'
    ],
  },
  medium: {
    type: String,
    required: [true, 'Medium is required'],
    trim: true,
    maxlength: [100, 'Medium cannot exceed 100 characters'],
  },
  dimensions: {
    type: String,
    required: [true, 'Dimensions are required'],
    trim: true,
    maxlength: [100, 'Dimensions cannot exceed 100 characters'],
  },
  images: [{
    type: String,
    required: true,
  }],
  artist: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Artist is required'],
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available',
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: [],
  }],
  views: {
    type: Number,
    default: 0,
    min: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: [],
  }],
}, {
  timestamps: true,
});

// Indexes for efficient queries
artworkSchema.index({ artist: 1 });
artworkSchema.index({ category: 1 });
artworkSchema.index({ status: 1 });
artworkSchema.index({ featured: 1 });
artworkSchema.index({ createdAt: -1 });
artworkSchema.index({ price: 1 });
artworkSchema.index({ views: -1 });
artworkSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for like count
artworkSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Ensure virtual fields are serialized
artworkSchema.set('toJSON', { virtuals: true });

export default mongoose.model<IArtwork>('Artwork', artworkSchema);
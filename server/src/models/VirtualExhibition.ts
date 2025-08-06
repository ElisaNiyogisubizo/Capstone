import mongoose, { Document, Schema } from 'mongoose';

export interface IVirtualExhibition extends Document {
  title: string;
  description: string;
  theme: string;
  artistNotes: string;
  startDate: Date;
  endDate: Date;
  organizer: mongoose.Types.ObjectId;
  status: 'draft' | 'published' | 'archived';
  featuredArtworks: mongoose.Types.ObjectId[];
  attendees: mongoose.Types.ObjectId[];
  views: number;
  visits: number;
  isFree: boolean;
  price?: number;
  tags: string[];
  coverImage: string;
  additionalImages: string[];
  settings: {
    allowComments: boolean;
    allowSharing: boolean;
    requireRegistration: boolean;
    maxAttendees?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const virtualExhibitionSchema = new Schema<IVirtualExhibition>({
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
  theme: {
    type: String,
    required: [true, 'Theme is required'],
    trim: true,
    maxlength: [100, 'Theme cannot exceed 100 characters'],
  },
  artistNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Artist notes cannot exceed 1000 characters'],
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(this: IVirtualExhibition, value: Date) {
        return value > this.startDate;
      },
      message: 'End date must be after start date',
    },
  },
  organizer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer is required'],
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  featuredArtworks: [{
    type: Schema.Types.ObjectId,
    ref: 'Artwork',
  }],
  attendees: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  views: {
    type: Number,
    default: 0,
    min: 0,
  },
  visits: {
    type: Number,
    default: 0,
    min: 0,
  },
  isFree: {
    type: Boolean,
    default: true,
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    default: 0,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  coverImage: {
    type: String,
    required: [true, 'Cover image is required'],
  },
  additionalImages: [{
    type: String,
  }],
  settings: {
    allowComments: {
      type: Boolean,
      default: true,
    },
    allowSharing: {
      type: Boolean,
      default: true,
    },
    requireRegistration: {
      type: Boolean,
      default: false,
    },
    maxAttendees: {
      type: Number,
      min: 1,
    },
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
virtualExhibitionSchema.index({ organizer: 1 });
virtualExhibitionSchema.index({ status: 1 });
virtualExhibitionSchema.index({ startDate: 1 });
virtualExhibitionSchema.index({ endDate: 1 });
virtualExhibitionSchema.index({ isFree: 1 });
virtualExhibitionSchema.index({ theme: 1 });
virtualExhibitionSchema.index({ title: 'text', description: 'text', theme: 'text' });

// Virtual for attendee count
virtualExhibitionSchema.virtual('attendeeCount').get(function() {
  return this.attendees.length;
});

// Ensure virtual fields are serialized
virtualExhibitionSchema.set('toJSON', { virtuals: true });

export default mongoose.model<IVirtualExhibition>('VirtualExhibition', virtualExhibitionSchema); 
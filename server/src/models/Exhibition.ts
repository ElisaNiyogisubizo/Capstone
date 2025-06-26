import mongoose, { Document, Schema } from 'mongoose';

export interface IExhibition extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  image: string;
  featuredArtworks: mongoose.Types.ObjectId[];
  organizer: mongoose.Types.ObjectId;
  status: 'upcoming' | 'ongoing' | 'completed';
  maxCapacity?: number;
  registeredUsers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const exhibitionSchema = new Schema<IExhibition>({
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
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(this: IExhibition, value: Date) {
        return value > this.startDate;
      },
      message: 'End date must be after start date',
    },
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters'],
  },
  image: {
    type: String,
    required: [true, 'Image is required'],
  },
  featuredArtworks: [{
    type: Schema.Types.ObjectId,
    ref: 'Artwork',
  }],
  organizer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer is required'],
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming',
  },
  maxCapacity: {
    type: Number,
    min: [1, 'Max capacity must be at least 1'],
  },
  registeredUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

// Indexes for efficient queries
exhibitionSchema.index({ status: 1 });
exhibitionSchema.index({ startDate: 1 });
exhibitionSchema.index({ endDate: 1 });
exhibitionSchema.index({ organizer: 1 });

// Update status based on dates
exhibitionSchema.pre('save', function(next) {
  const now = new Date();
  
  if (now < this.startDate) {
    this.status = 'upcoming';
  } else if (now >= this.startDate && now <= this.endDate) {
    this.status = 'ongoing';
  } else {
    this.status = 'completed';
  }
  
  next();
});

export default mongoose.model<IExhibition>('Exhibition', exhibitionSchema);
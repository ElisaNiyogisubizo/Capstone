import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  artwork: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  parentComment?: mongoose.Types.ObjectId; // For nested comments
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
  artwork: {
    type: Schema.Types.ObjectId,
    ref: 'Artwork',
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters'],
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: {
    type: Date,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: [],
  }],
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
commentSchema.index({ artwork: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ isDeleted: 1 });
commentSchema.index({ parentComment: 1 });

// Virtual for like count
commentSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Ensure virtual fields are serialized
commentSchema.set('toJSON', { virtuals: true });

export default mongoose.model<IComment>('Comment', commentSchema); 
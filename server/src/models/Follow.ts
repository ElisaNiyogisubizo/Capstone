import mongoose, { Document, Schema } from 'mongoose';

export interface IFollow extends Document {
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
  createdAt: Date;
}

const followSchema = new Schema<IFollow>({
  follower: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  following: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Ensure unique follower-following pairs
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Prevent self-following
followSchema.pre('save', function(next) {
  if (this.follower.toString() === this.following.toString()) {
    return next(new Error('Cannot follow yourself'));
  }
  next();
});

export default mongoose.model<IFollow>('Follow', followSchema); 
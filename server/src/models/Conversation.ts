import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage: mongoose.Types.ObjectId;
  lastMessageAt: Date;
  unreadCount: Map<string, number> & { [key: string]: number };
  artwork?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {},
  },
  artwork: {
    type: Schema.Types.ObjectId,
    ref: 'Artwork',
  },
}, {
  timestamps: true,
});

// Ensure participants are unique and sorted
conversationSchema.pre('save', function(next) {
  this.participants = [...new Set(this.participants)].sort();
  next();
});

// Indexes for efficient queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ 'unreadCount': 1 });

export default mongoose.model<IConversation>('Conversation', conversationSchema); 
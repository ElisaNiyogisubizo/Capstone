import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: [true, 'Conversation is required'],
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required'],
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver is required'],
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
  },
  read: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, read: 1 });

export default mongoose.model<IMessage>('Message', messageSchema);
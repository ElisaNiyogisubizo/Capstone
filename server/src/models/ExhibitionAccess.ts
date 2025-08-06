import mongoose, { Document, Schema } from 'mongoose';

export interface IExhibitionAccess extends Document {
  user: mongoose.Types.ObjectId;
  exhibition: mongoose.Types.ObjectId;
  accessType: 'free' | 'paid';
  paymentMethod?: 'stripe' | 'other';
  stripeSessionId?: string;
  orderId?: mongoose.Types.ObjectId;
  accessedAt: Date;
  createdAt: Date;
}

const exhibitionAccessSchema = new Schema<IExhibitionAccess>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  exhibition: {
    type: Schema.Types.ObjectId,
    ref: 'Exhibition',
    required: true,
  },
  accessType: {
    type: String,
    enum: ['free', 'paid'],
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'other'],
  },
  stripeSessionId: {
    type: String,
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
  },
  accessedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
exhibitionAccessSchema.index({ user: 1, exhibition: 1 }, { unique: true });
exhibitionAccessSchema.index({ exhibition: 1 });
exhibitionAccessSchema.index({ accessType: 1 });
exhibitionAccessSchema.index({ accessedAt: -1 });

export default mongoose.model<IExhibitionAccess>('ExhibitionAccess', exhibitionAccessSchema); 
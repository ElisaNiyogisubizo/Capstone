import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  artwork: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  title: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  paymentMethod: 'stripe' | 'other';
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paidAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  artwork: {
    type: Schema.Types.ObjectId,
    ref: 'Artwork',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  title: {
    type: String,
    required: true,
  },
});

const orderSchema = new Schema<IOrder>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'other'],
    default: 'stripe',
  },
  stripePaymentIntentId: {
    type: String,
  },
  stripeSessionId: {
    type: String,
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  paidAt: {
    type: Date,
  },
  cancelledAt: {
    type: Date,
  },
  refundedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ stripePaymentIntentId: 1 });
orderSchema.index({ stripeSessionId: 1 });

// Update timestamps when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    
    if (this.status === 'paid' && !this.paidAt) {
      this.paidAt = now;
    } else if (this.status === 'cancelled' && !this.cancelledAt) {
      this.cancelledAt = now;
    } else if (this.status === 'refunded' && !this.refundedAt) {
      this.refundedAt = now;
    }
  }
  next();
});

export default mongoose.model<IOrder>('Order', orderSchema); 
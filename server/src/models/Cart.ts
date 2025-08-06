import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  artwork: mongoose.Types.ObjectId;
  quantity: number;
  addedAt: Date;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
  artwork: {
    type: Schema.Types.ObjectId,
    ref: 'Artwork',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartSchema = new Schema<ICart>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: {
    type: [cartItemSchema],
    default: [],
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
cartSchema.index({ user: 1 });

// Calculate total amount before saving
cartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.quantity * 0); // Price will be calculated from artwork reference
  }, 0);
  next();
});

export default mongoose.model<ICart>('Cart', cartSchema); 
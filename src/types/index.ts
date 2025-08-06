export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'artist' | 'community' | 'admin';
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  socialLinks?: {
    instagram?: string;
    website?: string;
    facebook?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Artist extends User {
  role: 'artist';
  verified: boolean;
  specializations: string[];
  totalSales: number;
  rating: number;
  totalRatings: number;
}

export interface Artwork {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  medium: string;
  dimensions: string;
  images: string[];
  artist: Artist;
  status: 'available' | 'sold' | 'reserved';
  tags: string[];
  likes: string[];
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Exhibition {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  image: string;
  featuredArtworks: string[];
  organizer: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  accessType: 'free' | 'paid';
  stripeProductId?: string;
  stripePriceId?: string;
  createdAt: string;
}

export interface VirtualExhibition {
  _id: string;
  title: string;
  description: string;
  theme: string;
  artistNotes?: string;
  startDate: string;
  endDate: string;
  organizer: string;
  status: 'draft' | 'published' | 'archived';
  featuredArtworks: string[];
  attendees: string[];
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
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  sender: string;
  receiver: string;
  artwork?: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ user: User; token: string }>;
  register: (userData: RegisterData) => Promise<{ user: User; token: string }>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  refreshUser: () => Promise<User | undefined>;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'artist' | 'community';
  bio?: string;
  location?: string;
  specializations?: string[];
}

export interface ArtworkFormData {
  title: string;
  description: string;
  price: number;
  category: string;
  medium: string;
  dimensions: string;
  tags: string[];
  images: File[];
}

export interface CartItem {
  _id: string;
  artwork: {
    _id: string;
    title: string;
    images: string[];
    price: number;
    artist: {
      _id: string;
      name: string;
      avatar?: string;
    };
    status: string;
  };
  quantity: number;
  addedAt: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  artwork: string;
  quantity: number;
  price: number;
  title: string;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
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
  paidAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  artwork: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
  likes: string[];
  parentComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Follow {
  _id: string;
  follower: string;
  following: string;
  createdAt: string;
}

export interface ArtistAnalytics {
  artworkStats: {
    total: number;
    available: number;
    sold: number;
    reserved: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
  };
  followerStats: {
    followers: number;
    following: number;
  };
  exhibitionStats: {
    total: number;
    regular: number;
    virtual: number;
    totalAttendees: number;
    totalViews: number;
  };
  recentEngagement: {
    comments: number;
    newFollowers: number;
    recentComments: Comment[];
    recentFollowers: User[];
  };
}
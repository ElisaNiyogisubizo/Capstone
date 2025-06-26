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
  createdAt: string;
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
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
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
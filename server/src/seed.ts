import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User';
import Artwork from './models/Artwork';
import Exhibition from './models/Exhibition';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/art-gallery';

// Local image paths
const localImages = {
  avatar1: '/images/artwork-portrait-1.jpeg',
  avatar2: '/images/artwork-abstract-1.jpeg',
  avatar3: '/images/artwork-modern-1.jpeg',
  avatar4: '/images/artwork-contemporary-1.jpeg',
  artwork1: '/images/artwork-abstract-1.jpeg',
  artwork2: '/images/artwork-painting-1.jpeg',
  artwork3: '/images/artwork-sculpture-1.jpeg',
  artwork4: '/images/artwork-portrait-1.jpeg',
  artwork5: '/images/artwork-landscape-1.jpeg',
  artwork6: '/images/artwork-modern-1.jpeg',
  artwork7: '/images/artwork-contemporary-1.jpeg',
  artwork8: '/images/artwork-digital-1.jpeg',
  artwork9: '/images/artwork-impressionist-1.jpeg',
  artwork10: '/images/artwork-expressionist-1.jpeg',
  artwork11: '/images/artwork-minimalist-1.jpeg',
  artwork12: '/images/artwork-surrealist-1.jpeg',
  artwork13: '/images/artwork-avant-garde-1.jpeg',
  cover1: '/images/artwork-landscape-1.jpeg',
  cover2: '/images/artwork-surrealist-1.jpeg',
  cover3: '/images/artwork-expressionist-1.jpeg'
};

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Artwork.deleteMany({});
    await Exhibition.deleteMany({});

    console.log('Cleared existing data');

    // Create users
    const users = await User.create([
      {
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
        password: await bcrypt.hash('password123', 10),
      role: 'artist',
      location: 'New York, NY',
        bio: 'Contemporary artist exploring the intersection of digital and traditional mediums.',
        avatar: localImages.avatar1,
        verified: true,
        rating: 4.8,
        totalRatings: 45,
        totalSales: 12
      },
      {
      name: 'Michael Chen',
      email: 'michael@example.com',
        password: await bcrypt.hash('password123', 10),
      role: 'artist',
        location: 'Los Angeles, CA',
        bio: 'Abstract painter with a focus on color theory and emotional expression.',
        avatar: localImages.avatar2,
        verified: true,
        rating: 4.6,
        totalRatings: 32,
        totalSales: 8
      },
      {
      name: 'Emma Rodriguez',
      email: 'emma@example.com',
        password: await bcrypt.hash('password123', 10),
      role: 'artist',
        location: 'Chicago, IL',
        bio: 'Sculptor working with mixed media and found objects.',
        avatar: localImages.avatar3,
        verified: false,
        rating: 4.2,
        totalRatings: 18,
        totalSales: 5
      },
      {
        name: 'David Kim',
        email: 'david@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
        location: 'San Francisco, CA',
        bio: 'Art collector and enthusiast.',
        avatar: localImages.avatar4,
        verified: false,
        rating: 0,
        totalRatings: 0,
        totalSales: 0
      }
    ]);

    console.log('Created users');

    // Create artworks
    const artworks = await Artwork.create([
      {
      title: 'Abstract Harmony',
        description: 'A vibrant exploration of color and form, inspired by the chaos and order of urban life.',
        price: 2500,
        category: 'Painting',
        medium: 'Acrylic on canvas',
        dimensions: '36" x 48"',
        artist: users[0]._id,
        images: [localImages.artwork1],
        tags: ['abstract', 'contemporary', 'colorful'],
      status: 'available',
      views: 156,
        likes: [users[3]._id],
        featured: true
      },
      {
        title: 'Urban Landscape',
        description: 'A digital painting capturing the energy and movement of city life.',
        price: 1800,
      category: 'Digital Art',
        medium: 'Digital painting',
        dimensions: '24" x 36"',
        artist: users[1]._id,
        images: [localImages.artwork2],
        tags: ['digital', 'urban', 'landscape'],
      status: 'available',
      views: 89,
        likes: [],
        featured: false
      },
      {
        title: 'Metamorphosis',
        description: 'A mixed media sculpture exploring transformation and growth.',
        price: 3200,
      category: 'Sculpture',
        medium: 'Bronze and steel',
        dimensions: '18" x 24" x 12"',
        artist: users[2]._id,
        images: [localImages.artwork3],
        tags: ['sculpture', 'bronze', 'abstract'],
      status: 'available',
      views: 203,
        likes: [users[0]._id, users[3]._id],
        featured: true
      },
      {
        title: 'Portrait of Time',
        description: 'A contemplative portrait series examining the passage of time.',
        price: 1500,
        category: 'Photography',
        medium: 'Digital photography',
        dimensions: '20" x 30"',
        artist: users[0]._id,
        images: [localImages.artwork4],
        tags: ['portrait', 'photography', 'time'],
        status: 'sold',
        views: 342,
        likes: [users[1]._id, users[2]._id, users[3]._id],
        featured: false
      },
      {
        title: 'Mountain Serenity',
        description: 'A peaceful landscape painting inspired by the Rocky Mountains.',
        price: 2200,
        category: 'Painting',
        medium: 'Oil on canvas',
        dimensions: '30" x 40"',
        artist: users[1]._id,
        images: [localImages.artwork5],
        tags: ['landscape', 'nature', 'serene'],
        status: 'available',
        views: 127,
        likes: [users[0]._id],
        featured: false
      },
      {
        title: 'Modern Geometry',
        description: 'A contemporary exploration of geometric forms and spatial relationships.',
        price: 2800,
      category: 'Mixed Media',
        medium: 'Acrylic and collage',
        dimensions: '48" x 60"',
        artist: users[2]._id,
        images: [localImages.artwork6],
        tags: ['geometric', 'modern', 'mixed-media'],
        status: 'available',
        views: 95,
        likes: [users[1]._id],
        featured: true
      },
      {
        title: 'Digital Dreams',
        description: 'A futuristic digital artwork exploring the relationship between technology and humanity.',
        price: 1900,
        category: 'Digital Art',
        medium: 'Digital illustration',
        dimensions: '24" x 36"',
        artist: users[0]._id,
        images: [localImages.artwork7],
        tags: ['digital', 'futuristic', 'technology'],
        status: 'available',
        views: 178,
        likes: [users[2]._id],
        featured: false
      },
      {
        title: 'Abstract Flow',
        description: 'A dynamic abstract painting capturing the fluidity of movement.',
        price: 2100,
        category: 'Painting',
        medium: 'Watercolor and ink',
        dimensions: '22" x 30"',
        artist: users[1]._id,
        images: [localImages.artwork8],
        tags: ['abstract', 'fluid', 'movement'],
      status: 'available',
      views: 134,
        likes: [users[0]._id, users[3]._id],
        featured: false
      }
    ]);

    console.log('Created artworks');

    // Create exhibitions
    const exhibitions = await Exhibition.create([
      {
        title: 'Contemporary Perspectives',
        description: 'A curated collection of contemporary artworks exploring modern themes and techniques.',
        location: 'New York Art Gallery',
        startDate: new Date('2024-03-15'),
        endDate: new Date('2024-04-15'),
        organizer: users[0]._id,
        image: localImages.cover1,
        registeredUsers: [users[1]._id, users[2]._id, users[3]._id],
        accessType: 'free'
      },
      {
        title: 'Digital Revolution',
        description: 'Exploring the impact of digital technology on artistic expression.',
        location: 'Los Angeles Modern Art Center',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-05-01'),
        organizer: users[1]._id,
        image: localImages.cover2,
        registeredUsers: [users[0]._id, users[2]._id],
        accessType: 'paid',
        price: 25
      },
      {
        title: 'Sculpture in Motion',
        description: 'A dynamic exhibition showcasing contemporary sculpture and installation art.',
        location: 'Chicago Contemporary Art Museum',
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-06-01'),
        organizer: users[2]._id,
        image: localImages.cover3,
        registeredUsers: [users[0]._id, users[1]._id, users[3]._id],
        accessType: 'free'
      }
    ]);

    console.log('Created exhibitions');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 
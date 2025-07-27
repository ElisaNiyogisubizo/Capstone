import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Palette, 
  Users, 
  Calendar, 
  Award,
  Star,
  TrendingUp
} from 'lucide-react';
import ArtworkCard from '../components/ArtworkCard';
import { Artwork, Exhibition } from '../types';
import { artworkService } from '../services/artwork';

const Home: React.FC = () => {
  const [featuredArtworks, setFeaturedArtworks] = useState<Artwork[]>([]);
  const [upcomingExhibitions, setUpcomingExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured artworks
        const artworksData = await artworkService.getArtworks({ limit: 6 });
        setFeaturedArtworks(artworksData.artworks);
        
        // Mock exhibitions data - replace with actual API call
        setUpcomingExhibitions([
          {
            _id: '1',
            title: 'Contemporary Visions',
            description: 'A showcase of modern artistic expressions',
            startDate: '2024-02-15',
            endDate: '2024-03-15',
            location: 'Downtown Gallery',
            image: '/src/images/1.jpeg',
            featuredArtworks: [],
            organizer: 'The Sundays Art Hub',
            status: 'upcoming',
            createdAt: '2024-01-01'
          }
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { label: 'Active Artists', value: '500+', icon: Users },
    { label: 'Artworks Sold', value: '2,500+', icon: Award },
    { label: 'Happy Collectors', value: '1,200+', icon: Star },
    { label: 'Monthly Growth', value: '25%', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-accent/20 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="font-display font-bold text-4xl lg:text-6xl leading-tight">
                Discover & Collect
                <span className="block text-secondary">Extraordinary Art</span>
              </h1>
              <p className="text-xl text-gray-100 leading-relaxed">
                Connect with talented local artists, explore unique artworks, and become part of a vibrant creative community. Your next favorite piece is waiting to be discovered.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/browse"
                  className="inline-flex items-center justify-center px-8 py-4 bg-secondary text-primary font-semibold rounded-lg hover:bg-secondary/90 transition-colors group"
                >
                  Explore Artworks
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary transition-colors"
                >
                  Join as Artist
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-white/10 rounded-2xl backdrop-blur-sm p-8">
                <img
                  src="/src/images/1.jpeg"
                  alt="Featured artwork"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-secondary text-primary p-4 rounded-lg shadow-lg">
                <Palette className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="font-display font-bold text-3xl text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artworks */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-gray-900 mb-4">
              Featured Artworks
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover exceptional pieces from our talented community of artists
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredArtworks.map((artwork) => (
                <ArtworkCard key={artwork._id} artwork={artwork} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/browse"
              className="inline-flex items-center px-8 py-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors group"
            >
              View All Artworks
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Exhibitions */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl lg:text-4xl text-gray-900 mb-4">
              Upcoming Exhibitions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't miss these exciting upcoming art exhibitions and events
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingExhibitions.map((exhibition) => (
              <div key={exhibition._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={exhibition.image}
                    alt={exhibition.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                      Upcoming
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display font-semibold text-xl text-gray-900 mb-2">
                    {exhibition.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {exhibition.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{new Date(exhibition.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    📍 {exhibition.location}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/exhibitions"
              className="inline-flex items-center px-8 py-4 bg-secondary text-primary font-semibold rounded-lg hover:bg-secondary/90 transition-colors group"
            >
              View All Exhibitions
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display font-bold text-3xl lg:text-4xl mb-6">
            Ready to Start Your Art Journey?
          </h2>
          <p className="text-xl text-gray-100 mb-8 max-w-3xl mx-auto">
            Whether you're an artist looking to showcase your work or an art lover seeking unique pieces, 
            join our growing community today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Join as Artist
            </Link>
            <Link
              to="/browse"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary transition-colors"
            >
              Start Collecting
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
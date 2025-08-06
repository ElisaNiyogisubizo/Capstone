import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Eye, Heart, Palette, Calendar, Users } from 'lucide-react';
import { artworkService } from '../services/artwork';
import { exhibitionService } from '../services/exhibition';
import { userService } from '../services/user';
import { Artwork } from '../types';
import ArtworkCard from '../components/ArtworkCard';
import { defaultImages } from '../utils/images';

const Home: React.FC = () => {
  const [featuredArtworks, setFeaturedArtworks] = useState<Artwork[]>([]);
  const [recentArtworks, setRecentArtworks] = useState<Artwork[]>([]);
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [upcomingExhibitions, setUpcomingExhibitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch featured artworks
      const featuredResponse = await artworkService.getArtworks({ limit: 6 });
      setFeaturedArtworks(featuredResponse.artworks || []);

      // Fetch recent artworks
      const recentResponse = await artworkService.getArtworks({ limit: 8 });
      setRecentArtworks(recentResponse.artworks || []);

      // Fetch top artists
      const artistsResponse = await userService.getUsers({ role: 'artist', limit: 4 });
      setTopArtists(artistsResponse.users || []);

      // Fetch upcoming exhibitions
      const exhibitionsResponse = await exhibitionService.getExhibitions({ limit: 3 });
      setUpcomingExhibitions(exhibitionsResponse.exhibitions || []);

    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          {/* Hero Section */}
          <div className="relative h-96 bg-gray-200">
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
              <div className="max-w-2xl">
                <div className="h-12 bg-gray-300 rounded mb-4"></div>
                <div className="h-6 bg-gray-300 rounded mb-6"></div>
                <div className="h-10 bg-gray-300 rounded w-32"></div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="space-y-12">
              {/* Featured Artworks */}
              <div>
                <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md p-6">
                      <div className="h-48 bg-gray-200 rounded mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/10">
        <div className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url(${defaultImages.cover})`
          }}
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Discover & Collect<br />
              Extraordinary Art
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect with talented local artists, explore unique artworks, and become part of a vibrant creative community. Your next favorite piece is waiting to be discovered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/browse"
                className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Explore Artworks →
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Join as Artist
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Artworks */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Artworks</h2>
            <Link
              to="/browse"
              className="text-primary hover:text-primary/80 font-medium flex items-center"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {featuredArtworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArtworks.map((artwork) => (
                <ArtworkCard key={artwork._id} artwork={artwork} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No featured artworks available</p>
            </div>
          )}
        </section>

        {/* Recent Artworks */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Recent Artworks</h2>
            <Link
              to="/browse"
              className="text-primary hover:text-primary/80 font-medium flex items-center"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {recentArtworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentArtworks.map((artwork) => (
                <ArtworkCard key={artwork._id} artwork={artwork} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent artworks available</p>
            </div>
          )}
        </section>

        {/* Top Artists */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Top Artists</h2>
            <Link
              to="/artists"
              className="text-primary hover:text-primary/80 font-medium flex items-center"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {topArtists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topArtists.map((artist) => (
                <Link
                  key={artist._id}
                  to={`/artists/${artist._id}`}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={artist.avatar || defaultImages.avatar}
                      alt={artist.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{artist.name}</h3>
                      <p className="text-sm text-gray-600">{artist.location}</p>
                      <div className="flex items-center mt-2">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-600">
                          {artist.rating ? artist.rating.toFixed(1) : '0.0'} 
                          ({artist.totalRatings || 0})
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No artists available</p>
            </div>
          )}
        </section>

        {/* Upcoming Exhibitions */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Upcoming Exhibitions</h2>
            <Link
              to="/exhibitions"
              className="text-primary hover:text-primary/80 font-medium flex items-center"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {upcomingExhibitions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingExhibitions.map((exhibition) => (
                <Link
                  key={exhibition._id}
                  to={`/exhibitions/${exhibition._id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video bg-gray-200 relative">
                    <img
                      src={exhibition.image || defaultImages.cover}
                      alt={exhibition.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                      Upcoming
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{exhibition.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{exhibition.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(exhibition.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{exhibition.registeredUsers?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming exhibitions</p>
            </div>
          )}
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-primary to-blue-600 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Showcase Your Art?
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Join our community of artists and start selling your artwork today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/browse"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-colors"
            >
              Explore Artworks
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
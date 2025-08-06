import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Eye, MapPin, Star } from 'lucide-react';
import { VirtualExhibition } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface VirtualExhibitionCardProps {
  exhibition: VirtualExhibition;
}

export const VirtualExhibitionCard: React.FC<VirtualExhibitionCardProps> = ({ exhibition }) => {
  const isActive = new Date() >= new Date(exhibition.startDate) && new Date() <= new Date(exhibition.endDate);
  const isUpcoming = new Date() < new Date(exhibition.startDate);
  const isEnded = new Date() > new Date(exhibition.endDate);

  const getStatusColor = () => {
    if (isActive) return 'bg-green-100 text-green-800';
    if (isUpcoming) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = () => {
    if (isActive) return 'Live Now';
    if (isUpcoming) return 'Upcoming';
    return 'Ended';
  };

  return (
    <Link to={`/virtual-exhibitions/${exhibition._id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={exhibition.coverImage || '/images/artwork-landscape-1.jpeg'}
            alt={exhibition.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          {/* Price Badge */}
          {exhibition.isFree ? (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                Free
              </span>
            </div>
          ) : (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                ${exhibition.price}
              </span>
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300">
            {/* Stats */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-white text-xs">
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{exhibition.views || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{exhibition.attendeeCount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
            {exhibition.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {exhibition.description}
          </p>

          {/* Theme */}
          {exhibition.theme && (
            <div className="mb-3">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {exhibition.theme}
              </span>
            </div>
          )}

          {/* Organizer Info */}
          <div className="flex items-center space-x-2 mb-3">
            <img
              src={exhibition.organizer?.avatar || '/images/artwork-portrait-1.jpeg'}
              alt={exhibition.organizer?.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-600">{exhibition.organizer?.name}</span>
          </div>

          {/* Date and Location */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDistanceToNow(new Date(exhibition.startDate), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>Virtual</span>
            </div>
          </div>

          {/* Tags */}
          {exhibition.tags && exhibition.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {exhibition.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {exhibition.tags.length > 3 && (
                <span className="px-2 py-1 text-xs text-gray-500">
                  +{exhibition.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}; 
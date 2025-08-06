import React from 'react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt = 'User', size = 'md', className = '' }) => {
  const getInitials = (name: string) => {
    if (!name || name.trim() === '') return 'U';
    
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-xs';
      case 'md':
        return 'w-10 h-10 text-sm';
      case 'lg':
        return 'w-12 h-12 text-base';
      case 'xl':
        return 'w-16 h-16 text-lg';
      default:
        return 'w-10 h-10 text-sm';
    }
  };

  const getBackgroundColor = (name: string) => {
    if (!name || name.trim() === '') return 'bg-gray-500';
    
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const displayName = alt || 'User';
  const initials = getInitials(displayName);
  const backgroundColor = getBackgroundColor(displayName);

  if (src) {
    return (
      <img
        src={src}
        alt={displayName}
        className={`rounded-full object-cover ${getSizeClasses()} ${className}`}
        onError={(e) => {
          // Hide the image on error and show initials instead
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.classList.add('bg-gray-200', 'flex', 'items-center', 'justify-center');
            parent.innerHTML = `<span class="font-medium text-gray-600">${initials}</span>`;
          }
        }}
      />
    );
  }

  return (
    <div className={`rounded-full ${backgroundColor} flex items-center justify-center text-white font-medium ${getSizeClasses()} ${className}`}>
      {initials}
    </div>
  );
};

export default Avatar; 
// Local image paths for artwork
export const artworkImages = [
  '/images/artwork-abstract-1.jpeg',
  '/images/artwork-painting-1.jpeg',
  '/images/artwork-sculpture-1.jpeg',
  '/images/artwork-portrait-1.jpeg',
  '/images/artwork-landscape-1.jpeg',
  '/images/artwork-modern-1.jpeg',
  '/images/artwork-contemporary-1.jpeg',
  '/images/artwork-digital-1.jpeg',
  '/images/artwork-impressionist-1.jpeg',
  '/images/artwork-expressionist-1.jpeg',
  '/images/artwork-minimalist-1.jpeg',
  '/images/artwork-surrealist-1.jpeg',
  '/images/artwork-avant-garde-1.jpeg',
];

// Local image paths for avatars
export const avatarImages = [
  '/images/artwork-portrait-1.jpeg',
  '/images/artwork-abstract-1.jpeg',
  '/images/artwork-modern-1.jpeg',
  '/images/artwork-contemporary-1.jpeg',
];

// Local image paths for cover images
export const coverImages = [
  '/images/artwork-landscape-1.jpeg',
  '/images/artwork-surrealist-1.jpeg',
  '/images/artwork-expressionist-1.jpeg',
  '/images/artwork-impressionist-1.jpeg',
];

// Function to get a random image from an array
export const getRandomImage = (imageArray: string[]): string => {
  const randomIndex = Math.floor(Math.random() * imageArray.length);
  return imageArray[randomIndex];
};

// Function to get a random artwork image
export const getRandomArtworkImage = (): string => {
  return getRandomImage(artworkImages);
};

// Function to get a random avatar image
export const getRandomAvatarImage = (): string => {
  return getRandomImage(avatarImages);
};

// Function to get a random cover image
export const getRandomCoverImage = (): string => {
  return getRandomImage(coverImages);
};

// Function to get multiple random artwork images
export const getRandomArtworkImages = (count: number): string[] => {
  const images: string[] = [];
  for (let i = 0; i < count; i++) {
    images.push(getRandomArtworkImage());
  }
  return images;
};

// Default fallback images
export const defaultImages = {
  artwork: '/images/artwork-abstract-1.jpeg',
  avatar: '/images/artwork-portrait-1.jpeg',
  cover: '/images/artwork-landscape-1.jpeg',
  placeholder: '/images/artwork-modern-1.jpeg',
};

// Function to convert database image paths to proper URLs
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return defaultImages.artwork;
  }
  
  // If it's already a proper URL (starts with http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path starting with 'public/', remove the 'public' prefix
  if (imagePath.startsWith('public/')) {
    return imagePath.replace('public/', '/');
  }
  
  // If it's already a proper relative path (starts with '/'), return as is
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // If it's just a filename, assume it's in the images folder
  if (!imagePath.includes('/')) {
    return `/images/${imagePath}`;
  }
  
  // Default fallback
  return defaultImages.artwork;
}; 
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('Cloudinary credentials not found. Image uploads will use fallback images.');
    return false;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  
  console.log('Cloudinary configured successfully');
  return true;
};

// Configure Cloudinary on module load
configureCloudinary();

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

export const cloudinaryService = {
  /**
   * Upload a file buffer to Cloudinary
   */
  async uploadFile(
    fileBuffer: Buffer,
    folder: string = 'artworks',
    options: any = {}
  ): Promise<CloudinaryUploadResult> {
    // Check if Cloudinary is properly configured
    console.log('Checking Cloudinary credentials:');
    console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET');
    console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET');
    console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET');
    
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn('Cloudinary credentials not found. Using fallback image.');
      // Return a fallback image if Cloudinary is not configured
      return {
        public_id: 'fallback',
        secure_url: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg',
        width: 800,
        height: 600,
        format: 'jpeg',
        resource_type: 'image',
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ],
          ...options,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              width: result.width,
              height: result.height,
              format: result.format,
              resource_type: result.resource_type,
            });
          } else {
            reject(new Error('Upload failed'));
          }
        }
      );

      // Create a readable stream from the buffer
      const readableStream = new Readable();
      readableStream.push(fileBuffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  },

  /**
   * Upload multiple files to Cloudinary
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string = 'artworks'
  ): Promise<CloudinaryUploadResult[]> {
    const uploadPromises = files.map(file => 
      this.uploadFile(file.buffer, folder, {
        public_id: `${folder}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      })
    );

    return Promise.all(uploadPromises);
  },

  /**
   * Delete a file from Cloudinary
   */
  async deleteFile(publicId: string): Promise<void> {
    // Check if Cloudinary is properly configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      // If Cloudinary is not configured, just resolve (nothing to delete)
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  },

  /**
   * Get a Cloudinary URL with transformations
   */
  getOptimizedUrl(publicId: string, transformations: any = {}): string {
    return cloudinary.url(publicId, {
      secure: true,
      ...transformations,
    });
  },
}; 
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import artworkRoutes from './routes/artwork';
import userRoutes from './routes/user';
import messageRoutes from './routes/message';
import exhibitionRoutes from './routes/exhibition';
import adminRoutes from './routes/admin';
import virtualExhibitionRoutes from './routes/virtualExhibition';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/order';
import commentRoutes from './routes/comment';
import followRoutes from './routes/follow';
import analyticsRoutes from './routes/analytics';

// Load environment variables
dotenv.config();

// Debug: Check environment variables after dotenv.config()
console.log('Environment variables check (after dotenv.config()):');
console.log('MONGODB_URI available:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
console.log('STRIPE_SECRET_KEY available:', !!process.env.STRIPE_SECRET_KEY);
console.log('STRIPE_SECRET_KEY value (first 10 chars):', process.env.STRIPE_SECRET_KEY?.substring(0, 10) || 'NOT_SET');
console.log('All env vars starting with STRIPE:', Object.keys(process.env).filter(key => key.startsWith('STRIPE')));
console.log('CLOUDINARY_CLOUD_NAME available:', !!process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY available:', !!process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET available:', !!process.env.CLOUDINARY_API_SECRET);
console.log('CLOUDINARY_CLOUD_NAME value:', process.env.CLOUDINARY_CLOUD_NAME || 'NOT_SET');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting removed for development

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/exhibitions', exhibitionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/virtual-exhibitions', virtualExhibitionRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'The Sundays Art Hub API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sundays-art-hub';
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
    
    // Start server after successful DB connection
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Replace this section in your SIGTERM handler:
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

// Initialize database connection
connectDB();

export default app;

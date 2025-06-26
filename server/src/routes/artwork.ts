import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import {
  getArtworks,
  getArtworkById,
  createArtwork,
  updateArtwork,
  deleteArtwork,
  likeArtwork,
  getCategories,
} from '../controllers/artworkController';
import { authenticate, optionalAuthenticate } from '../middleware/auth';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/artworks/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Validation rules
const createArtworkValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('price')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isIn(['Painting', 'Photography', 'Sculpture', 'Digital Art', 'Mixed Media', 'Abstract', 'Portrait', 'Landscape', 'Still Life', 'Street Art', 'Other'])
    .withMessage('Invalid category'),
  body('medium')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Medium must be between 1 and 100 characters'),
  body('dimensions')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Dimensions must be between 1 and 100 characters'),
];

// Routes
router.get('/', optionalAuthenticate, getArtworks);
router.get('/categories', getCategories);
router.get('/:id', optionalAuthenticate, getArtworkById);
router.post('/', authenticate, upload.array('images', 5), createArtworkValidation, createArtwork);
router.put('/:id', authenticate, updateArtwork);
router.delete('/:id', authenticate, deleteArtwork);
router.post('/:id/like', authenticate, likeArtwork);

export default router;
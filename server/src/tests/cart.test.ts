import request from 'supertest';
import app from '../index';
import mongoose from 'mongoose';
import User from '../models/User';
import Artwork from '../models/Artwork';
import Cart from '../models/Cart';

describe('Cart API', () => {
  let testUser: any;
  let testArtwork: any;
  let authToken: string;

  beforeAll(async () => {
    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'community',
    });

    // Create test artist
    const testArtist = await User.create({
      name: 'Test Artist',
      email: 'testartist@example.com',
      password: 'password123',
      role: 'artist',
    });

    // Create test artwork
    testArtwork = await Artwork.create({
      title: 'Test Artwork',
      description: 'A test artwork',
      price: 100,
      category: 'Painting',
      medium: 'Oil on Canvas',
      dimensions: '24x36 inches',
      images: ['https://example.com/image.jpg'],
      artist: testArtist._id,
      status: 'available',
    });

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Artwork.deleteMany({});
    await Cart.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/cart/add', () => {
    it('should add item to cart', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          artworkId: testArtwork._id,
          quantity: 1,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(1);
    });

    it('should not allow adding own artwork to cart', async () => {
      // Create artist user
      const artistUser = await User.create({
        name: 'Artist User',
        email: 'artistuser@example.com',
        password: 'password123',
        role: 'artist',
      });

      const artistLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'artistuser@example.com',
          password: 'password123',
        });

      const artistToken = artistLoginResponse.body.token;

      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${artistToken}`)
        .send({
          artworkId: testArtwork._id,
          quantity: 1,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/cart', () => {
    it('should get user cart', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data).toHaveProperty('totalAmount');
    });
  });

  describe('PUT /api/cart/item/:artworkId', () => {
    it('should update cart item quantity', async () => {
      const response = await request(app)
        .put(`/api/cart/item/${testArtwork._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quantity: 2,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/cart/item/:artworkId', () => {
    it('should remove item from cart', async () => {
      const response = await request(app)
        .delete(`/api/cart/item/${testArtwork._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
}); 
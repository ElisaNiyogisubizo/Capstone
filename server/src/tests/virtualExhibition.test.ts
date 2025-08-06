import request from 'supertest';
import app from '../index';
import mongoose from 'mongoose';
import User from '../models/User';
import VirtualExhibition from '../models/VirtualExhibition';

describe('Virtual Exhibition API', () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    // Create test user
    testUser = await User.create({
      name: 'Test Artist',
      email: 'testartist@example.com',
      password: 'password123',
      role: 'artist',
    });

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testartist@example.com',
        password: 'password123',
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await VirtualExhibition.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/virtual-exhibitions', () => {
    it('should create a virtual exhibition', async () => {
      const exhibitionData = {
        title: 'Test Virtual Exhibition',
        description: 'A test virtual exhibition',
        theme: 'Modern Art',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        isFree: true,
        coverImage: 'https://example.com/image.jpg',
      };

      const response = await request(app)
        .post('/api/virtual-exhibitions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(exhibitionData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(exhibitionData.title);
    });

    it('should not allow non-artists to create exhibitions', async () => {
      const communityUser = await User.create({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
        role: 'community',
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123',
        });

      const userToken = loginResponse.body.token;

      const response = await request(app)
        .post('/api/virtual-exhibitions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Test Exhibition',
          description: 'Test',
          theme: 'Test',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          coverImage: 'https://example.com/image.jpg',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/virtual-exhibitions', () => {
    it('should get all virtual exhibitions', async () => {
      const response = await request(app)
        .get('/api/virtual-exhibitions');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/virtual-exhibitions/:id', () => {
    it('should get a specific virtual exhibition', async () => {
      const exhibition = await VirtualExhibition.findOne();
      
      if (!exhibition) {
        throw new Error('No exhibition found for testing');
      }

      const response = await request(app)
        .get(`/api/virtual-exhibitions/${exhibition._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(exhibition._id.toString());
    });
  });
}); 
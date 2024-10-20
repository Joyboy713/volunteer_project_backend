import express from 'express';
import request from 'supertest';
import multer from 'multer';
import User from '../models/User.js'; // Mock this
import userRoutes from '../routes/userRoutes.js';
import { authMiddleware } from '../Middleware/authmiddleware.js';

// Mock the User model and the authMiddleware
jest.mock('../models/User.js');
jest.mock('../Middleware/authmiddleware.js');

// Mock multer's `single` method
jest.mock('multer', () => {
  return () => ({
    single: jest.fn(() => (req, res, next) => {
      req.file = {
        filename: 'test-profile-picture.jpg',
      };
      next();
    }),
  });
});

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Profile Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile successfully', async () => {
      const user = {
        _id: 'testUserId',
        fullName: 'John Doe',
        profilePicture: '/uploads/profilePictures/old-picture.jpg',
        skills: [],
        preferences: 'Old preference',
        availability: {},
        save: jest.fn().mockResolvedValue(true),
      };

      // Mock the scenario where the user is found by ID.
      User.findById.mockResolvedValue(user);

      // Mock the authMiddleware to simulate an authenticated user
      authMiddleware.mockImplementation((req, res, next) => {
        req.user = { id: 'testUserId' };
        next();
      });

      const res = await request(app)
        .put('/api/users/profile')
        .field('fullName', 'Jane Doe')
        .field('skills', JSON.stringify(['JavaScript', 'Node.js']))
        .attach('profilePicture', Buffer.from('test'), 'test-profile-picture.jpg');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Profile updated successfully');
      expect(res.body.user).toHaveProperty('fullName', 'Jane Doe');
      expect(res.body.user).toHaveProperty('profilePicture', '/uploads/profilePictures/test-profile-picture.jpg');
      expect(res.body.user.skills).toEqual(['JavaScript', 'Node.js']);
    });

    it('should return 404 if user is not found during update', async () => {
      // Mock the scenario where no user is found.
      User.findById.mockResolvedValue(null);

      // Mock the authMiddleware to simulate an authenticated user
      authMiddleware.mockImplementation((req, res, next) => {
        req.user = { id: 'testUserId' };
        next();
      });

      const res = await request(app)
        .put('/api/users/profile')
        .field('fullName', 'Jane Doe');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'User not found');
    });
  });

  describe('POST /api/users/profile/upload', () => {
    it('should upload a profile picture successfully', async () => {
      const user = {
        _id: 'testUserId',
        profilePicture: '/uploads/profilePictures/old-picture.jpg',
        save: jest.fn().mockResolvedValue(true),
      };

      // Mock the scenario where the user is found by ID.
      User.findById.mockResolvedValue(user);

      // Mock the authMiddleware to simulate an authenticated user
      authMiddleware.mockImplementation((req, res, next) => {
        req.user = { id: 'testUserId' };
        next();
      });

      const res = await request(app)
        .post('/api/users/profile/upload')
        .attach('profilePicture', Buffer.from('test'), 'test-profile-picture.jpg');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Profile picture uploaded successfully');
      expect(res.body.user).toHaveProperty('profilePicture', '/uploads/profilePictures/test-profile-picture.jpg');
    });

    it('should return 404 if user is not found during profile picture upload', async () => {
      // Mock the scenario where no user is found.
      User.findById.mockResolvedValue(null);

      // Mock the authMiddleware to simulate an authenticated user
      authMiddleware.mockImplementation((req, res, next) => {
        req.user = { id: 'testUserId' };
        next();
      });

      const res = await request(app)
        .post('/api/users/profile/upload')
        .attach('profilePicture', Buffer.from('test'), 'test-profile-picture.jpg');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'User not found');
    });
  });
});

import request from 'supertest';
import express from 'express';
import router from '../routes/userRoutes.js'; // Adjust path as needed
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

jest.mock('../models/User.js');
jest.mock('jsonwebtoken');
jest.mock('bcrypt');

// Create an Express app instance for testing
const app = express();
app.use(express.json());
app.use('/users', router);

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /users/register', () => {
    it('should register a new user successfully', async () => {
      User.findOne.mockResolvedValue(null);
      User.prototype.save = jest.fn().mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      jwt.sign.mockReturnValue('fakeToken');

      const response = await request(app)
        .post('/users/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          dob: '1990-01-01',
          address: '123 Main St',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(User.findOne).toHaveBeenCalledWith({ email: 'john.doe@example.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(jwt.sign).toHaveBeenCalledWith({ id: expect.any(String) }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    it('should return 400 if the user already exists', async () => {
      User.findOne.mockResolvedValue({ email: 'john.doe@example.com' });

      const response = await request(app)
        .post('/users/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });

    it('should return 500 on server error', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/users/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });

  describe('POST /users/login', () => {
    it('should login a user and return a token', async () => {
      const mockUser = { _id: 'user123', password: 'hashedPassword' };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('fakeToken');

      const response = await request(app)
        .post('/users/login')
        .send({ email: 'john.doe@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.token).toBe('fakeToken');
      expect(User.findOne).toHaveBeenCalledWith({ email: 'john.doe@example.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('should return 400 if the user is not found', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/users/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return 400 if the password is incorrect', async () => {
      const mockUser = { _id: 'user123', password: 'hashedPassword' };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/users/login')
        .send({ email: 'john.doe@example.com', password: 'wrongPassword' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return 500 on server error', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/users/login')
        .send({ email: 'john.doe@example.com', password: 'password123' });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });

  describe('GET /users/profile', () => {
    it('should get the user profile for a logged-in user', async () => {
      const mockUser = { _id: 'user123', firstName: 'John', lastName: 'Doe' };
      User.findById.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/users/profile')
        .set('Authorization', 'Bearer fakeToken');

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe('John');
      expect(User.findById).toHaveBeenCalledWith(expect.any(String));
    });

    it('should return 404 if the user is not found', async () => {
      User.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/users/profile')
        .set('Authorization', 'Bearer fakeToken');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('should return 500 on server error', async () => {
      User.findById.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/users/profile')
        .set('Authorization', 'Bearer fakeToken');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });
});

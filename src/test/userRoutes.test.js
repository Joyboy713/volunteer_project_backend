import express from 'express';
import request from 'supertest';
import multer from 'multer';
import bcrypt from 'bcrypt';
import User from '../models/User.js'; // Mock this
import userRoutes from '../routes/userRoutes.js'; 

// Mock the User model
jest.mock('../models/User.js');

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

// Mock multer's `single` method
jest.mock('multer', () => {
  return () => ({
    single: jest.fn(() => (req, res, next) => next()),
  });
});

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      // Mock the scenario where no existing user is found.
      User.findOne.mockResolvedValue(null);

      // Mock the save method for the new user.
      User.prototype.save.mockResolvedValue({
        _id: 'testUserId',
        email: 'test@example.com',
      });

      const res = await request(app)
        .post('/api/users/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@example.com',
          password: 'password123',
          dob: '1990-01-01',
          address: {
            streetAddress: '123 Test St',
            city: 'Testville',
            state: 'TS',
            zipCode: '12345',
          },
          volunteeringPreferences: {},
          shiftPreferences: {},
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully');
    });

    it('should return 400 if user already exists', async () => {
      // Mock the scenario where an existing user is found.
      User.findOne.mockResolvedValue({ email: 'test@example.com' });

      const res = await request(app)
        .post('/api/users/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'User already exists');
    });
  });

  describe('POST /api/users/login', () => {
    it('should login user successfully', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = {
        _id: 'testUserId',
        email: 'test@example.com',
        password: hashedPassword,
      };

      // Mock the scenario where the user is found.
      User.findOne.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);

      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Login successful');
      expect(res.body).toHaveProperty('user');
    });

    it('should return 400 if email or password is incorrect', async () => {
      // Mock the scenario where no user is found.
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid email or password');
    });
  });

  describe('GET /api/users/profile', () => {
    it('should return the user profile', async () => {
      const user = { _id: 'testUserId', email: 'test@example.com', firstName: 'John' };
      
      // Mock the scenario where the user is found by ID.
      User.findById.mockResolvedValue(user);

      const res = await request(app)
        .get('/api/users/profile')
        .send({ userId: 'testUserId' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('email', 'test@example.com');
    });

    it('should return 404 if user is not found', async () => {
      // Mock the scenario where no user is found.
      User.findById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/users/profile')
        .send({ userId: 'testUserId' });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'User not found');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      const user = {
        _id: 'testUserId',
        firstName: 'John',
        lastName: 'Doe',
        skills: [],
        preferences: 'Old preference',
        availability: { startDate: null, endDate: null },
      };

      // Mock the scenario where the user is found by ID.
      User.findById.mockResolvedValue(user);

      // Mock the save method to simulate updating the user
      User.prototype.save.mockResolvedValue({
        ...user,
        firstName: 'Jane',
        lastName: 'Smith',
      });

      const res = await request(app)
        .put('/api/users/profile')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Profile updated successfully');
      expect(res.body.user).toHaveProperty('firstName', 'Jane');
      expect(res.body.user).toHaveProperty('lastName', 'Smith');
    });

    it('should return 404 if user is not found during update', async () => {
      // Mock the scenario where no user is found.
      User.findById.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/users/profile')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'User not found');
    });
  });
});

import request from 'supertest';
import express from 'express';
import router from '../routes/login.js'; 
import User from '../models/User.js';

jest.mock('../models/User.js'); // Mocking User model

// Create an Express app instance for testing
const app = express();
app.use(express.json());
app.use('/login', router);

describe('Login Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /login', () => {
    it('should return 400 if the email is not found', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email not found');
      expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
    });

    it('should return 400 if the password does not match', async () => {
      const mockUser = { _id: 'user123', email: 'user@example.com', password: 'hashedPassword' };
      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/login')
        .send({ email: 'user@example.com', password: 'wrongPassword' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Wrong password');
      expect(User.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
    });

    it('should return 200 and the user data for a successful login', async () => {
      const mockUser = { _id: 'user123', email: 'user@example.com', password: 'password123' };
      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/login')
        .send({ email: 'user@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user.email).toBe('user@example.com');
      expect(User.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
    });

    it('should return 500 if a server error occurs', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/login')
        .send({ email: 'user@example.com', password: 'password123' });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });
});

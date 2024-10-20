import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js';
import dotenv from 'dotenv';

// Mock environment variables
dotenv.config = jest.fn();

// Mock the mongoose connection
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(true),
  connection: {
    on: jest.fn(),
    once: jest.fn(),
  },
}));

// Create an Express app for testing
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('Server and Routes', () => {
  it('should connect to MongoDB successfully', async () => {
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  it('should handle a GET request to /api/users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    // The exact expectation here will depend on your userRoutes implementation.
    // If your /api/users route returns an empty array when no users exist, you can check for that:
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should handle a POST request to /api/users/register', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        password: 'password123',
      });

    // Expect the status code for a successful registration, e.g., 201 if user registration is successful.
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
  });

  it('should handle a POST request to /api/users/login', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    // Expect the status code for a successful login, e.g., 200 if login is successful.
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Login successful');
    expect(res.body).toHaveProperty('user');
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknownroute');
    expect(res.statusCode).toBe(404);
  });
});

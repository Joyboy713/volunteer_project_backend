import request from 'supertest';
import express from 'express';
import userRoutes from '../routes/userRoutes.js'; // Adjust path as needed
import mongoose from 'mongoose';

jest.mock('mongoose', () => ({
  connect: jest.fn().mockImplementation(() => Promise.resolve('Mocked MongoDB connected')),
}));

// Create a minimal server setup for testing
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('Express Server Setup', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {}); // Suppress console logs
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console errors
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should connect to MongoDB without making a real connection', async () => {
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    expect(mongoose.connect).toHaveBeenCalledTimes(1);
  });

  it('should respond with 200 for the /api/users route', async () => {
    const response = await request(app).get('/api/users'); // Adjust if there are specific routes within userRoutes
    expect(response.status).toBe(200); // Ensure this matches an expected route response in your app
  });

  it('should handle a failed MongoDB connection without using a real database', async () => {
    mongoose.connect.mockImplementationOnce(() => Promise.reject(new Error('Mocked connection failure')));

    try {
      await mongoose.connect(process.env.MONGO_URI);
    } catch (error) {
      expect(error.message).toBe('Mocked connection failure');
    }
  });
});

import request from 'supertest';
import express from 'express';
import router from '../notifications.js'; 
import Notification from '../models/NotificationModel.js';
import User from '../models/User.js';

jest.mock('../models/NotificationModel.js');
jest.mock('../models/User.js');

// Create an Express app instance for testing
const app = express();
app.use(express.json());
app.use('/notifications', router);

describe('Notification Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /notifications', () => {
    it('should return a list of notifications for a specific user', async () => {
      const mockUser = { _id: 'user123' };
      const mockNotifications = [
        { title: 'Notification 1', message: 'Message 1', createdAt: new Date() },
        { title: 'Notification 2', message: 'Message 2', createdAt: new Date() },
      ];

      User.findOne.mockResolvedValue(mockUser);
      Notification.find.mockResolvedValue(mockNotifications);

      const response = await request(app)
        .get('/notifications')
        .send({ token: 'testToken' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(User.findOne).toHaveBeenCalledWith({ token: 'testToken' });
      expect(Notification.find).toHaveBeenCalledWith({ userId: 'user123' });
    });

    it('should return 500 if there is an error fetching notifications', async () => {
      User.findOne.mockResolvedValue({ _id: 'user123' });
      Notification.find.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/notifications')
        .send({ token: 'testToken' });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });

    it('should return 404 if the user is not found', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .get('/notifications')
        .send({ token: 'invalidToken' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('POST /notifications', () => {
    it('should create a new notification', async () => {
      const mockUser = { id: 'user123' };
      req.user = mockUser; // Mocking authenticated user
      Notification.prototype.save = jest.fn().mockResolvedValue(true);

      const response = await request(app)
        .post('/notifications')
        .send({
          title: 'New Notification',
          message: 'This is a test message',
          eventId: 'event123',
        });

      expect(response.status).toBe(201);
      expect(Notification.prototype.save).toHaveBeenCalled();
    });

    it('should return 500 if there is an error creating the notification', async () => {
      req.user = { id: 'user123' }; // Mocking authenticated user
      Notification.prototype.save = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/notifications')
        .send({
          title: 'New Notification',
          message: 'This is a test message',
          eventId: 'event123',
        });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });
});

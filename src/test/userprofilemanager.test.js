import request from 'supertest';
import express from 'express';
import userProfileRoutes from '../userprofilemanagement.js'; // Adjust path as needed
import userProfileController from '../controllers/userProfileManagementController.js';

jest.mock('../controllers/userProfileManagementController.js');

// Create an Express app instance for testing
const app = express();
app.use(express.json());
app.use('/profile', userProfileRoutes);

describe('User Profile Management Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /profile/:username', () => {
    it('should return the user profile for a given username', async () => {
      const mockProfile = { username: 'testUser', fullName: 'Test User' };
      userProfileController.getProfile.mockImplementation((req, res) => {
        res.status(200).json(mockProfile);
      });

      const response = await request(app).get('/profile/testUser');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProfile);
      expect(userProfileController.getProfile).toHaveBeenCalledWith(
        expect.objectContaining({ params: { username: 'testUser' } }),
        expect.any(Object)
      );
    });

    it('should handle errors and return 500 status', async () => {
      userProfileController.getProfile.mockImplementation((req, res) => {
        res.status(500).json({ message: 'Server error' });
      });

      const response = await request(app).get('/profile/testUser');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
      expect(userProfileController.getProfile).toHaveBeenCalled();
    });
  });

  describe('POST /profile/update', () => {
    it('should update the user profile and return success message', async () => {
      userProfileController.updateProfile.mockImplementation((req, res) => {
        res.status(200).json({ message: 'Profile updated successfully' });
      });

      const response = await request(app)
        .post('/profile/update')
        .send({ username: 'testUser', fullName: 'Updated User' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Profile updated successfully');
      expect(userProfileController.updateProfile).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should handle errors during profile update and return 500 status', async () => {
      userProfileController.updateProfile.mockImplementation((req, res) => {
        res.status(500).json({ message: 'Server error' });
      });

      const response = await request(app)
        .post('/profile/update')
        .send({ username: 'testUser', fullName: 'Updated User' });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Server error');
      expect(userProfileController.updateProfile).toHaveBeenCalled();
    });
  });
});

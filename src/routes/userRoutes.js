import express from 'express';
import multer from 'multer';
import User from '../models/User.js';
import { authMiddleware } from '../Middleware/authmiddleware.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Ensure that the directory exists, if not create it
const uploadDir = path.join(__dirname, '../uploads/profilePictures');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for storing profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profilePictures');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Route for getting the user profile (for logged-in users)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route for updating the user profile, including profile picture
router.post('/profile', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  const {
    firstName,
    lastName,
    skills,
    preferences,
    startDate,
    endDate,
  } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's profile details
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.skills = skills ? JSON.parse(skills) : user.skills;
    user.preferences = preferences || user.preferences;
    if (req.file) {
      user.profilePicture = `/uploads/profilePictures/${req.file.filename}`;
    }

    // Update availability dates
    user.availability = {
      startDate: startDate || user.availability.startDate,
      endDate: endDate || user.availability.endDate,
    };

    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

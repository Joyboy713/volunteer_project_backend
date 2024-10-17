import express from 'express';
import bcrypt from 'bcrypt';
import multer from 'multer';
import jwt from 'jsonwebtoken';  // Import JWT for token generation
import User from '../models/User.js'; // Adjust this path to where your User model is located
import { authMiddleware } from '../Middleware/authmiddleware.js'; // Adjust or create this middleware for user authentication if needed
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
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
    cb(null, 'uploads/profilePictures'); // Store files in this folder
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Route for registering a new user
router.post('/register', async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    dob,
    address: { streetAddress, streetAddress2, city, state, zipCode },
    volunteeringPreferences,
    shiftPreferences,
  } = req.body;

  // Check if all required fields are provided
  if (!firstName || !lastName || !email || !password || !dob || !streetAddress || !city || !state || !zipCode || !volunteeringPreferences || !shiftPreferences) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the provided information
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      dob,
      address: {
        streetAddress,
        streetAddress2,
        city,
        state,
        zipCode,
      },
      volunteeringPreferences: {
        tshirts: volunteeringPreferences.tshirts,
        ticketSales: volunteeringPreferences.ticketSales,
        raffleTicketSales: volunteeringPreferences.raffleTicketSales,
        trafficParking: volunteeringPreferences.trafficParking,
        cleanupGrounds: volunteeringPreferences.cleanupGrounds,
      },
      shiftPreferences: {
        morning: shiftPreferences.morning,
        afternoon: shiftPreferences.afternoon,
        evening: shiftPreferences.evening,
      },
    });

    // Save the user to the database
    await newUser.save();
    console.log('User registered successfully:', newUser);  // Log the newly created user
    
    // Generate a JWT token after successful registration
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Respond with success message and the token
    res.status(201).json({ message: 'User registered successfully', token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route for getting the user profile (for logged-in users)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password from the response

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
router.put('/profile', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  const {
    fullName,
    skills,
    preferences,
    availability,
  } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's profile details
    user.fullName = fullName || user.fullName;
    if (req.file) {
      user.profilePicture = `/uploads/profilePictures/${req.file.filename}`;
    }
    user.skills = skills ? JSON.parse(skills) : user.skills;
    user.preferences = preferences || user.preferences;
    user.availability = availability ? JSON.parse(availability) : user.availability;

    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route for uploading a profile picture separately
router.post('/profile/upload', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user profile picture URL/path
    user.profilePicture = `/uploads/profilePictures/${req.file.filename}`;
    await user.save();

    res.json({ message: 'Profile picture uploaded successfully', user });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

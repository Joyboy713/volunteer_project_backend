import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './notifications.js'; // Make sure this file exists
import volunteerHistoryRoutes from './volunteerHistory.js'; // Make sure this file exists

dotenv.config(); // Load environment variables

// Get the port and MongoDB URI from environment variables
const port = process.env.PORT || 5000; // Use PORT from .env, default to 5000 if not set
const mongoUri = process.env.MONGO_URI;

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Example events data
const events = [
  {
    id: 1,
    title: 'Beach Cleanup Drive',
    description: 'Join us for a community beach cleanup. Help keep our oceans clean!',
  },
  {
    id: 2,
    title: 'STEM Workshop for Kids',
    description: 'Teach kids about the wonders of STEM in a fun and interactive way.',
  },
  {
    id: 3,
    title: 'Food Drive for Local Shelters',
    description: 'Help us collect and distribute food to local shelters in need.',
  },
];

// Event Routes
app.get('/api/events', (req, res) => {
  res.json(events);
});

// Notification Routes
app.use('/api/notifications', notificationRoutes);

// Volunteer History Routes
app.use('/api/volunteerHistory', volunteerHistoryRoutes);

// User Routes
app.use('/api/users', userRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

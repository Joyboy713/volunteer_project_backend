import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoute.js'; // Example routes
import volunteerHistoryRoutes from './routes/volunteerHistory.js'; // Example routes
import login from './routes/login.js';

dotenv.config(); // Load environment variables

// Get the port and MongoDB URI from environment variables
const port = process.env.PORT || 5000; // Use PORT from .env, default to 5000 if not set
const mongoUri = process.env.MONGO_URI;

const app = express();

// Middleware to enable CORS, allowing your frontend to communicate with your backend
app.use(cors({
  origin: 'http://localhost:3000', // The address of your React app
}));

// Middleware for parsing JSON bodies
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Event Routes (can be removed if not needed)
app.get('/api/events', (req, res) => {
  res.json(events);
});

// Notification Routes
app.use('/api/users/notifications', notificationRoutes);

// Volunteer History Routes (example)
app.use('/api/volunteerHistory', volunteerHistoryRoutes);

// User Routes
app.use('/api/users', userRoutes);

//const loginRoutes = require('./routes/loginRoutes'); 
app.use('/api/users/login', login);
//app.use('/api/users/login', login);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

/*
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './notifications.js';
import volunteerHistoryRoutes from './routes/volunteerHistory.js'; 
import eventRoutes from './routes/eventRoutes.js';
import volunteerMatchRoutes from './routes/volunteerMatch.js';

import login from './routes/login.js';
//import { route } from './routes/login.js';

dotenv.config(); // Load environment variables

// Get the port and MongoDB URI from environment variables
const port = process.env.PORT || 5000; // Use PORT from .env, default to 5000 if not set
const mongoUri = process.env.MONGO_URI;

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Fixed the trailing slash here
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Remove hardcoded events

// Event Routes
app.use('/api/events', eventRoutes); 

// Notification Routes
app.use('/api/notifications', notificationRoutes);

// Volunteer History Routes
app.use('/api/volunteerHistory', volunteerHistoryRoutes);

// User Routes
app.use('/api/users', userRoutes);

// Volunteer Match
app.use('/api/volunteerMatch', volunteerMatchRoutes);

//Login
//const loginRoutes = require('./routes/loginRoutes'); 
app.use('/api/users/login', login);
//app.use('/api/users/login', login);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
*/
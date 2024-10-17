import express from 'express';
import cors from 'cors';
import notificationRoutes from './src/routes/notifications.js';
import volunteerHistoryRoutes from './src/routes/volunteerHistory.js';
const loginRoutes = require('./src/routes/login.js');
const userProfileRoutes = require('./src/routes/userProfileManagement.js');

const app = express();
const port = process.env.PORT || 5000;

//const express = require('express');
//const bodyParser = require('body-parser');

// Middleware
app.use(cors());
app.use(express.json());
//app.use(bodyParser.json());

// Notification route
app.use('/api/notifications', notificationRoutes);
// Volunteer History Routes
app.use('/api/volunteerHistory', volunteerHistoryRoutes); 
// Login route
app.use('/api/login', loginRoutes);
// User Profile Management route
app.use('/api/profile', userProfileRoutes);
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('MongoDB URI is not defined in the environment variables.');
    process.exit(1); // Exit the application if URI is not provided
}

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('MongoDB connected successfully');
})
.catch((error) => {
    console.error('MongoDB connection error:', error);
});

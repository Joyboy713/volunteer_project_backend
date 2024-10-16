import express from 'express';
import cors from 'cors';
import notificationRoutes from './src/routes/notifications.js';
import volunteerHistoryRoutes from './src/routes/volunteerHistory.js';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Notification route
app.use('/api/notifications', notificationRoutes);
// Volunteer History Routes
app.use('/api/volunteerHistory', volunteerHistoryRoutes); 
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

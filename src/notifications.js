// ./src/controllers/eventController.js (backend)
import express from 'express';
import Event from './models/Event.js';
import Notification from './models/Event.js';
import User from './models/User.js'; // Adjust paths as necessary

const router = express.Router();

export const assignVolunteerToEvent = async (volunteerId, eventId) => {
  try {
    const volunteer = await User.findById(volunteerId);
    const event = await Event.findById(eventId);

    if (!volunteer || !event) {
      throw new Error('Volunteer or Event not found');
    }

    // Create notification
    const notification = new Notification({
      userId: volunteerId,
      title: `Assigned to Event: ${event.eventName}`,
      message: `You have been assigned to the event: ${event.eventName} happening on ${event.eventDate}`,
      eventId,
    });

    await notification.save();
    console.log(`Notification sent to ${volunteer.email}`);
  } catch (error) {
    console.error('Error assigning volunteer to event:', error);
  }
};

export default router;

/*
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { authMiddleware } from './Middleware/authmiddleware.js';  // Protect notifications
import login from './routes/login.js';

const router = express.Router();

// Handle ES module paths for __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to notifications JSON file
const notificationsFilePath = path.join(__dirname, './data/notifications.json');


// Route to get notifications
router.get('/',authMiddleware, (req, res) => {
  console.log('Notifications route hit');
  fs.readFile(notificationsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading notifications file:', err);
      return res.status(500).json({ message: 'Error reading notifications data' });
    }
    try {
      const notifications = JSON.parse(data);
      res.json(notifications);
    } catch (parseErr) {
      console.error('Error parsing notifications JSON:', parseErr);
      res.status(500).json({ message: 'Error parsing notifications data' });
    }
  });
});

/*
router.get('/', authMiddleware, (req, res) => {
  res.json({ message: 'Notifications working!' });
});
// move line 46 here
export default router;
*/
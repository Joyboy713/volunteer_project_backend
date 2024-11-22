import express from 'express';
import Notification from '../models/NotificationModel.js'; // Adjust path as needed
import { authMiddleware } from '../Middleware/authmiddleware.js'; // For authentication
import User from '../models/User.js';

const router = express.Router();

// Get all notifications for a specific user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from authMiddleware
    console.log('Fetching notifications for user ID:', userId);

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    if (!notifications.length) {
      console.log('No notifications found for user:', userId);
      return res.status(200).json([]); // Return an empty array if no notifications exist
    }

    // Map `_id` to `id` for frontend compatibility
    const formattedNotifications = notifications.map((notif) => ({
      id: notif._id,
      title: notif.title,
      message: notif.message,
      isRead: notif.isRead,
      eventId: notif.eventId,
      createdAt: notif.createdAt,
    }));

    res.json(formattedNotifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new notification
router.post('/', authMiddleware, async (req, res) => {
  const { title, message, eventId } = req.body;

  try {
    const userId = req.user.id; // Extracted from authMiddleware
    const newNotification = new Notification({
      userId, // Reference to the authenticated user
      title,
      message,
      eventId,
    });

    const savedNotification = await newNotification.save();
    console.log('Notification created:', savedNotification);
    res.status(201).json(savedNotification);
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

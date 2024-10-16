import express from 'express';
import { getAllEvents, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';

const router = express.Router();

// Get all events
router.get('/', getAllEvents);

// Create a new event
router.post('/', createEvent);

// Update an event (if needed)
router.put('/:id', updateEvent);

// Delete an event (if needed)
router.delete('/:id', deleteEvent);

export default router;
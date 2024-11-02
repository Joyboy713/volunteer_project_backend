// __tests__/eventController.test.js
import { getEvents, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';
import Event from '../models/Event.js';

// Mock the Event model
jest.mock('../models/Event');

describe('Event Controller', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  describe('getEvents', () => {
    test('should return all events', async () => {
      const mockEvents = [{ eventName: 'Event 1' }, { eventName: 'Event 2' }];
      Event.find.mockResolvedValue(mockEvents); // Mock the find method

      const req = {};
      const res = { json: jest.fn() };

      await getEvents(req, res);

      expect(Event.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockEvents);
    });

    test('should return 500 if error occurs', async () => {
      Event.find.mockRejectedValue(new Error('Error retrieving events'));

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error retrieving events' });
    });
  });

  describe('createEvent', () => {
    test('should create a new event and return it', async () => {
      const mockEventData = {
        eventName: 'New Event',
        eventDescription: 'Description',
        location: 'Location',
        eventDate: new Date(),
        urgency: 'High',
        requiredSkills: ['Skill 1'],
      };

      const savedEvent = { ...mockEventData, _id: '1' };
      Event.prototype.save = jest.fn().mockResolvedValue(savedEvent); // Mock save method on Event instance

      const req = { body: mockEventData };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await createEvent(req, res);

      expect(Event.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(savedEvent);
    });

    test('should return 500 if error occurs', async () => {
      Event.prototype.save = jest.fn().mockRejectedValue(new Error('Error creating event'));

      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error creating event' });
    });
  });

  describe('updateEvent', () => {
    test('should update an existing event and return it', async () => {
      const mockEventData = {
        eventName: 'Updated Event',
        eventDescription: 'Updated Description',
        location: 'Updated Location',
        eventDate: new Date(),
        urgency: 'Medium',
        requiredSkills: ['Updated Skill'],
      };

      const updatedEvent = { ...mockEventData, _id: '1' };
      Event.findByIdAndUpdate.mockResolvedValue(updatedEvent); // Mock findByIdAndUpdate method

      const req = { params: { id: '1' }, body: mockEventData };
      const res = { json: jest.fn() };

      await updateEvent(req, res);

      expect(Event.findByIdAndUpdate).toHaveBeenCalledWith('1', mockEventData, { new: true });
      expect(res.json).toHaveBeenCalledWith(updatedEvent);
    });

    test('should return 404 if event is not found', async () => {
      Event.findByIdAndUpdate.mockResolvedValue(null);

      const req = { params: { id: '1' }, body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await updateEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Event not found' });
    });

    test('should return 500 if error occurs', async () => {
      Event.findByIdAndUpdate.mockRejectedValue(new Error('Error updating event'));

      const req = { params: { id: '1' }, body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await updateEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error updating event', error: expect.any(Error) });
    });
  });

  describe('deleteEvent', () => {
    test('should delete an event and return a success message', async () => {
      Event.findByIdAndDelete.mockResolvedValue({ _id: '1' }); // Mock findByIdAndDelete method

      const req = { params: { id: '1' } };
      const res = { json: jest.fn() };

      await deleteEvent(req, res);

      expect(Event.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({ message: 'Event deleted' });
    });

    test('should return 500 if error occurs', async () => {
      Event.findByIdAndDelete.mockRejectedValue(new Error('Error deleting event'));

      const req = { params: { id: '1' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await deleteEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error deleting event' });
    });
  });
});

import { assignVolunteerToEvent } from '../notifications.js'; 
import User from '../models/User.js';
import Event from '../models/Event.js';
import Notification from '../models/Event.js'; // Ensure this is the correct path if Notification is an Event model

// Mock the models to avoid real database interaction
jest.mock('../models/User.js');
jest.mock('../models/Event.js');
jest.mock('../models/Event.js'); // Mocking Notification as Event if necessary

describe('assignVolunteerToEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a notification when volunteer and event are found', async () => {
    const mockVolunteer = { _id: 'volunteer123', email: 'volunteer@example.com' };
    const mockEvent = { _id: 'event123', eventName: 'Charity Run', eventDate: '2024-11-10' };

    User.findById.mockResolvedValue(mockVolunteer);
    Event.findById.mockResolvedValue(mockEvent);
    Notification.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(true),
    }));

    await assignVolunteerToEvent('volunteer123', 'event123');

    expect(User.findById).toHaveBeenCalledWith('volunteer123');
    expect(Event.findById).toHaveBeenCalledWith('event123');
    expect(Notification).toHaveBeenCalledWith({
      userId: 'volunteer123',
      title: 'Assigned to Event: Charity Run',
      message: 'You have been assigned to the event: Charity Run happening on 2024-11-10',
      eventId: 'event123',
    });
    expect(Notification.prototype.save).toHaveBeenCalled();
  });

  it('should throw an error if the volunteer is not found', async () => {
    User.findById.mockResolvedValue(null);
    Event.findById.mockResolvedValue({ _id: 'event123', eventName: 'Charity Run', eventDate: '2024-11-10' });

    console.error = jest.fn(); // Suppress console error output for this test

    await assignVolunteerToEvent('volunteer123', 'event123');

    expect(User.findById).toHaveBeenCalledWith('volunteer123');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error assigning volunteer to event:'));
  });

  it('should throw an error if the event is not found', async () => {
    User.findById.mockResolvedValue({ _id: 'volunteer123', email: 'volunteer@example.com' });
    Event.findById.mockResolvedValue(null);

    console.error = jest.fn(); // Suppress console error output for this test

    await assignVolunteerToEvent('volunteer123', 'event123');

    expect(Event.findById).toHaveBeenCalledWith('event123');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error assigning volunteer to event:'));
  });

  it('should handle errors during notification save', async () => {
    const mockVolunteer = { _id: 'volunteer123', email: 'volunteer@example.com' };
    const mockEvent = { _id: 'event123', eventName: 'Charity Run', eventDate: '2024-11-10' };

    User.findById.mockResolvedValue(mockVolunteer);
    Event.findById.mockResolvedValue(mockEvent);
    Notification.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error('Save failed')),
    }));

    console.error = jest.fn(); // Suppress console error output for this test

    await assignVolunteerToEvent('volunteer123', 'event123');

    expect(Notification.prototype.save).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error assigning volunteer to event:'));
  });
});

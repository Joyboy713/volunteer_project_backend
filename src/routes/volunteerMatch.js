import express from 'express';
import User from '../models/User.js';
import Event from '../models/Event.js';
import VolunteerHistory from '../models/VolunteerHistory.js'; // Import the VolunteerHistory model

const router = express.Router();

// Fetch matched volunteers for an event with prioritization
router.get('/matchByEvent/:eventId', async (req, res) => {
  const { eventId } = req.params;

  try {
    // Find the event by its ID
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Extract the required skills for the event
    const { requiredSkills } = event;

    // Find volunteers whose preferences match the event's required skills
    const matchedVolunteers = await User.find({
      $or: requiredSkills.map(skill => ({
        [`volunteeringPreferences.${skill}`]: {
          $in: ['Would love to!', 'Would like to.', "Wouldn't mind helping."],
        },
      })),
    });

    // Sort the matched volunteers based on preference priority
    const sortedVolunteers = matchedVolunteers.sort((a, b) => {
      const priority = {
        "Would love to!": 1,
        "Would like to.": 2,
        "Wouldn't mind helping.": 3,
      };

      const aPreference = requiredSkills.map(skill => a.volunteeringPreferences[skill]).sort((x, y) => priority[x] - priority[y])[0];
      const bPreference = requiredSkills.map(skill => b.volunteeringPreferences[skill]).sort((x, y) => priority[x] - priority[y])[0];

      return priority[aPreference] - priority[bPreference];
    });

    res.status(200).json(sortedVolunteers);
  } catch (error) {
    console.error('Error fetching matched volunteers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save a volunteer-event match with prioritization
router.post('/saveMatch', async (req, res) => {
  const { eventId, volunteerIds } = req.body; // Expect an array of volunteer IDs

  try {
    // Find the event by its ID
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Find volunteers using their IDs
    const volunteers = await User.find({ _id: { $in: volunteerIds } });

    // Sort volunteers based on their preferences for the event's required skills
    const sortedVolunteers = volunteers.sort((a, b) => {
      const priority = {
        "Would love to!": 1,
        "Would like to.": 2,
        "Wouldn't mind helping.": 3,
      };

      const aPreference = event.requiredSkills.map(skill => a.volunteeringPreferences[skill]).sort((x, y) => priority[x] - priority[y])[0];
      const bPreference = event.requiredSkills.map(skill => b.volunteeringPreferences[skill]).sort((x, y) => priority[x] - priority[y])[0];

      return priority[aPreference] - priority[bPreference];
    });

    // Save the sorted matched volunteers into the VolunteerHistory collection
    const savedMatches = await Promise.all(
      sortedVolunteers.map(async (volunteer) => {
        const newMatch = new VolunteerHistory({
          volunteerId: volunteer._id,
          eventId,
          eventName: event.eventName,
          volunteerName: `${volunteer.firstName} ${volunteer.lastName}`,
          eventDate: event.eventDate,
          location: event.location,
          urgency: event.urgency,
          requiredSkills: event.requiredSkills,
          matchDate: new Date(),
        });

        return newMatch.save();
      })
    );

    res.status(201).json({
      message: 'Volunteers matched, prioritized, and saved to the history successfully!',
      matches: savedMatches,
    });
  } catch (error) {
    console.error('Error saving volunteer-event matches:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

// __tests__/volunteerMatch.test.js
import request from 'supertest';
import express from 'express';
import volunteerMatchRoutes from '../routes/volunteerMatch.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import VolunteerHistory from '../models/VolunteerHistory.js';

jest.mock('../models/User');
jest.mock('../models/Event');
jest.mock('../models/VolunteerHistory');

const app = express();
app.use(express.json());
app.use('/api/volunteerMatch', volunteerMatchRoutes);

describe('Volunteer Matching API - Full Coverage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Helper Function Coverage and Route Tests', () => {
    test('should return 400 for non-24-character event ID in GET /matchByEvent', async () => {
      const response = await request(app).get('/api/volunteerMatch/matchByEvent/invalidID');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid event ID');
    });

    test('should return 400 for non-24-character event ID in POST /saveMatch', async () => {
      const response = await request(app)
        .post('/api/volunteerMatch/saveMatch')
        .send({
          eventId: 'invalidID',
          volunteerIds: ['64b8f9c01234567890abc123'],
        });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid event ID');
    });

    test('should return 404 if event is not found in GET /matchByEvent/:eventId', async () => {
      Event.findById.mockResolvedValue(null);
      const response = await request(app).get('/api/volunteerMatch/matchByEvent/64b8f9c01234567890abcdef');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Event not found');
    });

    test('should return 404 if event is not found in POST /saveMatch', async () => {
      Event.findById.mockResolvedValue(null);
      const response = await request(app)
        .post('/api/volunteerMatch/saveMatch')
        .send({
          eventId: '64b8f9c01234567890abcdef',
          volunteerIds: ['64b8f9c01234567890abc123'],
        });
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Event not found');
    });

    test('should handle volunteers with mixed preferences and skills in GET /matchByEvent', async () => {
      Event.findById.mockResolvedValue({
        _id: '64b8f9c01234567890abcdef',
        requiredSkills: ['Safety Awareness', 'Teamwork'],
      });

      User.find.mockResolvedValue([
        {
          _id: '64b8f9c01234567890abc001',
          firstName: 'Alice',
          lastName: 'Smith',
          skills: ['Teamwork'],
          volunteeringPreferences: { Teamwork: 'Would like to.' },
        },
        {
          _id: '64b8f9c01234567890abc002',
          firstName: 'Bob',
          lastName: 'Brown',
          skills: ['Safety Awareness'],
          volunteeringPreferences: { 'Safety Awareness': 'Would love to!' },
        },
      ]);

      const response = await request(app).get('/api/volunteerMatch/matchByEvent/64b8f9c01234567890abcdef');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].firstName).toBe('Bob'); // High preference
      expect(response.body[1].firstName).toBe('Alice');
    });

    test('should return 500 if an error occurs in GET /matchByEvent/:eventId', async () => {
      Event.findById.mockRejectedValue(new Error('Server error'));
      const response = await request(app).get('/api/volunteerMatch/matchByEvent/64b8f9c01234567890abcdef');
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Server error');
    });

    test('should save matched volunteers with prioritization in POST /saveMatch', async () => {
      Event.findById.mockResolvedValue({
        _id: '64b8f9c01234567890abcdef',
        eventName: 'Test Event',
        requiredSkills: ['Teamwork'],
        eventDate: new Date(),
        location: 'Test Location',
        urgency: 'High',
      });

      User.find.mockResolvedValue([
        {
          _id: '64b8f9c01234567890abc003',
          firstName: 'Charlie',
          lastName: 'Johnson',
          skills: ['Teamwork'],
          volunteeringPreferences: { Teamwork: 'Would love to!' },
        },
        {
          _id: '64b8f9c01234567890abc004',
          firstName: 'Dana',
          lastName: 'Miller',
          skills: [],
          volunteeringPreferences: { Teamwork: 'Would like to.' },
        },
      ]);

      VolunteerHistory.prototype.save = jest.fn().mockResolvedValue({
        _id: 'history123',
        volunteerId: '64b8f9c01234567890abc003',
        eventId: '64b8f9c01234567890abcdef',
        eventName: 'Test Event',
        volunteerName: 'Charlie Johnson',
        matchDate: new Date(),
      });

      const response = await request(app)
        .post('/api/volunteerMatch/saveMatch')
        .send({
          eventId: '64b8f9c01234567890abcdef',
          volunteerIds: ['64b8f9c01234567890abc003', '64b8f9c01234567890abc004'],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Volunteers matched, prioritized, and saved to the history successfully!');
      expect(response.body.matches).toBeInstanceOf(Array);
      expect(response.body.matches[0].volunteerId).toBe('64b8f9c01234567890abc003');
    });

    test('should return 500 if an error occurs during save in POST /saveMatch', async () => {
      Event.findById.mockResolvedValue({
        _id: '64b8f9c01234567890abcdef',
        eventName: 'Test Event',
        requiredSkills: ['Teamwork'],
      });

      User.find.mockResolvedValue([
        {
          _id: '64b8f9c01234567890abc003',
          firstName: 'Charlie',
          lastName: 'Johnson',
          skills: ['Teamwork'],
          volunteeringPreferences: { Teamwork: 'Would love to!' },
        },
      ]);

      VolunteerHistory.prototype.save = jest.fn().mockRejectedValue(new Error('Server error'));

      const response = await request(app)
        .post('/api/volunteerMatch/saveMatch')
        .send({
          eventId: '64b8f9c01234567890abcdef',
          volunteerIds: ['64b8f9c01234567890abc003'],
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Server error');
    });

    test('should handle volunteers without skills or preferences in GET /matchByEvent', async () => {
      Event.findById.mockResolvedValue({
        _id: '64b8f9c01234567890abcdef',
        requiredSkills: ['Teamwork'],
      });

      User.find.mockResolvedValue([
        {
          _id: '64b8f9c01234567890abc005',
          firstName: 'Eve',
          lastName: 'Taylor',
          skills: [],
          volunteeringPreferences: {},
        },
      ]);

      const response = await request(app).get('/api/volunteerMatch/matchByEvent/64b8f9c01234567890abcdef');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].firstName).toBe('Eve');
    });
  });
});

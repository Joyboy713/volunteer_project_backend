import request from 'supertest';
import express from 'express';
import reportsRouter, { getDataForReport } from '../routes/reportsRoute.js';
import VolunteerHistory from '../models/VolunteerHistory.js';
import Event from '../models/Event.js';
import { generatePDF, generateCSV } from '../utils/reportGenerator.js';

jest.mock('../models/VolunteerHistory.js');
jest.mock('../models/Event.js');
jest.mock('../utils/reportGenerator.js');

const app = express();
app.use(express.json());
app.use('/reports', reportsRouter);

describe('Reports Route Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDataForReport', () => {
    it('should fetch volunteer history with mock populated fields', async () => {
      const mockData = [
        {
          eventId: { eventName: 'Event A', eventDate: '2024-11-01' },
          volunteerId: { firstName: 'John', lastName: 'Doe' },
        },
      ];
      VolunteerHistory.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData),
      });

      const result = await getDataForReport('volunteerHistory');
      expect(result).toEqual(mockData);
      expect(VolunteerHistory.find).toHaveBeenCalled();
      expect(VolunteerHistory.find().populate).toHaveBeenCalledWith(
        'volunteerId',
        'firstName lastName email'
      );
      expect(VolunteerHistory.find().populate).toHaveBeenCalledWith(
        'eventId',
        'eventName eventDate location urgency requiredSkills'
      );
    });

    it('should fetch event data and map participants correctly', async () => {
      const mockEvents = [
        { _id: '1', eventName: 'Event B', eventDate: '2024-11-01' },
      ];
      const mockVolunteerHistories = [
        { volunteerId: { firstName: 'Jane', lastName: 'Doe' } },
      ];
      Event.find.mockResolvedValue(mockEvents);
      VolunteerHistory.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockVolunteerHistories),
      });

      const result = await getDataForReport('events');
      expect(result).toEqual([
        {
          eventDetails: {
            eventName: 'Event B',
            eventDate: '2024-11-01',
            location: undefined,
            urgency: undefined,
            requiredSkills: undefined,
          },
          participants: [{ volunteerName: 'Jane Doe' }],
        },
      ]);
      expect(Event.find).toHaveBeenCalled();
      expect(VolunteerHistory.find).toHaveBeenCalledWith({ eventId: '1' });
    });

    it('should return an empty array if no volunteer history is found', async () => {
      VolunteerHistory.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await getDataForReport('volunteerHistory');
      expect(result).toEqual([]);
      expect(VolunteerHistory.find).toHaveBeenCalled();
    });

    it('should return an empty array if no events are found', async () => {
      Event.find.mockResolvedValue([]);
      const result = await getDataForReport('events');
      expect(result).toEqual([]);
      expect(Event.find).toHaveBeenCalled();
    });

    it('should throw an error for invalid report type', async () => {
      await expect(getDataForReport('invalidType')).rejects.toThrow(
        'Invalid report type.'
      );
    });
  });

  describe('GET /:reportType', () => {
    it('should return 400 for invalid report type', async () => {
      const response = await request(app).get('/reports/invalidType?format=pdf');
      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Invalid report type. Valid types are "volunteerHistory" or "events".'
      );
    });

    it('should return 400 for invalid format', async () => {
      const response = await request(app).get(
        '/reports/volunteerHistory?format=invalid'
      );
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid format. Use "pdf" or "csv".');
    });

    it('should return 404 if no volunteer history is found', async () => {
      VolunteerHistory.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      const response = await request(app).get(
        '/reports/volunteerHistory?format=pdf'
      );
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No volunteerHistory data found.');
    });

    it('should generate a PDF for mock volunteerHistory', async () => {
      const mockData = [
        {
          eventId: { eventName: 'Event A', eventDate: '2024-11-01' },
          volunteerId: { firstName: 'John', lastName: 'Doe' },
        },
      ];
      VolunteerHistory.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData),
      });
      generatePDF.mockResolvedValue(Buffer.from('PDF content'));

      const response = await request(app).get(
        '/reports/volunteerHistory?format=pdf'
      );
      expect(response.status).toBe(200);
      expect(response.header['content-type']).toBe('application/pdf');
      expect(response.header['content-disposition']).toBe(
        'attachment; filename=volunteerHistory-Report.pdf'
      );
      expect(generatePDF).toHaveBeenCalledWith(mockData, 'volunteerHistory');
    });

    it('should generate a CSV for mock volunteerHistory', async () => {
      const mockData = [
        {
          eventId: { eventName: 'Event A', eventDate: '2024-11-01' },
          volunteerId: { firstName: 'John', lastName: 'Doe' },
        },
      ];
      VolunteerHistory.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData),
      });
      generateCSV.mockResolvedValue(Buffer.from('CSV content'));

      const response = await request(app).get(
        '/reports/volunteerHistory?format=csv'
      );
      expect(response.status).toBe(200);
      expect(response.header['content-type']).toBe('text/csv');
      expect(response.header['content-disposition']).toBe(
        'attachment; filename=volunteerHistory-Report.csv'
      );
      expect(generateCSV).toHaveBeenCalledWith(mockData, 'volunteerHistory');
    });

    it('should handle server errors gracefully', async () => {
      VolunteerHistory.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app).get(
        '/reports/volunteerHistory?format=pdf'
      );
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error generating report.');
    });

    it('should generate a PDF for mock events', async () => {
      const mockEvents = [
        { _id: '1', eventName: 'Event B', eventDate: '2024-11-01' },
      ];
      const mockVolunteerHistories = [
        { volunteerId: { firstName: 'Jane', lastName: 'Doe' } },
      ];
      Event.find.mockResolvedValue(mockEvents);
      VolunteerHistory.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockVolunteerHistories),
      });
      generatePDF.mockResolvedValue(Buffer.from('PDF content'));

      const response = await request(app).get('/reports/events?format=pdf');
      expect(response.status).toBe(200);
      expect(response.header['content-type']).toBe('application/pdf');
      expect(response.header['content-disposition']).toBe(
        'attachment; filename=events-Report.pdf'
      );
      expect(generatePDF).toHaveBeenCalledWith(
        [
          {
            eventDetails: { eventName: 'Event B', eventDate: '2024-11-01' },
            participants: [{ volunteerName: 'Jane Doe' }],
          },
        ],
        'events'
      );
    });
  });
});

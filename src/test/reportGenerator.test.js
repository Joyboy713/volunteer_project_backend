import { generatePDF, generateCSV } from '../utils/reportGenerator';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { Parser } from 'json2csv';

jest.mock('pdfkit');
jest.mock('stream');
jest.mock('json2csv', () => ({ Parser: jest.fn() }));

describe('Report Generation Tests', () => {
  let streamMock;

  beforeEach(() => {
    streamMock = { on: jest.fn(), pipe: jest.fn(), end: jest.fn() };
    PDFDocument.mockReturnValue({
      pipe: streamMock.pipe,
      fontSize: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnThis(),
      moveDown: jest.fn().mockReturnThis(),
      end: streamMock.end,
    });
    PassThrough.mockReturnValue(streamMock);
    streamMock.on.mockImplementation((event, callback) => {
      if (event === 'data') callback(Buffer.from('chunk'));
      if (event === 'end') callback();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePDF', () => {
    it('should handle empty data gracefully', async () => {
      const result = await generatePDF([], 'volunteerHistory');
      expect(result).toBeInstanceOf(Buffer);
      expect(PDFDocument).toHaveBeenCalled();
      expect(streamMock.pipe).toHaveBeenCalled();
    });

    it('should throw an error if data is missing required fields in generatePDF', async () => {
      const invalidData = [
        { volunteerId: { firstName: 'John' } }, // Missing eventId
      ];
      await expect(generatePDF(invalidData, 'volunteerHistory')).rejects.toThrow(
        'Invalid data format'
      );
    });

    it('should throw an error for unsupported report types in generatePDF', async () => {
      const mockData = [];
      await expect(generatePDF(mockData, 'unknownType')).rejects.toThrow(
        'Invalid report type'
      );
    });

    it('should handle stream errors gracefully in generatePDF', async () => {
      const mockData = [
        {
          eventId: { eventName: 'Event A', eventDate: '2024-11-01' },
          volunteerId: { firstName: 'John', lastName: 'Doe' },
        },
      ];

      const streamErrorMock = { on: jest.fn(), pipe: jest.fn(), end: jest.fn() };
      streamErrorMock.on.mockImplementation((event, callback) => {
        if (event === 'error') callback(new Error('Stream error'));
      });
      PassThrough.mockReturnValue(streamErrorMock);

      await expect(generatePDF(mockData, 'volunteerHistory')).rejects.toThrow(
        'Stream error'
      );
    });

    it('should generate a PDF for events with valid data', async () => {
      const mockData = [
        {
          eventDetails: {
            eventName: 'Event B',
            eventDescription: 'Description B',
            eventDate: '2024-11-01',
            location: 'Location B',
            urgency: 'Medium',
          },
          participants: [{ volunteerName: 'Jane Doe' }],
        },
      ];
      const result = await generatePDF(mockData, 'events');
      expect(result).toBeInstanceOf(Buffer);
      expect(PDFDocument).toHaveBeenCalled();
      expect(streamMock.pipe).toHaveBeenCalled();
    });
  });

  describe('generateCSV', () => {
    it('should handle empty data gracefully', async () => {
      const parseMock = jest.fn().mockReturnValue('');
      Parser.mockReturnValue({ parse: parseMock });

      const result = await generateCSV([], 'volunteerHistory');
      expect(result).toBeInstanceOf(Buffer);
      expect(Parser).toHaveBeenCalled();
      expect(parseMock).toHaveBeenCalledWith([]);
    });

    it('should throw an error if data is missing required fields in generateCSV', async () => {
      const invalidData = [
        { volunteerId: { firstName: 'Jane' } }, // Missing eventId
      ];
      await expect(generateCSV(invalidData, 'volunteerHistory')).rejects.toThrow(
        'Invalid data format'
      );
    });

    it('should throw an error for unsupported report types in generateCSV', async () => {
      const mockData = [];
      await expect(generateCSV(mockData, 'unknownType')).rejects.toThrow(
        'Invalid report type'
      );
    });

    it('should generate a CSV for volunteer history without accessing the database', async () => {
      const mockData = [
        {
          eventId: {
            eventName: 'Event A',
            eventDate: '2024-11-01',
            location: 'Location A',
            urgency: 'High',
          },
          volunteerId: { firstName: 'John', lastName: 'Doe' },
        },
      ];
      const parseMock = jest.fn().mockReturnValue('csv_content');
      Parser.mockReturnValue({ parse: parseMock });

      const result = await generateCSV(mockData, 'volunteerHistory');
      expect(result).toBeInstanceOf(Buffer);
      expect(Parser).toHaveBeenCalledWith({ fields: expect.any(Array) });
      expect(parseMock).toHaveBeenCalled();
    });

    it('should generate a CSV for events with valid data', async () => {
      const mockData = [
        {
          eventDetails: {
            eventName: 'Event B',
            eventDescription: 'Description B',
            eventDate: '2024-11-01',
            location: 'Location B',
            urgency: 'Medium',
          },
          participants: [{ volunteerName: 'Jane Doe' }],
        },
      ];
      const parseMock = jest.fn().mockReturnValue('csv_content');
      Parser.mockReturnValue({ parse: parseMock });

      const result = await generateCSV(mockData, 'events');
      expect(result).toBeInstanceOf(Buffer);
      expect(Parser).toHaveBeenCalledWith({ fields: expect.any(Array) });
      expect(parseMock).toHaveBeenCalled();
    });
  });
});
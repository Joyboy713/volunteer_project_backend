import express from 'express';
import { generatePDF, generateCSV } from '../utils/reportGenerator.js';
import VolunteerHistory from '../models/VolunteerHistory.js';
import Event from '../models/Event.js';

const router = express.Router();

export const getDataForReport = async (reportType) => {
  if (reportType === 'volunteerHistory') {
    return await VolunteerHistory.find()
      .populate('volunteerId', 'firstName lastName email')
      .populate('eventId', 'eventName eventDate location urgency requiredSkills')
      .exec();
  } else if (reportType === 'events') {
    const events = await Event.find().exec();
    return Promise.all(
      events.map(async (event) => {
        const volunteerHistories = await VolunteerHistory.find({ eventId: event._id })
          .populate('volunteerId', 'firstName lastName')
          .exec();
        return {
          eventDetails: {
            eventName: event.eventName,
            eventDescription: event.eventDescription,
            eventDate: event.eventDate,
            location: event.location,
            urgency: event.urgency,
            requiredSkills: event.requiredSkills,
          },
          participants: volunteerHistories.map((vh) => ({
            volunteerName: `${vh.volunteerId?.firstName || 'Unknown'} ${vh.volunteerId?.lastName || ''}`,
          })),
        };
      })
    );
  } else {
    throw new Error('Invalid report type.');
  }
};

router.get('/:reportType', async (req, res) => {
  const { reportType } = req.params;
  const { format } = req.query;

  // Validate report type and format
  if (!['volunteerHistory', 'events'].includes(reportType)) {
    return res.status(400).json({ message: 'Invalid report type. Valid types are "volunteerHistory" or "events".' });
  }

  if (!['pdf', 'csv'].includes(format)) {
    return res.status(400).json({ message: 'Invalid format. Use "pdf" or "csv".' });
  }

  try {
    const data = await getDataForReport(reportType);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: `No ${reportType} data found.` });
    }

    if (format === 'pdf') {
      const pdfBuffer = await generatePDF(data, reportType);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${reportType}-Report.pdf`);
      return res.send(pdfBuffer);
    } else if (format === 'csv') {
      const csvBuffer = await generateCSV(data, reportType);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${reportType}-Report.csv`);
      return res.send(csvBuffer);
    }
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report.' });
  }
});

export default router;

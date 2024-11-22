import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { Parser } from 'json2csv';

export const generatePDF = (data, reportType) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = new PassThrough(); // Stream to send the PDF directly to the client

    let chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks))); // Return the PDF as a buffer

    doc.pipe(stream);

    doc.fontSize(18).text(`${reportType === 'volunteerHistory' ? 'Volunteer History Report' : 'Event Report'}`, { align: 'center' });
    doc.moveDown();

    if (reportType === 'volunteerHistory') {
      data.forEach((entry) => {
        const { eventId, volunteerId } = entry;
        doc.fontSize(14).text(`Event Name: ${eventId?.eventName || 'Unknown'}`);
        doc.text(`Volunteer Name: ${volunteerId?.firstName || 'Unknown'} ${volunteerId?.lastName || ''}`);
        doc.text(`Event Date: ${eventId?.eventDate ? new Date(eventId.eventDate).toLocaleDateString() : 'Invalid Date'}`);
        doc.text(`Location: ${eventId?.location || 'Unknown'}`);
        doc.text(`Urgency: ${eventId?.urgency || 'N/A'}`);
        doc.moveDown();
      });
    } else if (reportType === 'events') {
      data.forEach((entry) => {
        const { eventDetails, participants } = entry;
        doc.fontSize(14).text(`Event Name: ${eventDetails.eventName}`);
        doc.text(`Description: ${eventDetails.eventDescription}`);
        doc.text(`Date: ${eventDetails.eventDate ? new Date(eventDetails.eventDate).toLocaleDateString() : 'Invalid Date'}`);
        doc.text(`Location: ${eventDetails.location}`);
        doc.text(`Urgency: ${eventDetails.urgency}`);
        doc.text('Participants:');
        participants.forEach((participant) => {
          doc.text(`- ${participant.volunteerName}`);
        });
        doc.moveDown();
      });
    }

    doc.end();
    stream.on('error', (err) => reject(err));
  });
};

export const generateCSV = (data, reportType) => {
  return new Promise((resolve, reject) => {
    try {
      const fields =
        reportType === 'volunteerHistory'
          ? ['Event Name', 'Volunteer Name', 'Event Date', 'Location', 'Urgency']
          : ['Event Name', 'Description', 'Date', 'Location', 'Urgency', 'Participants'];

      const csvData =
        reportType === 'volunteerHistory'
          ? data.map((entry) => ({
              'Event Name': entry.eventId?.eventName || 'Unknown',
              'Volunteer Name': `${entry.volunteerId?.firstName || 'Unknown'} ${entry.volunteerId?.lastName || ''}`,
              'Event Date': entry.eventId?.eventDate ? new Date(entry.eventId.eventDate).toLocaleDateString() : 'Invalid Date',
              'Location': entry.eventId?.location || 'Unknown',
              'Urgency': entry.eventId?.urgency || 'N/A',
            }))
          : data.map((entry) => ({
              'Event Name': entry.eventDetails.eventName,
              'Description': entry.eventDetails.eventDescription,
              'Date': entry.eventDetails.eventDate ? new Date(entry.eventDetails.eventDate).toLocaleDateString() : 'Invalid Date',
              'Location': entry.eventDetails.location,
              'Urgency': entry.eventDetails.urgency,
              'Participants': entry.participants.map((p) => p.volunteerName).join(', '),
            }));

      const parser = new Parser({ fields });
      const csv = parser.parse(csvData);
      resolve(Buffer.from(csv)); // Return the CSV as a buffer
    } catch (err) {
      reject(err);
    }
  });
};
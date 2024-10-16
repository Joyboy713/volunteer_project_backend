import request from 'supertest';
import app from '../server.js'; // Assuming the server is being exported for testing

describe('Event API', () => {

    it('GET /api/events - success', async () => {
        const response = await request(app).get('/api/events');
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    it('POST /api/events - success', async () => {
        const newEvent = {
            eventName: "Event 3",
            requiredSkills: ["Leadership"],
            location: "Dallas",
            urgency: "Low",
            eventDescription: "New event description",
            eventDate: "2023-12-15"
        };

        const response = await request(app).post('/api/events').send(newEvent);
        expect(response.statusCode).toBe(201);
        expect(response.body.eventName).toBe(newEvent.eventName);
    });
});
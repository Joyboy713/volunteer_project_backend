// Sample hardcoded events for now (in a real-world application, these will come from the database)
let events = [
    { id: 1, eventName: "Event 1", requiredSkills: ["Coding"], location: "Houston", urgency: "High", eventDescription: "Description for Event 1", eventDate: "2023-10-10" },
    { id: 2, eventName: "Event 2", requiredSkills: ["Teamwork"], location: "Austin", urgency: "Medium", eventDescription: "Description for Event 2", eventDate: "2023-11-01" },
];

// Get all events
export const getAllEvents = (req, res) => {
    res.json(events);
};

// Create a new event
export const createEvent = (req, res) => {
    const newEvent = req.body;
    const eventId = events.length + 1;
    const event = { id: eventId, ...newEvent };
    events.push(event);
    res.status(201).json(event);
};

// Update an event (for future implementation)
export const updateEvent = (req, res) => {
    const { id } = req.params;
    const eventIndex = events.findIndex(e => e.id === parseInt(id));
    
    if (eventIndex !== -1) {
        events[eventIndex] = { ...events[eventIndex], ...req.body };
        res.status(200).json(events[eventIndex]);
    } else {
        res.status(404).json({ message: "Event not found" });
    }
};

// Delete an event (for future implementation)
export const deleteEvent = (req, res) => {
    const { id } = req.params;
    events = events.filter(e => e.id !== parseInt(id));
    res.status(200).json({ message: "Event deleted" });
};

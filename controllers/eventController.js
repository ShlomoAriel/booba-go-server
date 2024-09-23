// controllers/eventController.js

const Event = require('../models/Event');

// Create a new event
const createEvent = async (req, res) => {
  const { name, value } = req.body;

  // Validate input
  if (!name || !value) {
    return res.status(400).json({ message: 'Name and value are required' });
  }

  try {
    // Create a new event and save it to the database
    const event = new Event({ name, value });
    await event.save();
    res.status(201).json(event); // Respond with the newly created event
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get an event by ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event); // Respond with the event data
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find(); // Fetch all events from the database
    res.json(events); // Respond with the list of events
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createEvent, getEventById, getAllEvents };

// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Import the Event model
const Event = require('./models/Event');

// Initialize the Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Define the port
const PORT = process.env.PORT || 3000;

// Connect to MongoDB Atlas using the connection string from the .env file
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// API to save an event
app.post('/events', async (req, res) => {
  const { name, value } = req.body;

  // Validate the input
  if (!name || !value) {
    return res.status(400).json({ message: 'Name and value are required' });
  }

  try {
    // Create a new event and save it to the database
    const newEvent = new Event({ name, value });
    await newEvent.save();
    res.status(201).json(newEvent); // Respond with the newly created event
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// API to get an event by its ID
app.get('/events/:id', async (req, res) => {
  try {
    // Find the event by its ID
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event); // Respond with the event data
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

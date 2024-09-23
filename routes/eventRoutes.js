// routes/eventRoutes.js

const express = require('express');
const {
  createEvent,
  getEventById,
  getAllEvents,
} = require('../controllers/eventController');
const authenticate = require('../middleware/authMiddleware'); // Import the auth middleware
const router = express.Router();

// POST /events - Create a new event (requires authentication)
router.post('/events', authenticate, createEvent);

// GET /events/:id - Get an event by ID (requires authentication)
router.get('/events/:id', authenticate, getEventById);

// GET /events - Get all events (no authentication required for now)
router.get('/events', getAllEvents); // Return all events

module.exports = router;

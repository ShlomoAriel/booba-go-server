// routes/eventRoutes.js

const express = require('express');
const {
  createEvent,
  getEventById,
  getAllEvents,
} = require('../controllers/eventController');
const authenticate = require('../middleware/authMiddleware'); // Import the auth middleware
const router = express.Router();

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags:
 *       - Events
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the event
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of the event
 *               description:
 *                 type: string
 *                 description: A brief description of the event
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Event ID
 *                 name:
 *                   type: string
 *                   description: Event name
 *                 date:
 *                   type: string
 *                   description: Event date and time
 *                 description:
 *                   type: string
 *                   description: Event description
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/events', authenticate, createEvent);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get an event by ID
 *     tags:
 *       - Events
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the event to retrieve
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Event ID
 *                 name:
 *                   type: string
 *                   description: Event name
 *                 date:
 *                   type: string
 *                   description: Event date and time
 *                 description:
 *                   type: string
 *                   description: Event description
 *       404:
 *         description: Event not found
 *       401:
 *         description: Unauthorized
 */
router.get('/events/:id', authenticate, getEventById);

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events
 *     tags:
 *       - Events
 *     responses:
 *       200:
 *         description: A list of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Event ID
 *                   name:
 *                     type: string
 *                     description: Event name
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     description: Event date and time
 *                   description:
 *                     type: string
 *                     description: Event description
 *       500:
 *         description: Server error
 */
router.get('/events', getAllEvents); // Return all events

module.exports = router;

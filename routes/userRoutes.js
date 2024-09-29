const express = require('express');
const authenticate = require('../middleware/authMiddleware'); // Import the authentication middleware
const router = express.Router();
const User = require('../models/User');

/**
 * @swagger
 * /users/verify:
 *   post:
 *     summary: Verify Firebase token and find/create the user
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User verified and processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User verified and processed successfully
 *                 user:
 *                   type: object
 *                   description: User details
 *       500:
 *         description: Error processing user
 */
router.post('/users/verify', authenticate, async (req, res) => {
  try {
    console.log('User successfully authenticated and processed:', req.user);

    res.status(200).json({
      message: 'User verified and processed successfully',
      user: req.user, // Send back user details
    });
  } catch (error) {
    console.error('Error processing user:', error.message);
    res
      .status(500)
      .json({ message: 'Error processing user', error: error.message });
  }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin or authenticated users)
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 description: User details
 *       500:
 *         description: Error fetching users
 */
router.get('/users', authenticate, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users); // Send all users
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res
      .status(500)
      .json({ message: 'Error fetching users', error: error.message });
  }
});

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search users by email or name
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: query
 *         in: query
 *         description: Search query for users (email or name)
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully searched users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 description: User details
 *       400:
 *         description: No query provided
 *       500:
 *         description: Error searching users
 */
router.get('/users/search', authenticate, async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ message: 'No query provided' });
  }

  try {
    const regex = new RegExp(query, 'i'); // Case-insensitive search
    const users = await User.find({
      $or: [{ email: regex }, { displayName: regex }],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error searching users:', error.message);
    res
      .status(500)
      .json({ message: 'Error searching users', error: error.message });
  }
});

module.exports = router;

const express = require('express');
const authenticate = require('../middleware/authMiddleware'); // Import the authentication middleware
const router = express.Router();
const User = require('../models/User');

// Endpoint to verify Firebase token and find/create the user
router.post('/users/verify', authenticate, async (req, res) => {
  try {
    // At this point, the Firebase token has been verified and the user is found or created
    console.log('User successfully authenticated and processed:', req.user);

    // You can include the user data in the response if needed
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

// Endpoint to get all users (Admin or authenticated users)
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

// Endpoint to search users by email or name
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

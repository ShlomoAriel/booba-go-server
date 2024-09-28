const express = require('express');
const authenticate = require('../middleware/authMiddleware'); // Import the authentication middleware
const router = express.Router();

// Endpoint to verify Firebase token and find/create the user
router.post('/verify', authenticate, async (req, res) => {
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

module.exports = router;

// middleware/authMiddleware.js

const admin = require('firebase-admin');

// Middleware to check Firebase Authentication token
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1]; // Extract the Bearer token from the Authorization header

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify the token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach the decoded token (user info) to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res
      .status(403)
      .json({ message: 'Unauthorized access', error: error.message });
  }
};

module.exports = authenticate;

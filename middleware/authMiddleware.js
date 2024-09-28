const admin = require('firebase-admin');
const { findOrCreateUser } = require('../controllers/userController'); // Import findOrCreateUser function

// Middleware to check Firebase Authentication token and manage MongoDB user
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1]; // Extract the Bearer token from the Authorization header

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify the token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('Firebase token verified:', decodedToken);

    req.firebaseUser = decodedToken; // Attach the decoded token (Firebase user info) to the request object

    // Find or create the MongoDB user based on the Firebase UID
    const user = await findOrCreateUser(decodedToken);
    console.log('MongoDB user found or created:', user);

    // Attach the MongoDB user to the request object
    req.user = user;

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error(
      'Error verifying Firebase token or finding/creating user:',
      error.message
    );
    return res
      .status(403)
      .json({ message: 'Unauthorized access', error: error.message });
  }
};

module.exports = authenticate;

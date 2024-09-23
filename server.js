// server.js

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const admin = require('firebase-admin'); // Import Firebase Admin SDK
const eventRoutes = require('./routes/eventRoutes');
const errorHandler = require('./utils/errorHandler');
const serviceAccount = require('./keys/firebase-adminsdk.json'); // Import the Firebase key

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount), // Initialize using the JSON key
});

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize the Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use('/api', eventRoutes); // All routes are prefixed with /api

// Error handling middleware
app.use(errorHandler);

// Define the port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

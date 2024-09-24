const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const admin = require('firebase-admin'); // Firebase Admin SDK
const eventRoutes = require('./routes/eventRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const unitRoutes = require('./routes/unitRoutes'); // Add unit routes
const ingredientRoutes = require('./routes/ingredientRoutes'); // Add ingredient routes
const errorHandler = require('./utils/errorHandler');
const serviceAccount = require('./keys/firebase-adminsdk.json'); // Firebase key

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount), // Firebase Admin key initialization
});

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/api', eventRoutes); // Event routes
app.use('/api', recipeRoutes); // Recipe routes
app.use('/api', unitRoutes); // Unit routes
app.use('/api', ingredientRoutes); // Ingredient routes

// Error handling middleware
app.use(errorHandler);

// Define the port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

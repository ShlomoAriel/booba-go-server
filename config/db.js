// config/db.js
const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the app if unable to connect
  }
};

module.exports = connectDB;

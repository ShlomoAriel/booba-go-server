const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Firebase UID
  email: { type: String, required: true }, // User's email from Firebase
  displayName: { type: String }, // Optional display name
  photoURL: { type: String }, // Optional profile photo URL
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // User role (optional)
  createdAt: { type: Date, default: Date.now }, // When the user was created in the system
  // Add any additional fields here
});

const User = mongoose.model('User', userSchema);
module.exports = User;

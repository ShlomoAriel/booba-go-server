const mongoose = require('mongoose');

// Define the base Collectible schema
const collectibleSchema = new mongoose.Schema(
  {
    description: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
); // Enable timestamps in the base schema

// Register Collectible as the base model
const Collectible = mongoose.model('Collectible', collectibleSchema);

module.exports = Collectible;

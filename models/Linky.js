const mongoose = require('mongoose');

const linkySchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: {
    type: String,
    enum: ['instagram', 'facebook', 'google_map', 'alltrail', 'other'], // Allowed link types
    required: true,
  },
  description: { type: String, required: false }, // Optional description for the link
});

// Export both the schema and the model
const Linky = mongoose.model('Linky', linkySchema);
module.exports = { Linky, linkySchema };

const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  imageURL: {
    type: String,
    required: false, // Optional
  },
  order: {
    type: Number,
    required: true, // Ensures steps are in order
  },
});

module.exports = StepSchema;

const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  imageURL: {
    type: String,
    required: false,
  },
  order: {
    type: Number,
    required: true,
  },
});

// Export both the schema and the model
const Step = mongoose.model('Step', StepSchema);
module.exports = { Step, StepSchema };

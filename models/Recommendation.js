const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who made the recommendation
  link: { type: String, required: true }, // URL of the recommended item
  type: {
    type: String,
    enum: ['recipe', 'article', 'event', 'other'], // Types of recommendations
    required: true,
  },
  description: { type: String, required: false }, // Optional description
  metadata: {
    title: { type: String },
    description: { type: String },
    image: { type: String },
    url: { type: String },
  },
  status: {
    type: String,
    enum: ['pending', 'promoted', 'rejected'], // Track the status of the recommendation
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now }, // Timestamp for recommendation
});

// Promote the recommendation to a Recipe
recommendationSchema.methods.promoteToRecipe = function () {
  const Recipe = mongoose.model('Recipe');
  return new Recipe({
    name: this.description, // Customize or fetch additional info
    links: [{ url: this.link, type: 'recipe' }],
    // Add other required fields for your Recipe model
  });
};

const Recommendation = mongoose.model('Recommendation', recommendationSchema);
module.exports = Recommendation;

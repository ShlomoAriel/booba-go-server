const mongoose = require('mongoose');
const StepSchema = require('./Step'); // Import Step schema for embedding
const Ingredient = require('./Ingredient'); // Import Ingredient model for referencing

const RecipeSchema = new mongoose.Schema({
  name: String,
  ingredients: [
    {
      ingredient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient',
      },
      amount: Number,
      unit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Unit', // Ensure this field is always populated
      },
    },
  ],
  steps: [
    {
      description: String,
      order: Number,
    },
  ],
});

module.exports = mongoose.model('Recipe', RecipeSchema);

const mongoose = require('mongoose');
const StepSchema = require('./Step'); // Import Step schema for embedding
const Ingredient = require('./Ingredient'); // Import Ingredient model for referencing

const RecipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  ingredients: [
    {
      ingredient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient', // Referencing Ingredient model by ObjectId
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
    },
  ],
  steps: [StepSchema], // Embedding steps as subdocuments
});

module.exports = mongoose.model('Recipe', RecipeSchema);

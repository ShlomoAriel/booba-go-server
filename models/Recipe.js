const mongoose = require('mongoose');
const linkySchema = require('./Linky'); // Import the reusable link schema
const StepSchema = require('./Step'); // Import the reusable step schema

const ingredientReferenceSchema = new mongoose.Schema({
  ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
  amount: { type: Number, required: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
});

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: [ingredientReferenceSchema],
  steps: [StepSchema], // Embed the StepSchema directly, making steps unique to each recipe
  imageURL: { type: String, required: false }, // Optional image URL
  links: [linkySchema], // Embedding links using the reusable link schema
});

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;

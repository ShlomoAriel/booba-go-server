const mongoose = require('mongoose');

const ingredientReferenceSchema = new mongoose.Schema({
  ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
  amount: { type: Number, required: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true }, // Change to ObjectId
});

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: [ingredientReferenceSchema],
  steps: [{ description: String, order: Number }],
  imageURL: { type: String, required: false }, // Optional image URL
});

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;

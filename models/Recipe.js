const mongoose = require('mongoose');
const { linkySchema } = require('./Linky');
const { StepSchema } = require('./Step');
const Collectible = require('./Collectible');

const ingredientReferenceSchema = new mongoose.Schema({
  ingredient: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient' },
  amount: { type: Number, required: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
});

const recipeSchema = new mongoose.Schema({
  description: { type: String, required: true },
  ingredients: [ingredientReferenceSchema],
  steps: [StepSchema],
  imageURL: { type: String, required: false },
  links: [linkySchema],
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

// Use discriminator to inherit from Collectible
const Recipe = Collectible.discriminator('Recipe', recipeSchema);

module.exports = Recipe;

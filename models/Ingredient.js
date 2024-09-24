const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Prevent duplicate ingredients by name
  },
});

const Ingredient = mongoose.model('Ingredient', ingredientSchema);
module.exports = Ingredient;

const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: true, // e.g., "grams", "cups"
  },
});

module.exports = mongoose.model('Ingredient', IngredientSchema);

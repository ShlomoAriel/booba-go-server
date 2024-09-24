const express = require('express');
const router = express.Router();
const Ingredient = require('../models/Ingredient');

// Create a new ingredient
router.post('/ingredients', async (req, res) => {
  const { name } = req.body;
  try {
    const ingredient = new Ingredient({ name });
    await ingredient.save();
    res.status(201).json(ingredient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all ingredients
router.get('/ingredients', async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

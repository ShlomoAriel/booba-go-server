const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// Create a new recipe
router.post('/recipes', async (req, res) => {
  const { name, ingredient, amount, unit } = req.body;
  try {
    const recipe = new Recipe({ name, ingredient, amount, unit });
    await recipe.save();
    res.status(201).json(recipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all recipes
router.get('/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('ingredient').populate('unit');
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// Get all recipes
router.get('/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate('ingredients.ingredient')
      .populate('ingredients.unit'); // Populate unit details

    const formattedRecipes = recipes.map((recipe) => ({
      ...recipe.toObject(),
      ingredients: recipe.ingredients.map((ingredientRef) => ({
        amount: ingredientRef.amount,
        unit: ingredientRef.unit, // Access the unit name
        ingredient: ingredientRef.ingredient,
      })),
    }));

    res.json(formattedRecipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single recipe by ID
router.get('/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(
      'ingredients.ingredient'
    ); // Populate ingredient details
    if (!recipe) throw new Error('Recipe not found');
    res.json(recipe);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Create a new recipe
router.post('/recipes', async (req, res) => {
  const { name, ingredients, steps } = req.body;
  try {
    const newRecipe = new Recipe({ name, ingredients, steps });
    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update an existing recipe
router.put('/recipes/:id', async (req, res) => {
  const { name, ingredients, steps } = req.body;
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { name, ingredients, steps },
      { new: true }
    ).populate('ingredients.ingredient'); // Populate ingredient details after updating
    if (!updatedRecipe) throw new Error('Recipe not found');
    res.json(updatedRecipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a recipe
router.delete('/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) throw new Error('Recipe not found');
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;

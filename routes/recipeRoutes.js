const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// Get all recipes
router.get('/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate('ingredients.ingredient')
      .populate('ingredients.unit'); // Populate both ingredient and unit details

    // Map the results to include the ingredient ID, unit name, imageURL, and links
    const formattedRecipes = recipes.map((recipe) => ({
      ...recipe.toObject(),
      ingredients: recipe.ingredients.map((ingredientRef) => ({
        amount: ingredientRef.amount,
        id: ingredientRef.ingredient._id,
        unit: {
          id: ingredientRef.unit._id,
          name: ingredientRef.unit.name,
        },
        ingredient: {
          id: ingredientRef.ingredient._id,
          name: ingredientRef.ingredient.name,
        },
      })),
      imageURL: recipe.imageURL, // Include imageURL
      links: recipe.links.map((link) => ({
        id: link._id,
        url: link.url,
        type: link.type,
        description: link.description,
      })), // Include links
    }));

    res.json(formattedRecipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single recipe by ID
router.get('/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('ingredients.ingredient')
      .populate('ingredients.unit'); // Populate ingredient and unit details
    if (!recipe) throw new Error('Recipe not found');

    // Format the response to include imageURL and links
    res.json({
      id: recipe._id,
      name: recipe.name,
      imageURL: recipe.imageURL, // Include imageURL
      ingredients: recipe.ingredients.map((ingredientRef) => ({
        amount: ingredientRef.amount,
        id: ingredientRef.ingredient._id,
        unit: {
          id: ingredientRef.unit._id,
          name: ingredientRef.unit.name,
        },
        ingredient: {
          id: ingredientRef.ingredient._id,
          name: ingredientRef.ingredient.name,
        },
      })),
      steps: recipe.steps,
      links: recipe.links.map((link) => ({
        id: link._id,
        url: link.url,
        type: link.type,
        description: link.description,
      })), // Include links
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Helper function to detect link type based on the URL
function getLinkType(url) {
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('facebook.com')) return 'facebook';
  if (url.includes('google.com/maps')) return 'google_map';
  if (url.includes('alltrails.com')) return 'alltrail';
  return 'other';
}

// Create a new recipe
router.post('/recipes', async (req, res) => {
  const { name, ingredients, steps, imageURL, links } = req.body; // Include links in the destructuring

  try {
    // Process the links array, detecting their type based on URL
    const processedLinks = links.map((link) => ({
      url: link.url,
      type: getLinkType(link.url), // Detect the link type
      description: link.description || '', // Optional description
    }));

    // Create a new recipe with the processed links
    const newRecipe = new Recipe({
      name,
      ingredients,
      steps,
      imageURL, // Add imageURL to the recipe
      links: processedLinks, // Add processed links to the recipe
    });

    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update an existing recipe
router.put('/recipes/:id', async (req, res) => {
  const { name, ingredients, steps, imageURL } = req.body; // Include imageURL in destructuring
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { name, ingredients, steps, imageURL }, // Add imageURL to the update
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

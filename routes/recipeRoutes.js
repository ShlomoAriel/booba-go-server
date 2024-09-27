const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// Get all recipes
/**
 * @swagger
 * /api/recipes:
 *   get:
 *     summary: Get all recipes
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: List of all recipes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recipe'
 */
router.get('/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate('ingredients.ingredient')
      .populate('ingredients.unit');

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
      imageURL: recipe.imageURL,
      links: recipe.links.map((link) => ({
        id: link._id,
        url: link.url,
        type: link.type,
        description: link.description,
      })),
    }));

    res.json(formattedRecipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single recipe by ID
/**
 * @swagger
 * /api/recipes/{id}:
 *   get:
 *     summary: Get a recipe by ID
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The recipe ID
 *     responses:
 *       200:
 *         description: A recipe with its details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       404:
 *         description: Recipe not found
 */
router.get('/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('ingredients.ingredient')
      .populate('ingredients.unit');
    if (!recipe) throw new Error('Recipe not found');

    res.json({
      id: recipe._id,
      name: recipe.name,
      imageURL: recipe.imageURL,
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
      })),
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Add a new link to an existing recipe
/**
 * @swagger
 * /api/recipes/{id}/addLink:
 *   post:
 *     summary: Add a new link to an existing recipe
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The recipe ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: The updated recipe with the new link
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       400:
 *         description: Bad request
 */
router.post('/recipes/:id/addLink', async (req, res) => {
  const { url, description } = req.body;

  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const newLink = {
      url,
      type: getLinkType(url),
      description: description || '',
    };

    recipe.links.push(newLink);
    await recipe.save();

    res.status(200).json(recipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create a new recipe
/**
 * @swagger
 * /api/recipes:
 *   post:
 *     summary: Create a new recipe
 *     tags: [Recipes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Recipe'
 *     responses:
 *       201:
 *         description: Recipe created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       400:
 *         description: Bad request
 */
router.post('/recipes', async (req, res) => {
  const { name, ingredients, steps, imageURL, links } = req.body;

  try {
    const processedLinks = links.map((link) => ({
      url: link.url,
      type: getLinkType(link.url),
      description: link.description || '',
    }));

    const newRecipe = new Recipe({
      name,
      ingredients,
      steps,
      imageURL,
      links: processedLinks,
    });

    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update an existing recipe
/**
 * @swagger
 * /api/recipes/{id}:
 *   put:
 *     summary: Update a recipe
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The recipe ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Recipe'
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Recipe not found
 */
router.put('/recipes/:id', async (req, res) => {
  const { name, ingredients, steps, imageURL } = req.body;
  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { name, ingredients, steps, imageURL },
      { new: true }
    ).populate('ingredients.ingredient');
    if (!updatedRecipe) throw new Error('Recipe not found');
    res.json(updatedRecipe);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a recipe
/**
 * @swagger
 * /api/recipes/{id}:
 *   delete:
 *     summary: Delete a recipe
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The recipe ID
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Recipe deleted successfully
 *       404:
 *         description: Recipe not found
 */
router.delete('/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) throw new Error('Recipe not found');
    res.json({ message: 'Recipe deleted successfully' });
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

module.exports = router;

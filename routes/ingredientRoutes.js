const express = require('express');
const router = express.Router();
const Ingredient = require('../models/Ingredient');

// Create a new ingredient
/**
 * @swagger
 * /api/ingredients:
 *   post:
 *     summary: Create a new ingredient
 *     tags: [Ingredients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Sugar"
 *     responses:
 *       201:
 *         description: Ingredient created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       400:
 *         description: Bad request
 */
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

// Bulk insert/update ingredients
/**
 * @swagger
 * /api/bulk-ingredients:
 *   post:
 *     summary: Bulk insert or update ingredients
 *     tags: [Ingredients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Sugar"
 *     responses:
 *       201:
 *         description: Bulk operation was successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nMatched:
 *                   type: integer
 *                   example: 1
 *                 nUpserted:
 *                   type: integer
 *                   example: 1
 *                 nModified:
 *                   type: integer
 *                   example: 1
 *       500:
 *         description: Server error
 */
router.post('/bulk-ingredients', async (req, res) => {
  const ingredients = req.body;

  try {
    const operations = ingredients.map((ingredient) => ({
      updateOne: {
        filter: { name: ingredient.name },
        update: { $set: ingredient },
        upsert: true, // This will insert the ingredient if it doesn't exist
      },
    }));

    const result = await Ingredient.bulkWrite(operations);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all ingredients
/**
 * @swagger
 * /api/ingredients:
 *   get:
 *     summary: Get all ingredients
 *     tags: [Ingredients]
 *     responses:
 *       200:
 *         description: List of all ingredients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ingredient'
 *       500:
 *         description: Server error
 */
router.get('/ingredients', async (req, res) => {
  try {
    const ingredients = await Ingredient.find();
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

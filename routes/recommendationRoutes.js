const express = require('express');
const authenticate = require('../middleware/authMiddleware'); // Import the authentication middleware
const Recommendation = require('../models/Recommendation');
const Recipe = require('../models/Recipe'); // For promotion logic
const router = express.Router();

/**
 * @swagger
 * /recommendations:
 *   post:
 *     summary: Create a new recommendation
 *     tags:
 *       - Recommendations
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               link:
 *                 type: string
 *                 description: The link being recommended
 *               type:
 *                 type: string
 *                 description: The type of recommendation (e.g., recipe)
 *               description:
 *                 type: string
 *                 description: A brief description of the recommendation
 *     responses:
 *       201:
 *         description: Recommendation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Recommendation ID
 *                 user:
 *                   type: string
 *                   description: ID of the user who created the recommendation
 *                 link:
 *                   type: string
 *                   description: The link being recommended
 *                 type:
 *                   type: string
 *                   description: The type of recommendation
 *                 description:
 *                   type: string
 *                   description: Description of the recommendation
 *       400:
 *         description: Bad request
 */
router.post('/recommendations', authenticate, async (req, res) => {
  try {
    const { link, type, description } = req.body;

    const recommendation = new Recommendation({
      user: req.user._id, // Use the authenticated user's ID
      link,
      type,
      description,
    });

    await recommendation.save();
    res.status(201).json(recommendation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /recommendations:
 *   get:
 *     summary: Get all recommendations
 *     tags:
 *       - Recommendations
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of recommendations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Recommendation ID
 *                   link:
 *                     type: string
 *                     description: The link being recommended
 *                   type:
 *                     type: string
 *                     description: The type of recommendation
 *                   description:
 *                     type: string
 *                     description: A brief description of the recommendation
 *                   status:
 *                     type: string
 *                     description: The status of the recommendation (pending/promoted/rejected)
 *       400:
 *         description: Bad request
 */
router.get('/recommendations', authenticate, async (req, res) => {
  try {
    const recommendations = await Recommendation.find();
    res.status(200).json(recommendations);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /recommendations/{id}:
 *   get:
 *     summary: Get a recommendation by ID
 *     tags:
 *       - Recommendations
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the recommendation
 *     responses:
 *       200:
 *         description: recommendation details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Recommendation ID
 *                 link:
 *                   type: string
 *                   description: The link being recommended
 *                 type:
 *                   type: string
 *                   description: The type of recommendation
 *                 description:
 *                   type: string
 *                   description: A brief description of the recommendation
 *                 status:
 *                   type: string
 *                   description: The status of the recommendation (pending/promoted/rejected)
 *       404:
 *         description: Recommendation not found
 *       400:
 *         description: Bad request
 */
router.get('/recommendations/:id', authenticate, async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id);
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }
    res.status(200).json(recommendation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /recommendations/{id}/promote:
 *   post:
 *     summary: Promote a recommendation to a Recipe
 *     tags:
 *       - Recommendations
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the recommendation to promote
 *     responses:
 *       201:
 *         description: Recommendation promoted to a recipe successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: New recipe ID
 *                 name:
 *                   type: string
 *                   description: Name of the new recipe
 *       404:
 *         description: Recommendation not found
 *       400:
 *         description: Bad request
 */
router.post('/recommendations/:id/promote', authenticate, async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id);

    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    const newRecipe = recommendation.promoteToRecipe();
    await newRecipe.save();

    recommendation.status = 'promoted';
    await recommendation.save();

    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

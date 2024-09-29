const express = require('express');
const authenticate = require('../middleware/authMiddleware'); // Import the authentication middleware
const PotentialRecommendation = require('../models/PotentialRecommendation');
const Recipe = require('../models/Recipe'); // For promotion logic
const router = express.Router();

/**
 * @swagger
 * /potential-recommendations:
 *   post:
 *     summary: Create a new potential recommendation
 *     tags:
 *       - Potential Recommendations
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
router.post('/potential-recommendations', authenticate, async (req, res) => {
  try {
    const { link, type, description } = req.body;

    const recommendation = new PotentialRecommendation({
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
 * /potential-recommendations:
 *   get:
 *     summary: Get all potential recommendations
 *     tags:
 *       - Potential Recommendations
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of potential recommendations
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
router.get('/potential-recommendations', authenticate, async (req, res) => {
  try {
    const recommendations = await PotentialRecommendation.find();
    res.status(200).json(recommendations);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /potential-recommendations/{id}:
 *   get:
 *     summary: Get a potential recommendation by ID
 *     tags:
 *       - Potential Recommendations
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the potential recommendation
 *     responses:
 *       200:
 *         description: Potential recommendation details
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
router.get('/potential-recommendations/:id', authenticate, async (req, res) => {
  try {
    const recommendation = await PotentialRecommendation.findById(
      req.params.id
    );
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
 * /potential-recommendations/{id}/promote:
 *   post:
 *     summary: Promote a potential recommendation to a Recipe
 *     tags:
 *       - Potential Recommendations
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the potential recommendation to promote
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
router.post(
  '/potential-recommendations/:id/promote',
  authenticate,
  async (req, res) => {
    try {
      const recommendation = await PotentialRecommendation.findById(
        req.params.id
      );

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
  }
);

module.exports = router;

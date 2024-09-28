const express = require('express');
const authenticate = require('../middleware/authMiddleware'); // Import the authentication middleware
const PotentialRecommendation = require('../models/PotentialRecommendation');
const Recipe = require('../models/Recipe'); // For promotion logic
const router = express.Router();

// Route to create a new recommendation
router.post('/potential-recommendations', authenticate, async (req, res) => {
  try {
    const { link, type, description } = req.body;

    // Create a new recommendation associated with the authenticated user
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

// Route to promote a recommendation to a Recipe
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

      // Mark recommendation as promoted
      recommendation.status = 'promoted';
      await recommendation.save();

      res.status(201).json(newRecipe);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;

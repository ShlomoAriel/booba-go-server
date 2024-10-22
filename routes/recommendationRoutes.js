const express = require('express');
const authenticate = require('../middleware/authMiddleware'); // Import the authentication middleware
const Recommendation = require('../models/Recommendation');
const Recipe = require('../models/Recipe'); // For promotion logic
const axios = require('axios');
const cheerio = require('cheerio'); // For HTML parsing
const router = express.Router();

// Helper function to extract metadata from a link
async function extractMetadata(link) {
  try {
    const { data } = await axios.get(link, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
        Referer: link,
      },
    });

    const $ = cheerio.load(data);
    const metadata = {
      title:
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('title').text(),
      description:
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="twitter:description"]').attr('content') ||
        $('meta[name="description"]').attr('content'),
      image:
        $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content'),
      url: $('meta[property="og:url"]').attr('content') || link,
      site_name:
        $('meta[property="og:site_name"]').attr('content') ||
        new URL(link).hostname,
      twitter_card: $('meta[name="twitter:card"]').attr('content'),
    };

    return metadata;
  } catch (error) {
    console.error(`Error fetching metadata from ${link}:`, error.message);
    return null;
  }
}

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

    // Attempt to extract metadata, but don't fail if it doesn't succeed
    const metadata = await extractMetadata(link);

    // Create a new recommendation regardless of metadata
    const recommendation = new Recommendation({
      user: req.user._id, // Use the authenticated user's ID
      link,
      type,
      description: description || (metadata ? metadata.description : ''), // Use metadata description if available
      metadata: metadata
        ? {
            title: metadata.title,
            image: metadata.image,
            url: metadata.url,
          }
        : null, // If metadata is found, store it, otherwise leave null
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

/**
 * @swagger
 * /recommendations/{id}:
 *   put:
 *     summary: Update a recommendation by ID
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
 *         description: ID of the recommendation to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               link:
 *                 type: string
 *                 description: The updated link
 *               type:
 *                 type: string
 *                 description: The updated type of recommendation
 *               description:
 *                 type: string
 *                 description: The updated description of the recommendation
 *     responses:
 *       200:
 *         description: Recommendation updated successfully
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
 *                   description: The updated link being recommended
 *                 type:
 *                   type: string
 *                   description: The updated type of recommendation
 *                 description:
 *                   type: string
 *                   description: The updated description of the recommendation
 *       404:
 *         description: Recommendation not found
 *       400:
 *         description: Bad request
 */
router.put('/recommendations/:id', authenticate, async (req, res) => {
  try {
    const { link, type, description } = req.body;

    // Find recommendation by ID
    const recommendation = await Recommendation.findById(req.params.id);
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    // Update the recommendation fields
    recommendation.link = link || recommendation.link;
    recommendation.type = type || recommendation.type;
    recommendation.description = description || recommendation.description;

    // Attempt to extract updated metadata if link has changed
    if (link && link !== recommendation.link) {
      const metadata = await extractMetadata(link);
      recommendation.metadata = metadata
        ? {
            title: metadata.title,
            image: metadata.image,
            url: metadata.url,
          }
        : recommendation.metadata; // If metadata extraction fails, retain the old metadata
    }

    // Save the updated recommendation
    await recommendation.save();
    res.status(200).json(recommendation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /recommendations/{id}:
 *   delete:
 *     summary: Delete a recommendation by ID
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
 *         description: ID of the recommendation to delete
 *     responses:
 *       200:
 *         description: Recommendation deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Recommendation deleted successfully
 *       404:
 *         description: Recommendation not found
 *       400:
 *         description: Bad request
 */
router.delete('/recommendations/:id', authenticate, async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id);

    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    await recommendation.remove();
    res.status(200).json({ message: 'Recommendation deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /metadata:
 *   post:
 *     summary: Extract metadata from a link
 *     tags:
 *       - Metadata
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
 *                 description: The link from which to extract metadata
 *     responses:
 *       200:
 *         description: Extracted metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   description: The title of the page
 *                 description:
 *                   type: string
 *                   description: The description of the page
 *                 image:
 *                   type: string
 *                   description: The image of the page
 *                 url:
 *                   type: string
 *                   description: The canonical URL of the page
 *       400:
 *         description: Bad request
 */
router.post('/metadata', authenticate, async (req, res) => {
  try {
    const { link } = req.body;

    if (!link) {
      return res.status(400).json({ message: 'Link is required' });
    }

    // Extract metadata using the existing helper function
    const metadata = await extractMetadata(link);

    if (!metadata) {
      return res.status(400).json({ message: 'Failed to extract metadata' });
    }

    // Return the extracted metadata
    res.status(200).json(metadata);
  } catch (error) {
    console.error(`Error extracting metadata: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

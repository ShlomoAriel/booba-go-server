const express = require('express');
const authenticate = require('../middleware/authMiddleware'); // Import the authentication middleware
const Collection = require('../models/Collection');
const Recipe = require('../models/Recipe');
const PotentialRecommendation = require('../models/PotentialRecommendation');
const axios = require('axios');
const cheerio = require('cheerio'); // For HTML parsing
const router = express.Router();

// Helper function to extract metadata from a link
async function extractMetadata(link) {
  try {
    const { data } = await axios.get(link); // Fetch the page HTML
    const $ = cheerio.load(data); // Load HTML into Cheerio

    // Extract Open Graph or standard meta tags
    const metadata = {
      title:
        $('meta[property="og:title"]').attr('content') || $('title').text(),
      description:
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="description"]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
      url: $('meta[property="og:url"]').attr('content') || link,
    };

    return metadata;
  } catch (error) {
    console.error(`Error fetching metadata from ${link}:`, error.message);
    return null;
  }
}

/**
 * @swagger
 * /collections:
 *   post:
 *     summary: Create a new collection
 *     tags:
 *       - Collections
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the collection
 *               items:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: IDs of Collectible items
 *     responses:
 *       201:
 *         description: Collection created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Collection ID
 *                 name:
 *                   type: string
 *                   description: The name of the collection
 *                 items:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: Collectible item IDs
 *       400:
 *         description: Bad request
 */
router.post('/collections', authenticate, async (req, res) => {
  try {
    const { name, items } = req.body;

    const collection = new Collection({
      name,
      owner: req.user._id, // Use the authenticated user's ID
      items, // Array of Collectible item IDs
    });

    await collection.save();
    res.status(201).json(collection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /collections:
 *   get:
 *     summary: Get all collections (with optional search query)
 *     tags:
 *       - Collections
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: search
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Search collections by name
 *     responses:
 *       200:
 *         description: A list of collections
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Collection ID
 *                   name:
 *                     type: string
 *                     description: The name of the collection
 *                   items:
 *                     type: array
 *                     items:
 *                       type: string
 *                       description: Collectible item IDs
 *       400:
 *         description: Bad request
 */
router.get('/collections', authenticate, async (req, res) => {
  try {
    const { search } = req.query;

    let query = {};

    // If a search query is provided, add a filter for the collection name
    if (search) {
      query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
    }

    const collections = await Collection.find(query).populate('items');
    res.status(200).json(collections);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /collections/{id}:
 *   get:
 *     summary: Get a collection by ID
 *     tags:
 *       - Collections
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the collection
 *     responses:
 *       200:
 *         description: Collection details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Collection ID
 *                 name:
 *                   type: string
 *                   description: The name of the collection
 *                 items:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: Collectible item IDs
 *       404:
 *         description: Collection not found
 *       400:
 *         description: Bad request
 */
router.get('/collections/:id', authenticate, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id).populate(
      'items'
    );
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    res.status(200).json(collection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /collections/{id}:
 *   put:
 *     summary: Update a collection by ID
 *     tags:
 *       - Collections
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the collection to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The updated name of the collection
 *               items:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: Updated array of Collectible item IDs
 *     responses:
 *       200:
 *         description: Collection updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Collection ID
 *                 name:
 *                   type: string
 *                   description: The updated name of the collection
 *                 items:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: Updated array of Collectible item IDs
 *       404:
 *         description: Collection not found
 *       400:
 *         description: Bad request
 */
router.put('/collections/:id', authenticate, async (req, res) => {
  try {
    const { name, items } = req.body;

    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    collection.name = name || collection.name;
    collection.items = items || collection.items;

    await collection.save();
    res.status(200).json(collection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /collections/{id}:
 *   delete:
 *     summary: Delete a collection by ID
 *     tags:
 *       - Collections
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the collection to delete
 *     responses:
 *       200:
 *         description: Collection deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Collection deleted successfully
 *       404:
 *         description: Collection not found
 *       400:
 *         description: Bad request
 */
router.delete('/collections/:id', authenticate, async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    await collection.remove();
    res.status(200).json({ message: 'Collection deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
const express = require('express');
const authenticate = require('../middleware/authMiddleware'); // Import the authentication middleware
const Collection = require('../models/Collection');
const Recipe = require('../models/Recipe');
const Recommendation = require('../models/Recommendation');
const Ingredient = require('../models/Ingredient');
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

// Helper function to populate recipe ingredients, units, and format dates
async function populateAndFormatCollectionItems(collection) {
  // Iterate through items and check if it's a Recipe
  const populatedItems = await Promise.all(
    collection.items.map(async (item) => {
      if (item.__t === 'Recipe') {
        // If the item is a Recipe, populate its ingredients and units
        const populatedRecipe = await Recipe.populate(item, [
          {
            path: 'ingredients.ingredient',
            select: 'name', // Select specific fields for ingredients
          },
          {
            path: 'ingredients.unit',
            select: 'name', // Select specific fields for units
          },
        ]);

        // Format dates in ISO8601 for Recipe
        return {
          ...populatedRecipe.toObject(),
          createdAt:
            populatedRecipe.createdAt.toISOString().split('.')[0] + 'Z',
          updatedAt: populatedRecipe.updatedAt
            ? populatedRecipe.updatedAt.toISOString().split('.')[0] + 'Z'
            : undefined, // Optional field for updatedAt
        };
      }

      // For non-recipe items, just format the dates
      return {
        ...item.toObject(),
        createdAt: item.createdAt.toISOString().split('.')[0] + 'Z',
        updatedAt: item.updatedAt
          ? item.updatedAt.toISOString().split('.')[0] + 'Z'
          : undefined,
      };
    })
  );

  return {
    ...collection.toObject(),
    items: populatedItems,
    createdAt: collection.createdAt.toISOString().split('.')[0] + 'Z',
    updatedAt: collection.updatedAt
      ? collection.updatedAt.toISOString().split('.')[0] + 'Z'
      : undefined, // Optional field for updatedAt
  };
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
    const { description, items } = req.body;

    const collection = new Collection({
      description,
      user: req.user._id, // Use the authenticated user's ID
      items, // Array of Collectible item IDs
    });

    await collection.save();

    // Use the helper function to populate and format the collection items
    const populatedCollection = await populateAndFormatCollectionItems(
      collection
    );

    res.status(201).json(populatedCollection);
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
 */
router.get('/collections', authenticate, async (req, res) => {
  try {
    const { search } = req.query;

    let query = {};

    // If a search query is provided, add a filter for the collection description
    if (search) {
      query.description = { $regex: search, $options: 'i' }; // Case-insensitive search
    }

    // Fetch collections with items populated
    const collections = await Collection.find(query).populate('items');

    // Populate ingredients and units in Recipe items and format dates to ISO8601
    const populatedCollections = await Promise.all(
      collections.map((collection) =>
        populateAndFormatCollectionItems(collection)
      )
    );

    // Send the populated collections in the response
    res.status(200).json(populatedCollections);
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

    // Populate ingredients and units in Recipe items and format dates to ISO8601
    const populatedCollection = await populateAndFormatCollectionItems(
      collection
    );

    // Send the populated collection in the response
    res.status(200).json(populatedCollection);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /collectible/search:
 *   get:
 *     summary: Search for collectibles (recommendations and recipes)
 *     tags:
 *       - Collectibles
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: search
 *         in: query
 *         required: true
 *         description: The search query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of matching collectibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get('/collectible/search', authenticate, async (req, res) => {
  const query = req.query.search; // Get the search query from the request

  try {
    let recommendations = [];
    let recipes = [];

    // If a search query is provided, search by that query
    if (query) {
      // Search for matching ingredients by name
      const matchingIngredients = await Ingredient.find({
        name: new RegExp(query, 'i'), // Search in the Ingredient name field
      }).select('_id'); // Only return the _id of matching ingredients

      const ingredientIds = matchingIngredients.map(
        (ingredient) => ingredient._id
      );

      // Search for recommendations by description or metadata title
      recommendations = await Recommendation.find({
        $or: [
          { description: new RegExp(query, 'i') }, // Search in description
          { 'metadata.title': new RegExp(query, 'i') }, // Search in metadata.title
        ],
      });

      // Search for recipes by description or matching ingredient IDs
      recipes = await Recipe.find({
        $or: [
          { description: new RegExp(query, 'i') }, // Search in recipe description
          { 'ingredients.ingredient': { $in: ingredientIds } }, // Match ingredients by ID
        ],
      })
        .populate('ingredients.ingredient')
        .populate('ingredients.unit'); // Populate the ingredients and units
    } else {
      // If no query is provided, return all recommendations and recipes
      recommendations = await Recommendation.find();
      recipes = await Recipe.find()
        .populate('ingredients.ingredient')
        .populate('ingredients.unit'); // Populate the ingredients and units
    }

    // Merge the results into a single array and format the `createdAt` dates
    const collectibles = [
      ...recommendations.map((item) => ({
        ...item.toObject(),
        __t: 'Recommendation',
        createdAt: item.createdAt.toISOString().split('.')[0] + 'Z', // Format date
        updatedAt: item.updatedAt
          ? item.updatedAt.toISOString().split('.')[0] + 'Z'
          : undefined, // Optional
      })),
      ...recipes.map((item) => ({
        ...item.toObject(),
        __t: 'Recipe',
        createdAt: item.createdAt.toISOString().split('.')[0] + 'Z', // Format date
        updatedAt: item.updatedAt
          ? item.updatedAt.toISOString().split('.')[0] + 'Z'
          : undefined, // Optional
      })),
    ];

    res.json(collectibles);
  } catch (error) {
    console.error('Error searching collectibles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * @swagger
 * /collections/{collectionId}/items/{itemId}:
 *   delete:
 *     summary: Remove an item from a collection
 *     tags:
 *       - Collections
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: collectionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the collection
 *       - name: itemId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the item to be removed
 *     responses:
 *       200:
 *         description: Item removed from collection successfully
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
 *                   description: Collection name
 *                 items:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: Collectible item IDs
 *       404:
 *         description: Collection or item not found
 *       400:
 *         description: Bad request
 */
router.delete(
  '/collections/:collectionId/items/:itemId',
  authenticate,
  async (req, res) => {
    try {
      const { collectionId, itemId } = req.params;

      // Find the collection and remove the item atomically
      const updatedCollection = await Collection.findOneAndUpdate(
        { _id: collectionId }, // Ensure the user is the owner
        { $pull: { items: itemId } },
        { new: true } // Return the updated document
      ).populate('items'); // Optionally populate fields

      if (!updatedCollection) {
        return res
          .status(404)
          .json({ message: 'Collection not found or item not in collection' });
      }

      // Use the helper function to populate and format the collection items
      const populatedCollection = await populateAndFormatCollectionItems(
        updatedCollection
      );

      res.status(200).json({
        success: true,
        message: 'Item removed from collection successfully',
        collection: populatedCollection,
      });
    } catch (error) {
      console.error('Error removing item from collection:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

/**
 * @swagger
 * /collections/{id}/items:
 *   post:
 *     summary: Add an item to a collection
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: The ID of the collectible item to add to the collection
 *     responses:
 *       200:
 *         description: Item added to the collection successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Collection ID
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
router.post('/collections/:id/items', authenticate, async (req, res) => {
  try {
    const { itemId } = req.body;

    // Validate the itemId
    if (!itemId) {
      return res.status(400).json({ message: 'Item ID is required' });
    }

    // Find the collection by ID
    const collection = await Collection.findById(req.params.id);

    // If the collection is not found, return 404
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // Check if the item already exists in the collection
    if (collection.items.includes(itemId)) {
      return res
        .status(400)
        .json({ message: 'Item already exists in the collection' });
    }

    // Add the new item to the collection's items array
    collection.items.push(itemId);

    // Save the updated collection
    await collection.save();

    // Reload the entire collection from the database
    const updatedCollection = await Collection.findById(req.params.id).populate(
      'items'
    );

    // Populate and format the collection items
    const populatedCollection = await populateAndFormatCollectionItems(
      updatedCollection
    );

    // Respond with the fully populated collection
    res.status(200).json(populatedCollection);
  } catch (error) {
    console.error('Error adding item to collection:', error);
    res.status(500).json({ message: 'Internal server error' });
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
 *                 success:
 *                   type: boolean
 *                   description: Deletion status
 *                 message:
 *                   type: string
 *                   description: Deletion confirmation message
 *       404:
 *         description: Collection not found
 *       400:
 *         description: Bad request
 */
router.delete('/collections/:id', authenticate, async (req, res) => {
  try {
    const collectionId = req.params.id;

    // Find the collection by ID
    const collection = await Collection.findById(collectionId);

    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // If you're using user authentication, you can check if the user owns the collection
    // if (collection.user.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ message: 'Unauthorized to delete this collection' });
    // }

    // Delete the collection
    await Collection.findByIdAndDelete(collectionId);

    res.status(200).json({
      success: true,
      message: 'Collection deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

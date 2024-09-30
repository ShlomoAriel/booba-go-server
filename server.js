const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const admin = require('firebase-admin'); // Firebase Admin SDK
const eventRoutes = require('./routes/eventRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const unitRoutes = require('./routes/unitRoutes'); // Add unit routes
const ingredientRoutes = require('./routes/ingredientRoutes'); // Add ingredient routes
const recommendationRoutes = require('./routes/recommendationRoutes');
const userRoutes = require('./routes/userRoutes'); // Import the user routes
const errorHandler = require('./utils/errorHandler');
const serviceAccount = require('./keys/firebase-adminsdk.json'); // Firebase key
const mongooseToSwagger = require('mongoose-to-swagger');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount), // Firebase Admin key initialization
});

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Helper function to dynamically load Mongoose models from the "models" directory
const loadModels = (modelsDirectory) => {
  const models = {};

  // Read all files in the models directory
  fs.readdirSync(modelsDirectory).forEach((file) => {
    if (file.endsWith('.js')) {
      const modelExports = require(path.join(modelsDirectory, file));

      // Check if the file exports a Mongoose model directly or an object containing models
      if (modelExports.schema && modelExports.modelName) {
        // Direct export case
        const modelName = modelExports.modelName;
        models[modelName] = mongooseToSwagger(modelExports);
      } else {
        // Object export case (check if the model is part of an object)
        Object.keys(modelExports).forEach((key) => {
          const exported = modelExports[key];
          if (exported && exported.schema && exported.modelName) {
            const modelName = exported.modelName;
            models[modelName] = mongooseToSwagger(exported);
          }
        });
      }
    }
  });

  console.log('Loaded Models:', models); // Debugging: Check if models are correctly loaded
  return models;
};

// Load all models from the "models" folder
const modelsDirectory = path.join(__dirname, 'models');
const swaggerModels = loadModels(modelsDirectory);

// Swagger Definition
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Booba Go API',
      version: '1.0.0',
      description: 'API documentation for Booba Go',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    components: {
      schemas: loadModels(path.join(__dirname, 'models')), // Dynamically load models
    },
  },
  apis: ['./routes/*.js'], // Ensure this points to your route files with annotations
};

// Initialize Swagger docs
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api', eventRoutes); // Event routes
app.use('/api', recipeRoutes); // Recipe routes
app.use('/api', unitRoutes); // Unit routes
app.use('/api', ingredientRoutes); // Ingredient routes
app.use('/api', recommendationRoutes); // Ensure it's registered
app.use('/api', userRoutes);

// Error handling middleware
app.use(errorHandler);

// Define the port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `API documentation available at http://localhost:${PORT}/api-docs`
  );
});

const mongoose = require('mongoose');

// Define the schema for Collection with timestamps
const collectionSchema = new mongoose.Schema(
  {
    description: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collectible' }],
  },
  { timestamps: true }
); // Enable automatic createdAt and updatedAt fields

// // Customize JSON output for `createdAt` (remove milliseconds from ISO8601 format)
collectionSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.createdAt && ret.createdAt instanceof Date) {
      // Adjust the format to remove milliseconds
      ret.createdAt = ret.createdAt.toISOString().split('.')[0] + 'Z';
    }
    if (ret.updatedAt && ret.updatedAt instanceof Date) {
      // Adjust the format to remove milliseconds for updatedAt too
      ret.updatedAt = ret.updatedAt.toISOString().split('.')[0] + 'Z';
    }
    return ret;
  },
});

// Create and export the Collection model
const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;

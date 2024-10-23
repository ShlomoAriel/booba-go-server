const mongoose = require('mongoose');
const Collectible = require('./Collectible');

const recommendationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  link: { type: String, required: true },
  type: {
    type: String,
    enum: ['recipe', 'article', 'event', 'other'],
    required: true,
  },
  description: { type: String },
  metadata: {
    title: { type: String },
    description: { type: String },
    image: { type: String },
    url: { type: String },
    site: { type: String },
  },
  status: {
    type: String,
    enum: ['pending', 'promoted', 'rejected'],
    default: 'pending',
  },
});

// Customize JSON output for `createdAt`
recommendationSchema.set('toJSON', {
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

// Use discriminator to inherit from Collectible
const Recommendation = Collectible.discriminator(
  'Recommendation',
  recommendationSchema
);

module.exports = Recommendation;

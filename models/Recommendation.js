const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
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
    },
    status: {
      type: String,
      enum: ['pending', 'promoted', 'rejected'],
      default: 'pending',
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Customize JSON output to return `createdAt` without fractional seconds
recommendationSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.createdAt) {
      // Convert `createdAt` to ISO 8601 without fractional seconds
      ret.createdAt = ret.createdAt.toISOString().split('.')[0] + 'Z';
    }
    return ret;
  },
});

const Recommendation = mongoose.model('Recommendation', recommendationSchema);
module.exports = Recommendation;

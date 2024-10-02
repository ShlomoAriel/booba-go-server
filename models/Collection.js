const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  description: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collectible' }],
  createdAt: { type: Date, default: Date.now },
});

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;

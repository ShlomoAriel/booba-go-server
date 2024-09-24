const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Unit', UnitSchema);

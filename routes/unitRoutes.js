const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit');

// Create a new unit
router.post('/units', async (req, res) => {
  const { name } = req.body;
  try {
    const unit = new Unit({ name });
    await unit.save();
    res.status(201).json(unit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all units
router.get('/units', async (req, res) => {
  try {
    const units = await Unit.find();
    res.json(units);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

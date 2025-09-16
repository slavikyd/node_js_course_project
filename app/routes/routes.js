const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// Import and use index routes
const indexRoutes = require('./index');
router.use('/*splat', indexRoutes);

// GET /api/items - Get all items
router.get('/items', async (req, res, next) => {
  try {
    const items = await Item.find().sort({ date: -1 });
    res.json({
      count: items.length,
      items
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/items/:id - Get single item
router.get('/items/:id', async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
});

// POST /api/items - Create new item
router.post('/items', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }
    
    const newItem = new Item({ name, description });
    const item = await newItem.save();
    res.status(201).json({
      message: 'Item created successfully',
      item
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/items/:id - Update item
router.put('/items/:id', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }
    
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({
      message: 'Item updated successfully',
      item
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/items/:id - Delete item
router.delete('/items/:id', async (req, res, next) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
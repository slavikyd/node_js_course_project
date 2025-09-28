const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Room = require("../models/Room");
const { v4: uuidv4 } = require("uuid");

const indexRoutes = require('./index');
router.use('/*splat', indexRoutes);

router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().sort({ date: -1 });
    res.json({
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
});

// Get

router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post('/users', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }
    
    const newUser = new User({ name, description });
    const user = await newUser.save();
    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    next(error);
  }
});

// PUT 
router.put('/users/:id', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
});

// DELETE 
router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// POST rooms
router.post("/rooms", async (req, res) => {
  try {
    const { name } = req.body;
    const newRoom = new Room({ name, roomId: uuidv4() });
    await newRoom.save();
    res.json(newRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET rooms
router.get("/rooms", async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
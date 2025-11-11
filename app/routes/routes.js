const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Room = require('../models/Room');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');

const indexRoutes = require('./index');

// User API routes (all protected by auth)
router.get('/users', auth, async (req, res, next) => {
  try {
    const users = await User.find().sort({ date: -1 });
    res.json({ count: users.length, users });
  } catch (error) {
    next(error);
  }
});

router.get('/users/:id', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post('/users', auth, async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name || !description)
      return res.status(400).json({ error: 'Name and description required' });
    const newUser = new User({ name, description });
    const user = await newUser.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    next(error);
  }
});

router.put('/users/:id', auth, async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name || !description)
      return res.status(400).json({ error: 'Name and description required' });
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id', auth, async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Room API routes (protected)
router.post('/rooms', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Room name required' });
    const newRoom = new Room({ name, roomId: uuidv4() });
    await newRoom.save();
    res.json(newRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/rooms', auth, async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Catch-all fallback for other routes: must be after all API routes
router.use('/*splat', indexRoutes);

module.exports = router;

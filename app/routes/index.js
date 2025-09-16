const express = require('express');
const router = express.Router();

// Welcome/health check endpoint
router.get('/*splat', (req, res) => {
  res.json({ 
    message: 'Welcome to the CRUD API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      getAllItems: 'GET /api/items',
      getItem: 'GET /api/items/:id',
      createItem: 'POST /api/items',
      updateItem: 'PUT /api/items/:id',
      deleteItem: 'DELETE /api/items/:id'
    }
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
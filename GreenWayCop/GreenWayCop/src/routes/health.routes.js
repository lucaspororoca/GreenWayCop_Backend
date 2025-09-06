const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/health', async (req, res) => {
  try {
    await db.get('SELECT 1');
    res.status(200).json({
      status: 'up',
      db: 'connected',
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({
      status: 'down',
      db: 'disconnected',
      error: err.message
    });
  }
});

module.exports = router;
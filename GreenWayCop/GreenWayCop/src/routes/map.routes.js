const express = require('express');
const router = express.Router();
const mapController = require('../controllers/map.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/maps', authMiddleware.verifyToken, mapController.getRoute);

module.exports = router;
const express = require('express');
const router = express.Router();
const loginController = require('../controllers/login.controller');
const registerController = require('../controllers/register.controller');

router.post('/login', loginController.login);
router.post('/register', registerController.register);

module.exports = router;
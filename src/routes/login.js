const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// User login route
router.post('/login', loginController.login);

// User registration route
router.post('/register', loginController.register);

module.exports = router;

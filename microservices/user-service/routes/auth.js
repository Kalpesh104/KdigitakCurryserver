const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Get current user (with JWT validation)
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;

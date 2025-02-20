const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  validateToken, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/authController');
const auth = require('../middleware/auth');

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Validate Token (New Route)
router.get('/validate', auth, validateToken);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;  // Remove the combined export
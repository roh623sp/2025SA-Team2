const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const  User  = require('../models/User');
const auth = require('../middleware/auth');

// Middleware for protected routes (Corrected export)
// const auth = async (req, res, next) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', ''); // Added optional chaining
//     if (!token) {
//       return res.status(401).send({ error: 'No token provided' }); // Explicitly handle no token case
//     }
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findOne({ _id: decoded._id });
//     if (!user) {
//       return res.status(401).send({ error: 'User not found' }); // Explicitly handle user not found
//     }
//     req.user = user;
//     next();
//   } catch (error) {
//     console.error("Auth error:", error); // Log the error for debugging
//     res.status(401).send({ error: 'Authentication failed' }); // More generic error message
//   }
// };

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ error: 'Email already exists' });
    }

    // Create new user - password will be hashed by the model middleware
    const user = new User({ username, email, password });
    await user.save();
    
    // Generate token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    
    // Send response without password
    const userToSend = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    res.status(201).send({ user: userToSend, token });
  } catch (error) {
    console.error("Register error:", error);
    res.status(400).send({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).send({ error: 'Invalid login credentials' });
    }

    // Use the matchPassword method from the User model
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).send({ error: 'Invalid login credentials' });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    // Send only necessary user information
    const userToSend = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.send({ user: userToSend, token });
    // generateMockData();
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).send({ error: error.message });
  }
});

// Validate Token (New Route)
router.get('/validate', auth, async (req, res) => {
  try {
    res.send(req.user); // If auth middleware passes, user is valid
  } catch (error) {
    res.status(401).send({ error: 'Invalid token' }); // Should not happen if auth middleware works
  }
});

module.exports = router;  // Remove the combined export
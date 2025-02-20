const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: 'Error registering user', error });
  }
};

// Authenticate user (login)
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1000h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private (Bearer Token required)
const getUserProfile = async (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(req.user);  // req.user is set by the protect middleware
};

module.exports = { getUserProfile };


module.exports = { registerUser, loginUser, getUserProfile };

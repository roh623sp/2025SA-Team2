const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/email'); // You'll need to implement this

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ error: 'Email already exists' });
    }

    const user = new User({ username, email, password });
    await user.save();
    
    const token = jwt.sign(
      { _id: user._id }, 
      process.env.JWT_SECRET
    );
    
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
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).send({ error: 'Invalid login credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).send({ error: 'Invalid login credentials' });
    }

    const token = jwt.sign(
      { _id: user._id }, 
      process.env.JWT_SECRET
    );

    const userToSend = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.send({ user: userToSend, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).send({ error: error.message });
  }
};

const validateToken = async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    res.status(401).send({ error: 'Invalid token' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ error: 'No account with that email exists' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Token expires in 1 hour
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Email content
    const message = `
      You requested a password reset. Click the link below to reset your password:
      ${resetUrl}
      
      If you didn't request this, please ignore this email.
      This link will expire in 1 hour.
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message
      });

      res.send({ message: 'Password reset email sent' });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      console.log(error);

      return res.status(500).send({ error: 'Error sending email' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).send({ error: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).send({ error: 'Invalid or expired reset token' });
    }

    // Validate password
    if (!req.body.password) {
      return res.status(400).send({ error: 'Password is required' });
    }

    if (req.body.password.length < 6) {
      return res.status(400).send({ error: 'Password must be at least 6 characters' });
    }

    // Update password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Generate new JWT
    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET
    );

    res.send({ message: 'Password reset successful', token });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).send({ error: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  validateToken,
  forgotPassword,
  resetPassword
}; 
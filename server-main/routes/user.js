const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');  // Move auth middleware to separate file

// Update Profile
router.patch('/profile', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['firstName', 'lastName', 'company', 'position', 'phone'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates!' });
    }
    
    try {
      updates.forEach(update => req.user.profile[update] = req.body[update]);
      await req.user.save();
      res.send(req.user);
    } catch (error) {
      res.status(400).send(error);
    }
  });
  
  // Update Settings
  router.patch('/settings', auth, async (req, res) => {
    try {
      const { notifications, theme, dashboardLayout } = req.body;
      req.user.settings = { ...req.user.settings, notifications, theme, dashboardLayout };
      await req.user.save();
      res.send(req.user.settings);
    } catch (error) {
      res.status(400).send(error);
    }
  });

module.exports = router;
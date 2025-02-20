const express = require('express');
const router = express.Router();
const { 
  updateProfile, 
  updateSettings, 
  deleteAccount 
} = require('../controllers/userController');
const auth = require('../middleware/auth');

router.patch('/profile', auth, updateProfile);
router.patch('/settings', auth, updateSettings);
router.delete('/account', auth, deleteAccount);

module.exports = router;
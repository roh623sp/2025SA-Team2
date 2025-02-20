const express = require('express');
const router = express.Router();
const {
  submitOnboardingQuiz,
  getOnboardingStatus,
  updateOnboardingInfo
} = require('../controllers/onboardingController');
const auth = require('../middleware/auth');

router.post('/submit', auth, submitOnboardingQuiz);
router.get('/status', auth, getOnboardingStatus);
router.patch('/update', auth, updateOnboardingInfo);

module.exports = router;
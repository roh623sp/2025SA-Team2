const User = require('../models/User');

const submitOnboardingQuiz = async (req, res) => {
  try {
    const {
      goals,
      currentMetrics,
      preferences
    } = req.body;

    // Validate required fields
    if (!goals || !currentMetrics || !preferences) {
      return res.status(400).send({
        error: 'Missing required onboarding information'
      });
    }

    // Update user's onboarding information
    req.user.onboarding = {
      completed: true,
      completedAt: new Date(),
      fitnessProfile: {
        goals,
        currentMetrics,
        preferences
      }
    };

    await req.user.save();

    res.send({
      message: 'Onboarding completed successfully',
      onboarding: req.user.onboarding
    });
  } catch (error) {
    console.error('Onboarding submission error:', error);
    res.status(500).send({
      error: 'Error saving onboarding information'
    });
  }
};

const getOnboardingStatus = async (req, res) => {
  try {
    res.send({
      onboarding: req.user.onboarding
    });
  } catch (error) {
    console.error('Onboarding status error:', error);
    res.status(500).send({
      error: 'Error fetching onboarding status'
    });
  }
};

const updateOnboardingInfo = async (req, res) => {
  try {
    const updates = req.body;
    
    // Merge existing onboarding data with updates
    req.user.onboarding.fitnessProfile = {
      ...req.user.onboarding.fitnessProfile,
      ...updates
    };

    await req.user.save();

    res.send({
      message: 'Onboarding information updated successfully',
      onboarding: req.user.onboarding
    });
  } catch (error) {
    console.error('Onboarding update error:', error);
    res.status(500).send({
      error: 'Error updating onboarding information'
    });
  }
};

module.exports = {
  submitOnboardingQuiz,
  getOnboardingStatus,
  updateOnboardingInfo
};
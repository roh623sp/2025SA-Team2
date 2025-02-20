const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  profile: {
    firstName: String,
    lastName: String,
    company: String,
    position: String,
    phone: String
  },
  avatar: String,
  settings: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: false },
    autoSave: { type: Boolean, default: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  onboarding: {
    completed: { type: Boolean, default: false },
    completedAt: Date,
    fitnessProfile: {
      goals: [{
        type: String,
        enum: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness']
      }],
      currentMetrics: {
        height: Number,  // in cm
        weight: Number,  // in kg
        age: Number,
        gender: {
          type: String,
          enum: ['male', 'female', 'other', 'prefer_not_to_say']
        },
        activityLevel: {
          type: String,
          enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']
        }
      },
      preferences: {
        workoutFrequency: {
          type: Number,  // days per week
          min: 1,
          max: 7
        },
        preferredWorkoutDuration: {
          type: Number,  // minutes
          min: 15,
          max: 120
        },
        workoutLocation: {
          type: String,
          enum: ['gym', 'home', 'outdoors', 'hybrid']
        },
        equipmentAccess: [{
          type: String,
          enum: ['full_gym', 'dumbbells', 'resistance_bands', 'bodyweight_only', 'cardio_machines']
        }],
        preferredWorkoutTypes: [{
          type: String,
          enum: ['strength_training', 'cardio', 'hiit', 'yoga', 'pilates', 'calisthenics']
        }],
        healthConditions: [{
          type: String,
          enum: ['none', 'back_pain', 'joint_pain', 'heart_condition', 'diabetes', 'pregnancy', 'other']
        }]
      }
    }
  }
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

const User = mongoose.model('User', userSchema);
module.exports = User;

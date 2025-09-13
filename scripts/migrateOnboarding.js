const mongoose = require('mongoose');
require('dotenv').config();

// User schema (same as in models/User.js)
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  preferences: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    health: {
      dietaryRestrictions: [String],
      fitnessGoals: [String],
      medicalConditions: [String]
    },
    lifestyle: {
      wakeUpTime: String,
      sleepTime: String,
      workHours: {
        start: String,
        end: String
      }
    }
  },
  emergencyContacts: [{
    name: String,
    relationship: String,
    phone: String,
    email: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function migrateOnboarding() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/untangle';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find all users that don't have onboardingCompleted field or it's undefined
    const usersToUpdate = await User.find({
      $or: [
        { onboardingCompleted: { $exists: false } },
        { onboardingCompleted: null },
        { onboardingCompleted: undefined }
      ]
    });

    console.log(`Found ${usersToUpdate.length} users to update`);

    if (usersToUpdate.length > 0) {
      // Update all users to set onboardingCompleted to false
      const result = await User.updateMany(
        {
          $or: [
            { onboardingCompleted: { $exists: false } },
            { onboardingCompleted: null },
            { onboardingCompleted: undefined }
          ]
        },
        { $set: { onboardingCompleted: false } }
      );

      console.log(`Updated ${result.modifiedCount} users with onboardingCompleted: false`);
    } else {
      console.log('No users need updating');
    }

    // Verify the update
    const totalUsers = await User.countDocuments();
    const usersWithOnboarding = await User.countDocuments({ onboardingCompleted: { $exists: true } });
    
    console.log(`Total users: ${totalUsers}`);
    console.log(`Users with onboardingCompleted field: ${usersWithOnboarding}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateOnboarding();


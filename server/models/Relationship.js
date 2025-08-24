const mongoose = require('mongoose');

const relationshipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['family', 'friend', 'colleague', 'romantic', 'professional', 'acquaintance', 'other'],
    required: true
  },
  relationship: {
    type: String,
    enum: ['spouse', 'parent', 'child', 'sibling', 'cousin', 'grandparent', 'friend', 'colleague', 'boss', 'employee', 'client', 'mentor', 'mentee', 'other'],
    required: true
  },
  contact: {
    email: String,
    phone: String,
    address: String,
    socialMedia: {
      linkedin: String,
      facebook: String,
      instagram: String,
      twitter: String
    }
  },
  personalInfo: {
    dateOfBirth: Date,
    anniversary: Date,
    occupation: String,
    company: String,
    interests: [String],
    preferences: {
      communication: [String],
      gifts: [String],
      food: [String],
      activities: [String]
    }
  },
  importantDates: [{
    title: String,
    date: Date,
    type: {
      type: String,
      enum: ['birthday', 'anniversary', 'graduation', 'promotion', 'other']
    },
    reminder: {
      enabled: { type: Boolean, default: true },
      daysInAdvance: { type: Number, default: 7 }
    },
    notes: String
  }],
  communication: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'rarely']
    },
    preferredMethod: {
      type: String,
      enum: ['phone', 'email', 'text', 'video-call', 'in-person', 'social-media']
    },
    lastContact: Date,
    nextContact: Date
  },
  notes: String,
  tags: [String],
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

const communicationLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relationshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['phone', 'email', 'text', 'video-call', 'in-person', 'social-media', 'other'],
    required: true
  },
  direction: {
    type: String,
    enum: ['incoming', 'outgoing', 'both'],
    default: 'both'
  },
  duration: Number, // in minutes
  subject: String,
  summary: String,
  keyPoints: [String],
  actionItems: [{
    description: String,
    assignedTo: String,
    dueDate: Date,
    completed: { type: Boolean, default: false }
  }],
  mood: {
    type: String,
    enum: ['excellent', 'good', 'neutral', 'down', 'anxious', 'stressed']
  },
  quality: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor']
  },
  followUp: {
    required: { type: Boolean, default: false },
    date: Date,
    notes: String
  },
  attachments: [{
    filename: String,
    url: String,
    type: String
  }],
  notes: String
}, {
  timestamps: true
});

const giftSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relationshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Relationship',
    required: true
  },
  occasion: {
    type: String,
    enum: ['birthday', 'anniversary', 'holiday', 'graduation', 'promotion', 'housewarming', 'other'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  gift: {
    name: String,
    description: String,
    price: Number,
    currency: { type: String, default: 'USD' },
    purchased: { type: Boolean, default: false },
    wrapped: { type: Boolean, default: false },
    delivered: { type: Boolean, default: false }
  },
  recipient: {
    name: String,
    relationship: String
  },
  notes: String,
  budget: Number,
  status: {
    type: String,
    enum: ['planned', 'purchased', 'wrapped', 'delivered', 'given'],
    default: 'planned'
  }
}, {
  timestamps: true
});

const socialEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['party', 'dinner', 'coffee', 'activity', 'celebration', 'other'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: String,
  duration: Number, // in minutes
  location: String,
  description: String,
  attendees: [{
    relationshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Relationship' },
    name: String,
    rsvp: { type: String, enum: ['yes', 'no', 'maybe', 'pending'], default: 'pending' },
    notes: String
  }],
  budget: Number,
  expenses: [{
    description: String,
    amount: Number,
    paidBy: String,
    date: Date
  }],
  planning: {
    tasks: [{
      description: String,
      assignedTo: String,
      dueDate: Date,
      completed: { type: Boolean, default: false }
    }],
    notes: String
  },
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed', 'cancelled'],
    default: 'planned'
  },
  photos: [String],
  notes: String
}, {
  timestamps: true
});

// Indexes
relationshipSchema.index({ userId: 1, type: 1 });
relationshipSchema.index({ userId: 1, status: 1 });
relationshipSchema.index({ userId: 1, 'importantDates.date': 1 });
communicationLogSchema.index({ userId: 1, relationshipId: 1, date: -1 });
giftSchema.index({ userId: 1, date: 1 });
socialEventSchema.index({ userId: 1, date: 1 });

// Virtual for upcoming important dates
relationshipSchema.virtual('upcomingDates').get(function() {
  if (!this.importantDates) return [];
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  return this.importantDates.filter(date => 
    date.date >= now && date.date <= thirtyDaysFromNow
  ).sort((a, b) => a.date - b.date);
});

// Virtual for days since last contact
relationshipSchema.virtual('daysSinceLastContact').get(function() {
  if (!this.communication.lastContact) return null;
  const now = new Date();
  const diffTime = Math.abs(now - this.communication.lastContact);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to add important date
relationshipSchema.methods.addImportantDate = function(dateData) {
  this.importantDates.push(dateData);
  this.importantDates.sort((a, b) => a.date - b.date);
  return this.save();
};

// Method to update last contact
relationshipSchema.methods.updateLastContact = function() {
  this.communication.lastContact = new Date();
  return this.save();
};

// Method to log communication
relationshipSchema.methods.logCommunication = function(communicationData) {
  // This would typically be done through the CommunicationLog model
  // but we can update the relationship's last contact info
  this.communication.lastContact = new Date();
  return this.save();
};

// Method to add gift idea
relationshipSchema.methods.addGiftIdea = function(giftData) {
  // This would typically be done through the Gift model
  // but we can store basic gift preferences
  if (!this.personalInfo.preferences.gifts) {
    this.personalInfo.preferences.gifts = [];
  }
  if (giftData.idea && !this.personalInfo.preferences.gifts.includes(giftData.idea)) {
    this.personalInfo.preferences.gifts.push(giftData.idea);
  }
  return this.save();
};

module.exports = {
  Relationship: mongoose.model('Relationship', relationshipSchema),
  CommunicationLog: mongoose.model('CommunicationLog', communicationLogSchema),
  Gift: mongoose.model('Gift', giftSchema),
  SocialEvent: mongoose.model('SocialEvent', socialEventSchema)
};

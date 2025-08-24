const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['cardio', 'strength', 'flexibility', 'sports', 'yoga', 'pilates', 'other'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  intensity: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    default: 'moderate'
  },
  caloriesBurned: Number,
  exercises: [{
    name: String,
    sets: Number,
    reps: Number,
    weight: Number,
    duration: Number,
    notes: String
  }],
  notes: String,
  mood: {
    type: String,
    enum: ['great', 'good', 'okay', 'tired', 'exhausted']
  },
  energyBefore: {
    type: Number,
    min: 1,
    max: 10
  },
  energyAfter: {
    type: Number,
    min: 1,
    max: 10
  }
}, {
  timestamps: true
});

const mealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  ingredients: [{
    name: String,
    quantity: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  }],
  totalCalories: Number,
  totalProtein: Number,
  totalCarbs: Number,
  totalFat: Number,
  preparationTime: Number, // in minutes
  cookingTime: Number, // in minutes
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  recipe: {
    instructions: [String],
    source: String,
    url: String
  },
  mood: {
    type: String,
    enum: ['satisfied', 'full', 'still-hungry', 'overstuffed']
  },
  notes: String,
  photo: String
}, {
  timestamps: true
});

const healthLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  weight: Number,
  bodyFat: Number,
  muscleMass: Number,
  hydration: {
    type: Number,
    min: 0,
    max: 100 // percentage
  },
  sleep: {
    hours: Number,
    quality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    notes: String
  },
  stress: {
    level: {
      type: Number,
      min: 1,
      max: 10
    },
    factors: [String],
    copingStrategies: [String]
  },
  mood: {
    type: String,
    enum: ['excellent', 'good', 'neutral', 'down', 'anxious', 'stressed']
  },
  energy: {
    type: Number,
    min: 1,
    max: 10
  },
  symptoms: [{
    name: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    notes: String
  }],
  medications: [{
    name: String,
    dosage: String,
    time: String,
    taken: Boolean
  }],
  notes: String
}, {
  timestamps: true
});

// Indexes
workoutSchema.index({ userId: 1, date: -1 });
mealSchema.index({ userId: 1, date: -1, mealType: 1 });
healthLogSchema.index({ userId: 1, date: -1 });

// Virtual for workout duration in hours
workoutSchema.virtual('durationHours').get(function() {
  return (this.duration / 60).toFixed(2);
});

// Method to calculate total calories burned
workoutSchema.methods.calculateCalories = function() {
  // Basic calculation - can be enhanced with more sophisticated algorithms
  const baseCalories = this.duration * 5; // 5 calories per minute base
  const intensityMultiplier = {
    'low': 0.8,
    'moderate': 1.0,
    'high': 1.5
  };
  this.caloriesBurned = Math.round(baseCalories * intensityMultiplier[this.intensity]);
  return this.caloriesBurned;
};

// Method to add exercise
workoutSchema.methods.addExercise = function(exercise) {
  this.exercises.push(exercise);
  return this.save();
};

// Method to calculate meal macros
mealSchema.methods.calculateMacros = function() {
  this.totalCalories = this.ingredients.reduce((sum, ing) => sum + (ing.calories || 0), 0);
  this.totalProtein = this.ingredients.reduce((sum, ing) => sum + (ing.protein || 0), 0);
  this.totalCarbs = this.ingredients.reduce((sum, ing) => sum + (ing.carbs || 0), 0);
  this.totalFat = this.ingredients.reduce((sum, ing) => sum + (ing.fat || 0), 0);
  return this.save();
};

module.exports = {
  Workout: mongoose.model('Workout', workoutSchema),
  Meal: mongoose.model('Meal', mealSchema),
  HealthLog: mongoose.model('HealthLog', healthLogSchema)
};

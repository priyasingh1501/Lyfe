const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FoodTracking = require('../models/FoodTracking');

// Get all food tracking entries for a user
router.get('/', auth, async (req, res) => {
  try {
    const { startDate, endDate, mealType } = req.query;
    const userId = req.user.userId;
    
    let query = { userId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (mealType) {
      query.mealType = mealType;
    }
    
    const foodEntries = await FoodTracking.find(query)
      .sort({ date: -1, mealType: 1 })
      .limit(100);
    
    res.json(foodEntries);
  } catch (error) {
    console.error('Error fetching food entries:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get weekly nutrition summary
router.get('/weekly-summary', auth, async (req, res) => {
  try {
    const { weekStart } = req.query;
    const userId = req.user.userId;
    
    let startDate, endDate;
    
    if (weekStart) {
      startDate = new Date(weekStart);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
    } else {
      // Default to current week
      const now = new Date();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    }
    
    const weeklyEntries = await FoodTracking.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    });
    
    // Calculate weekly nutrition metrics
    const summary = {
      totalMeals: weeklyEntries.length,
      carbHeavy: weeklyEntries.filter(entry => entry.isCarbHeavy).length,
      fatHeavy: weeklyEntries.filter(entry => entry.isFatHeavy).length,
      processed: weeklyEntries.filter(entry => entry.isProcessed).length,
      fiberRich: weeklyEntries.filter(entry => entry.isFiberRich).length,
      proteinHeavy: weeklyEntries.filter(entry => entry.isProteinHeavy).length,
      ironRich: weeklyEntries.filter(entry => entry.isIronRich).length,
      highSugar: weeklyEntries.filter(entry => entry.isHighSugar).length,
      averageSatiety: weeklyEntries.length > 0 
        ? (weeklyEntries.reduce((sum, entry) => sum + entry.satiety, 0) / weeklyEntries.length).toFixed(1)
        : 0,
      averageCravings: weeklyEntries.length > 0
        ? (weeklyEntries.reduce((sum, entry) => sum + entry.postMealCravings, 0) / weeklyEntries.length).toFixed(1)
        : 0,
      mindfulMeals: weeklyEntries.filter(entry => entry.mindfulPractice !== 'none').length
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get health goals progress
router.get('/health-goals', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.userId;
    
    let query = { userId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const entries = await FoodTracking.find(query);
    
    const goals = {
      steady_energy: {
        count: entries.filter(entry => entry.healthGoals.includes('steady_energy')).length,
        total: entries.length
      },
      muscle_building: {
        count: entries.filter(entry => entry.healthGoals.includes('muscle_building')).length,
        total: entries.length
      },
      gut_comfort: {
        count: entries.filter(entry => entry.healthGoals.includes('gut_comfort')).length,
        total: entries.length
      },
      immunity_building: {
        count: entries.filter(entry => entry.healthGoals.includes('immunity_building')).length,
        total: entries.length
      }
    };
    
    res.json(goals);
  } catch (error) {
    console.error('Error fetching health goals:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new food tracking entry
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const foodData = { ...req.body, userId };
    
    const foodEntry = new FoodTracking(foodData);
    
    // Calculate nutrition analysis
    foodEntry.calculateNutritionAnalysis();
    
    await foodEntry.save();
    
    res.status(201).json(foodEntry);
  } catch (error) {
    console.error('Error creating food entry:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update food tracking entry
router.put('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    
    const foodEntry = await FoodTracking.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!foodEntry) {
      return res.status(404).json({ message: 'Food entry not found' });
    }
    
    // Recalculate nutrition analysis
    foodEntry.calculateNutritionAnalysis();
    await foodEntry.save();
    
    res.json(foodEntry);
  } catch (error) {
    console.error('Error updating food entry:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete food tracking entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    
    const foodEntry = await FoodTracking.findOneAndDelete({ _id: id, userId });
    
    if (!foodEntry) {
      return res.status(404).json({ message: 'Food entry not found' });
    }
    
    res.json({ message: 'Food entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting food entry:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

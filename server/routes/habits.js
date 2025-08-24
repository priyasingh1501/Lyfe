const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const HabitCheckin = require('../models/HabitCheckin');

// Get all habit check-ins for a user
router.get('/', auth, async (req, res) => {
  try {
    const { date, habit, goalId } = req.query;
    
    const query = { userId: req.user.userId };
    
    if (date) {
      const checkDate = new Date(date);
      const startOfDay = new Date(checkDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(checkDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }
    
    if (habit) {
      query.habit = habit;
    }
    
    if (goalId) {
      query.goalId = goalId;
    }
    
    const checkins = await HabitCheckin.find(query)
      .sort({ date: -1 })
      .populate('goalId');
    
    res.json(checkins);
  } catch (error) {
    console.error('Error fetching habit check-ins:', error);
    res.status(500).json({ message: 'Error fetching habit check-ins' });
  }
});

// Create a new habit check-in
router.post('/', auth, async (req, res) => {
  try {
    const { habit, date, valueMin, goalId, notes, quality } = req.body;
    
    const checkin = new HabitCheckin({
      userId: req.user.userId,
      habit,
      date: date || new Date(),
      valueMin,
      goalId,
      notes,
      quality
    });
    
    await checkin.save();
    
    // Populate goal info for response
    await checkin.populate('goalId');
    
    res.status(201).json(checkin);
  } catch (error) {
    console.error('Error creating habit check-in:', error);
    res.status(500).json({ message: 'Error creating habit check-in' });
  }
});

// Update a habit check-in
router.put('/:id', auth, async (req, res) => {
  try {
    const { habit, date, valueMin, goalId, notes, quality } = req.body;
    
    const checkin = await HabitCheckin.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { habit, date, valueMin, goalId, notes, quality },
      { new: true, runValidators: true }
    );
    
    if (!checkin) {
      return res.status(404).json({ message: 'Habit check-in not found' });
    }
    
    await checkin.populate('goalId');
    res.json(checkin);
  } catch (error) {
    console.error('Error updating habit check-in:', error);
    res.status(500).json({ message: 'Error updating habit check-in' });
  }
});

// Delete a habit check-in
router.delete('/:id', auth, async (req, res) => {
  try {
    const checkin = await HabitCheckin.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!checkin) {
      return res.status(404).json({ message: 'Habit check-in not found' });
    }
    
    res.json({ message: 'Habit check-in deleted successfully' });
  } catch (error) {
    console.error('Error deleting habit check-in:', error);
    res.status(500).json({ message: 'Error deleting habit check-in' });
  }
});

// Get habit statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { startDate, endDate, habit } = req.query;
    
    const query = { userId: req.user.userId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (habit) {
      query.habit = habit;
    }
    
    const stats = await HabitCheckin.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$habit',
          totalCheckins: { $sum: 1 },
          totalMinutes: { $sum: '$valueMin' },
          averageMinutes: { $avg: '$valueMin' },
          lastCheckin: { $max: '$date' }
        }
      },
      { $sort: { totalCheckins: -1 } }
    ]);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching habit statistics:', error);
    res.status(500).json({ message: 'Error fetching habit statistics' });
  }
});

// Get common habits
router.get('/common', auth, async (req, res) => {
  try {
    const habits = await HabitCheckin.aggregate([
      { $match: { userId: req.user.userId } },
      {
        $group: {
          _id: '$habit',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json(habits.map(h => h._id));
  } catch (error) {
    console.error('Error fetching common habits:', error);
    res.status(500).json({ message: 'Error fetching common habits' });
  }
});

module.exports = router;

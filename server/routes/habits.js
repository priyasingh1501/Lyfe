const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Habit = require('../models/Habit');
const HabitCheckin = require('../models/HabitCheckin');

// Get all habits for a user
router.get('/', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get habits that are active today (within date range)
    const habits = await Habit.find({ 
      userId: req.user.userId, 
      isActive: true,
      startDate: { $lte: today },
      endDate: { $gte: today }
    })
      .sort({ startDate: -1 })
      .populate('goalId');
    
    console.log(`✅ Found ${habits.length} active habits for user`);
    res.json(habits);
  } catch (error) {
    console.error('❌ Error fetching habits:', error);
    res.status(500).json({ message: 'Error fetching habits' });
  }
});

// Create a new habit
router.post('/', auth, async (req, res) => {
  try {
    const { habit, valueMin, notes, endDate, quality, goalId } = req.body;
    
    if (!endDate) {
      return res.status(400).json({ message: 'End date is required for habits' });
    }
    
    const newHabit = new Habit({
      userId: req.user.userId,
      habit,
      valueMin,
      notes,
      startDate: new Date(), // Start from today
      endDate: new Date(endDate),
      quality: quality || 'good',
      goalId
    });
    
    await newHabit.save();
    await newHabit.populate('goalId');
    
    console.log('✅ New habit created:', newHabit.habit, 'until', newHabit.endDate);
    res.status(201).json(newHabit);
  } catch (error) {
    console.error('❌ Error creating habit:', error);
    res.status(500).json({ message: 'Error creating habit' });
  }
});

// Update a habit
router.put('/:id', auth, async (req, res) => {
  try {
    const { habit, description, valueMin, goalId, quality, frequency, tags, isActive, isCompleted, completedDate } = req.body;
    
    const updatedHabit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { 
        habit, 
        description, 
        valueMin, 
        goalId, 
        quality, 
        frequency, 
        tags,
        isActive,
        isCompleted,
        completedDate
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedHabit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    await updatedHabit.populate('goalId');
    res.json(updatedHabit);
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ message: 'Error updating habit' });
  }
});

// Delete a habit
router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ message: 'Error deleting habit' });
  }
});

// Get habit check-ins for a specific date
router.get('/checkins/:date', auth, async (req, res) => {
  try {
    const { date } = req.params;
    const checkDate = new Date(date);
    const startOfDay = new Date(checkDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(checkDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const checkins = await HabitCheckin.find({
      userId: req.user.userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('goalId');
    
    res.json(checkins);
  } catch (error) {
    console.error('Error fetching habit check-ins:', error);
    res.status(500).json({ message: 'Error fetching habit check-ins' });
  }
});

// Create a new habit check-in
router.post('/checkins', auth, async (req, res) => {
  try {
    const { habitId, date, valueMin, notes, quality } = req.body;
    
    // Get the habit to ensure it exists
    const habit = await Habit.findOne({ _id: habitId, userId: req.user.userId });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    const checkin = new HabitCheckin({
      userId: req.user.userId,
      habit: habit.habit,
      date: date || new Date(),
      valueMin,
      goalId: habit.goalId,
      notes,
      quality
    });
    
    await checkin.save();
    await checkin.populate('goalId');
    
    res.status(201).json(checkin);
  } catch (error) {
    console.error('Error creating habit check-in:', error);
    res.status(500).json({ message: 'Error creating habit check-in' });
  }
});

// Update a habit check-in
router.put('/checkins/:id', auth, async (req, res) => {
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
router.delete('/checkins/:id', auth, async (req, res) => {
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

// Add daily check-in to a habit
router.post('/:id/checkin', auth, async (req, res) => {
  try {
    const { date, completed, duration, notes, quality } = req.body;
    
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    // Add check-in using the model method
    habit.addCheckin(date || new Date(), completed, duration, notes, quality);
    await habit.save();
    
    console.log('✅ Habit check-in added:', habit.habit, 'for date:', date);
    res.json({
      message: 'Habit check-in added successfully',
      habit,
      todayCheckin: habit.getTodayCheckin()
    });
  } catch (error) {
    console.error('❌ Error adding habit check-in:', error);
    res.status(500).json({ message: 'Error adding habit check-in' });
  }
});

// Get habit check-ins for a specific habit
router.get('/:id/checkins', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    let checkins = habit.checkins;
    
    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      checkins = habit.checkins.filter(c => {
        const cDate = new Date(c.date);
        return cDate >= start && cDate <= end;
      });
    }
    
    res.json({
      habit: {
        _id: habit._id,
        habit: habit.habit,
        valueMin: habit.valueMin
      },
      checkins: checkins.sort((a, b) => new Date(b.date) - new Date(a.date))
    });
  } catch (error) {
    console.error('❌ Error fetching habit check-ins:', error);
    res.status(500).json({ message: 'Error fetching habit check-ins' });
  }
});

module.exports = router;

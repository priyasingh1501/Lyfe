const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MindfulnessCheckin = require('../models/MindfulnessCheckin');

// Get all mindfulness check-ins for a user
router.get('/', auth, async (req, res) => {
  try {
    const { date, startDate, endDate, limit } = req.query;
    
    const query = { userId: req.user.userId };
    
    if (date) {
      const checkDate = new Date(date);
      const startOfDay = new Date(checkDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(checkDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      query.date = { $gte: start, $lte: end };
    }
    
    let queryOptions = { sort: { date: -1 } };
    if (limit) {
      queryOptions.limit = parseInt(limit);
    }
    
    const checkins = await MindfulnessCheckin.find(query, null, queryOptions);
    
    res.json(checkins);
  } catch (error) {
    console.error('Error fetching mindfulness check-ins:', error);
    res.status(500).json({ message: 'Error fetching mindfulness check-ins' });
  }
});

// Get mindfulness check-in for a specific date
router.get('/date/:date', auth, async (req, res) => {
  try {
    const { date } = req.params;
    const checkDate = new Date(date);
    const startOfDay = new Date(checkDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(checkDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const checkin = await MindfulnessCheckin.findOne({
      userId: req.user.userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    
    if (!checkin) {
      return res.status(404).json({ message: 'No mindfulness check-in found for this date' });
    }
    
    res.json(checkin);
  } catch (error) {
    console.error('Error fetching mindfulness check-in for date:', error);
    res.status(500).json({ message: 'Error fetching mindfulness check-in' });
  }
});

// Get mindfulness statistics for a date range
router.get('/stats', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    const checkins = await MindfulnessCheckin.find({
      userId: req.user.userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });
    
    if (checkins.length === 0) {
      return res.json({
        totalCheckins: 0,
        averageScore: 0,
        scoreTrend: [],
        dimensionAverages: {},
        overallAssessment: 'beginner'
      });
    }
    
    // Calculate statistics
    const totalCheckins = checkins.length;
    const totalScore = checkins.reduce((sum, checkin) => sum + checkin.totalScore, 0);
    const averageScore = totalScore / totalCheckins;
    
    // Score trend over time
    const scoreTrend = checkins.map(checkin => ({
      date: checkin.date,
      score: checkin.totalScore
    }));
    
    // Dimension averages
    const dimensionTotals = {
      presence: 0,
      emotionAwareness: 0,
      intentionality: 0,
      attentionQuality: 0,
      compassion: 0
    };
    
    checkins.forEach(checkin => {
      dimensionTotals.presence += checkin.dimensions.presence.rating;
      dimensionTotals.emotionAwareness += checkin.dimensions.emotionAwareness.rating;
      dimensionTotals.intentionality += checkin.dimensions.intentionality.rating;
      dimensionTotals.attentionQuality += checkin.dimensions.attentionQuality.rating;
      dimensionTotals.compassion += checkin.dimensions.compassion.rating;
    });
    
    const dimensionAverages = {};
    Object.keys(dimensionTotals).forEach(dimension => {
      dimensionAverages[dimension] = dimensionTotals[dimension] / totalCheckins;
    });
    
    // Most recent overall assessment
    const latestCheckin = checkins[0];
    
    res.json({
      totalCheckins,
      averageScore: Math.round(averageScore * 100) / 100,
      scoreTrend,
      dimensionAverages,
      overallAssessment: latestCheckin.overallAssessment
    });
    
  } catch (error) {
    console.error('Error fetching mindfulness statistics:', error);
    res.status(500).json({ message: 'Error fetching mindfulness statistics' });
  }
});

// Create a new mindfulness check-in
router.post('/', auth, async (req, res) => {
  try {
    const {
      date: customDate,
      dimensions,
      totalScore,
      overallAssessment,
      dailyNotes,
      dayReflection
    } = req.body;
    
    // Use custom date if provided, otherwise use today
    const checkinDate = customDate ? new Date(customDate) : new Date();
    const startOfDay = new Date(checkinDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(checkinDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingCheckin = await MindfulnessCheckin.findOne({
      userId: req.user.userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });
    
    if (existingCheckin) {
      // Update existing check-in instead of creating new one
      console.log('Updating existing check-in for today:', existingCheckin._id);
      
      const updatedCheckin = await MindfulnessCheckin.findOneAndUpdate(
        { _id: existingCheckin._id, userId: req.user.userId },
        { dimensions, totalScore, overallAssessment, dailyNotes, dayReflection },
        { new: true, runValidators: true }
      );
      
      // Create journal entry for day reflection if provided
      const journalEntries = [];
      
      if (dayReflection && dayReflection.trim()) {
        console.log('📝 Adding mindfulness reflection to journal book:', dayReflection);
        
        const reflectionNote = await addMindfulnessReflectionToJournal(
          req.user.userId,
          `Daily Reflection - ${checkinDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}`,
          dayReflection,
          ['mindfulness', 'daily-reflection', 'journal']
        );
        
        console.log('📝 Reflection note added to journal book:', reflectionNote._id);
        
        journalEntries.push({
          entryId: reflectionNote._id,
          type: 'day_reflection',
          dimension: 'general'
        });
      } else {
        console.log('📝 No day reflection provided, skipping journal entry creation');
      }
      
      // Update check-in with journal entry references
      updatedCheckin.journalEntries = journalEntries;
      await updatedCheckin.save();
      
      return res.json({
        message: 'Mindfulness check-in updated successfully',
        checkin: updatedCheckin,
        journalEntriesCreated: journalEntries.length,
        wasUpdate: true
      });
    }
    
    // Create the check-in
    const checkin = new MindfulnessCheckin({
      userId: req.user.userId,
      date: checkinDate,
      dimensions,
      totalScore,
      overallAssessment,
      dailyNotes,
      dayReflection
    });
    
    await checkin.save();
    
    // Create journal entry for day reflection
    const journalEntries = [];
    
          if (dayReflection && dayReflection.trim()) {
        console.log('📝 Adding mindfulness reflection to journal book (update):', dayReflection);
        
        const reflectionNote = await addMindfulnessReflectionToJournal(
          req.user.userId,
          `Daily Reflection - ${checkinDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}`,
          dayReflection,
          ['mindfulness', 'daily-reflection', 'journal']
        );
        
        console.log('📝 Reflection note added to journal book (update):', reflectionNote._id);
        
        journalEntries.push({
          entryId: reflectionNote._id,
          type: 'day_reflection',
          dimension: 'general'
        });
      } else {
        console.log('📝 No day reflection provided for update, skipping journal entry creation');
      }
      

    
    // Update check-in with journal entry references
    checkin.journalEntries = journalEntries;
    await checkin.save();
    
    res.status(201).json({
      message: 'Mindfulness check-in created successfully',
      checkin,
      journalEntriesCreated: journalEntries.length
    });
    
  } catch (error) {
    console.error('Error creating mindfulness check-in:', error);
    res.status(500).json({ message: 'Error creating mindfulness check-in' });
  }
});

// Update a mindfulness check-in
router.put('/:id', auth, async (req, res) => {
  try {
    const { dimensions, totalScore, overallAssessment, dailyNotes, dayReflection } = req.body;
    
    const checkin = await MindfulnessCheckin.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { dimensions, totalScore, overallAssessment, dailyNotes, dayReflection },
      { new: true, runValidators: true }
    );
    
    if (!checkin) {
      return res.status(404).json({ message: 'Mindfulness check-in not found' });
    }
    
    res.json({
      message: 'Mindfulness check-in updated successfully',
      checkin
    });
    
  } catch (error) {
    console.error('Error updating mindfulness check-in:', error);
    res.status(500).json({ message: 'Error updating mindfulness check-in' });
  }
});

// Delete a mindfulness check-in
router.delete('/:id', auth, async (req, res) => {
  try {
    const checkin = await MindfulnessCheckin.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!checkin) {
      return res.status(404).json({ message: 'Mindfulness check-in not found' });
    }
    
    // Note: Journal entries are now stored as notes in the user's journal book
    // They will remain even if the mindfulness check-in is deleted
    console.log('📝 Mindfulness check-in deleted. Journal notes remain in user\'s journal book.');
    
    res.json({ message: 'Mindfulness check-in deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting mindfulness check-in:', error);
    res.status(500).json({ message: 'Error deleting mindfulness check-in' });
  }
});

// Helper function to add mindfulness reflection as a note to user's journal book
async function addMindfulnessReflectionToJournal(userId, title, content, tags) {
  try {
    // Find the user's default journal book
    const BookDocument = require('../models/BookDocument');
    let journalBook = await BookDocument.findOne({
      userId,
      isDefault: true
    });
    
    if (!journalBook) {
      // Create default journal if it doesn't exist
      const User = require('../models/User');
      const user = await User.findById(userId);
      journalBook = new BookDocument({
        userId,
        title: `${user.firstName}'s Journal`,
        description: 'Your personal reading and reflection journal',
        category: 'memoir',
        isDefault: true,
        status: 'currently_reading'
      });
      await journalBook.save();
    }
    
    // Add the reflection as a note
    const note = {
      content: content.trim(),
      location: 'Mindfulness Check-in',
      tags: tags || [],
      isImportant: true,
      isQuote: false
    };
    
    journalBook.notes.push(note);
    await journalBook.save();
    
    const newNote = journalBook.notes[journalBook.notes.length - 1];
    
    console.log('📝 Added mindfulness reflection to journal book:', journalBook.title);
    console.log('📝 Note content:', content.substring(0, 100) + '...');
    
    return newNote;
  } catch (error) {
    console.error('❌ Error adding mindfulness reflection to journal book:', error);
    throw error;
  }
}

module.exports = router;

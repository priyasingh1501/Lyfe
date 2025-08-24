const express = require('express');
const Journal = require('../models/Journal');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const User = require('../models/User');
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid or inactive user' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Get user's journal
router.get('/', authenticateToken, async (req, res) => {
  try {
    let journal = await Journal.findOne({ userId: req.user._id });
    
    if (!journal) {
      // Create new journal if it doesn't exist
      journal = new Journal({
        userId: req.user._id,
        entries: []
      });
      await journal.save();
    }
    
    res.json(journal);
  } catch (error) {
    console.error('Error fetching journal:', error);
    res.status(500).json({ message: 'Error fetching journal' });
  }
});

// Add new journal entry
router.post('/entries', authenticateToken, async (req, res) => {
  try {
    const { title, content, type, mood, tags, isPrivate, location, weather } = req.body;
    
    let journal = await Journal.findOne({ userId: req.user._id });
    
    if (!journal) {
      journal = new Journal({
        userId: req.user._id,
        entries: []
      });
    }
    
    const newEntry = {
      title,
      content,
      type: type || 'daily',
      mood: mood || 'neutral',
      tags: tags || [],
      isPrivate: isPrivate !== undefined ? isPrivate : journal.settings.defaultPrivacy === 'private',
      location,
      weather
    };
    
    journal.entries.unshift(newEntry); // Add to beginning
    await journal.save();
    
    res.status(201).json({
      message: 'Journal entry created successfully',
      entry: newEntry,
      journal
    });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ message: 'Error creating journal entry' });
  }
});

// Update journal entry
router.put('/entries/:entryId', authenticateToken, async (req, res) => {
  try {
    const { entryId } = req.params;
    const updates = req.body;
    
    const journal = await Journal.findOne({ userId: req.user._id });
    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }
    
    const entryIndex = journal.entries.findIndex(entry => entry._id.toString() === entryId);
    if (entryIndex === -1) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    
    // Update entry fields
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
        journal.entries[entryIndex][key] = updates[key];
      }
    });
    
    await journal.save();
    
    res.json({
      message: 'Entry updated successfully',
      entry: journal.entries[entryIndex]
    });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({ message: 'Error updating journal entry' });
  }
});

// Delete journal entry
router.delete('/entries/:entryId', authenticateToken, async (req, res) => {
  try {
    const { entryId } = req.params;
    
    const journal = await Journal.findOne({ userId: req.user._id });
    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }
    
    const entryIndex = journal.entries.findIndex(entry => entry._id.toString() === entryId);
    if (entryIndex === -1) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    
    journal.entries.splice(entryIndex, 1);
    await journal.save();
    
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ message: 'Error deleting journal entry' });
  }
});

// Get journal entry by ID
router.get('/entries/:entryId', authenticateToken, async (req, res) => {
  try {
    const { entryId } = req.params;
    
    const journal = await Journal.findOne({ userId: req.user._id });
    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }
    
    const entry = journal.entries.find(entry => entry._id.toString() === entryId);
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    
    res.json(entry);
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    res.status(500).json({ message: 'Error fetching journal entry' });
  }
});

// Get journal entries with filters
router.get('/entries', authenticateToken, async (req, res) => {
  try {
    const { type, mood, tags, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    const journal = await Journal.findOne({ userId: req.user._id });
    if (!journal) {
      return res.json({ entries: [], total: 0, page: 1, totalPages: 0 });
    }
    
    let filteredEntries = journal.entries;
    
    // Apply filters
    if (type) {
      filteredEntries = filteredEntries.filter(entry => entry.type === type);
    }
    
    if (mood) {
      filteredEntries = filteredEntries.filter(entry => entry.mood === mood);
    }
    
    if (tags && tags.length > 0) {
      filteredEntries = filteredEntries.filter(entry => 
        tags.some(tag => entry.tags.includes(tag))
      );
    }
    
    if (startDate || endDate) {
      filteredEntries = filteredEntries.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        if (startDate && entryDate < new Date(startDate)) return false;
        if (endDate && entryDate > new Date(endDate)) return false;
        return true;
      });
    }
    
    // Pagination
    const total = filteredEntries.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex);
    
    res.json({
      entries: paginatedEntries,
      total,
      page: parseInt(page),
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ message: 'Error fetching journal entries' });
  }
});

// Update journal settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const { defaultPrivacy, reminderTime, enableReminders, journalingPrompts } = req.body;
    
    let journal = await Journal.findOne({ userId: req.user._id });
    if (!journal) {
      journal = new Journal({
        userId: req.user._id,
        entries: []
      });
    }
    
    if (defaultPrivacy) journal.settings.defaultPrivacy = defaultPrivacy;
    if (reminderTime) journal.settings.reminderTime = reminderTime;
    if (enableReminders !== undefined) journal.settings.enableReminders = enableReminders;
    if (journalingPrompts !== undefined) journal.settings.journalingPrompts = journalingPrompts;
    
    await journal.save();
    
    res.json({
      message: 'Settings updated successfully',
      settings: journal.settings
    });
  } catch (error) {
    console.error('Error updating journal settings:', error);
    res.status(500).json({ message: 'Error updating journal settings' });
  }
});

// Get journal statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const journal = await Journal.findOne({ userId: req.user._id });
    if (!journal) {
      return res.json({
        totalEntries: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastEntryDate: null,
        entriesByType: {},
        entriesByMood: {},
        monthlyEntries: []
      });
    }
    
    // Calculate additional stats
    const entriesByType = {};
    const entriesByMood = {};
    const monthlyEntries = new Array(12).fill(0);
    
    journal.entries.forEach(entry => {
      // Count by type
      entriesByType[entry.type] = (entriesByType[entry.type] || 0) + 1;
      
      // Count by mood
      entriesByMood[entry.mood] = (entriesByMood[entry.mood] || 0) + 1;
      
      // Count by month
      const month = new Date(entry.createdAt).getMonth();
      monthlyEntries[month]++;
    });
    
    res.json({
      totalEntries: journal.stats.totalEntries,
      currentStreak: journal.stats.currentStreak,
      longestStreak: journal.stats.longestStreak,
      lastEntryDate: journal.stats.lastEntryDate,
      entriesByType,
      entriesByMood,
      monthlyEntries
    });
  } catch (error) {
    console.error('Error fetching journal stats:', error);
    res.status(500).json({ message: 'Error fetching journal statistics' });
  }
});

module.exports = router;

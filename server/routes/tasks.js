const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all tasks for a user with filtering and pagination
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      priority,
      energyLevel,
      dueDate,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { userId: req.user.userId };
    
    // Apply filters
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (energyLevel) filter.energyLevel = energyLevel;
    
    // Date filtering
    if (dueDate) {
      const date = new Date(dueDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.dueDate = { $gte: date, $lt: nextDay };
    }
    
    // Search in title and description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Task.countDocuments(filter);

    res.json({
      tasks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalTasks: total
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// Get task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.userId });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ task });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Error fetching task', error: error.message });
  }
});

// Create new task
router.post('/', auth, async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      userId: req.user.userId,
      // Since users only log tasks they've already completed, mark as completed immediately
      status: 'completed',
      completedAt: new Date()
    };

    const task = new Task(taskData);
    await task.save();

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
              { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
          const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
});

// Mark task as complete
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const { completionNotes } = req.body;
    
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.userId });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.complete(completionNotes);

    res.json({
      message: 'Task marked as complete',
      task
    });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ message: 'Error completing task', error: error.message });
  }
});

// Add subtask
router.post('/:id/subtasks', auth, async (req, res) => {
  try {
    const { title } = req.body;
    
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.userId });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.addSubtask(title);

    res.json({
      message: 'Subtask added successfully',
      task
    });
  } catch (error) {
    console.error('Error adding subtask:', error);
    res.status(500).json({ message: 'Error adding subtask', error: error.message });
  }
});

// Update subtask
router.put('/:id/subtasks/:subtaskIndex', auth, async (req, res) => {
  try {
    const { title, completed } = req.body;
    const subtaskIndex = parseInt(req.params.subtaskIndex);
    
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.userId });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (subtaskIndex < 0 || subtaskIndex >= task.subtasks.length) {
      return res.status(400).json({ message: 'Invalid subtask index' });
    }

    if (title !== undefined) task.subtasks[subtaskIndex].title = title;
    if (completed !== undefined) task.subtasks[subtaskIndex].completed = completed;

    await task.save();

    res.json({
      message: 'Subtask updated successfully',
      task
    });
  } catch (error) {
    console.error('Error updating subtask:', error);
    res.status(500).json({ message: 'Error updating subtask', error: error.message });
  }
});

// Get tasks by category
router.get('/category/:category', auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.user.userId,
      category: req.params.category
    }).sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks by category:', error);
    res.status(500).json({ message: 'Error fetching tasks by category', error: error.message });
  }
});

// Get overdue tasks
router.get('/overdue/all', auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.user.userId,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    }).sort({ dueDate: 1 });

    res.json({ tasks });
  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    res.status(500).json({ message: 'Error fetching overdue tasks', error: error.message });
  }
});

// Get tasks due today
router.get('/due/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await Task.find({
      userId: req.user._id,
      dueDate: { $gte: today, $lt: tomorrow },
      status: { $ne: 'completed' }
    }).sort({ priority: -1, dueDate: 1 });

    res.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks due today:', error);
    res.status(500).json({ message: 'Error fetching tasks due today', error: error.message });
  }
});

// Get tasks by priority
router.get('/priority/:priority', auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      userId: req.user.userId,
      priority: req.params.priority,
      status: { $ne: 'completed' }
    }).sort({ dueDate: 1 });

    res.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks by priority:', error);
    res.status(500).json({ message: 'Error fetching tasks by priority', error: error.message });
  }
});

// Bulk update tasks
router.put('/bulk/update', auth, async (req, res) => {
  try {
    const { taskIds, updates } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ message: 'Task IDs array is required' });
    }

    const result = await Task.updateMany(
      { _id: { $in: taskIds }, userId: req.user.userId },
      updates
    );

    res.json({
      message: 'Tasks updated successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk updating tasks:', error);
    res.status(500).json({ message: 'Error bulk updating tasks', error: error.message });
  }
});

// Bulk delete tasks
router.delete('/bulk/delete', auth, async (req, res) => {
  try {
    const { taskIds } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ message: 'Task IDs array is required' });
    }

    const result = await Task.deleteMany({
      _id: { $in: taskIds },
      userId: req.user.userId
    });

    res.json({
      message: 'Tasks deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error bulk deleting tasks:', error);
    res.status(500).json({ message: 'Error bulk deleting tasks', error: error.message });
  }
});

// Get task statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const stats = await Task.aggregate([
      { $match: { userId: req.user.userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          overdue: { $sum: { $cond: [{ $lt: ['$dueDate', new Date()] }, 1, 0] } }
        }
      }
    ]);

    const categoryStats = await Task.aggregate([
      { $match: { userId: req.user.userId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }
      }
    ]);

    const priorityStats = await Task.aggregate([
      { $match: { userId: req.user.userId } },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overview: stats[0] || { total: 0, completed: 0, pending: 0, inProgress: 0, overdue: 0 },
      byCategory: categoryStats,
      byPriority: priorityStats
    });
  } catch (error) {
    console.error('Error fetching task statistics:', error);
    res.status(500).json({ message: 'Error fetching task statistics', error: error.message });
  }
});

module.exports = router;

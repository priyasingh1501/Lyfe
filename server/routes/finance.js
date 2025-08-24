const express = require('express');
const router = express.Router();
const { Expense, Income } = require('../models/Finance');
const auth = require('../middleware/auth');

// Get all expenses for a user
router.get('/expenses', auth, async (req, res) => {
  try {
    console.log('🔍 Finance route - Fetching expenses for user:', req.user.userId);
    
    const expenses = await Expense.find({ userId: req.user.userId })
      .sort({ date: -1 })
      .limit(100);
    
    console.log('🔍 Found expenses:', expenses.length);
    console.log('🔍 First expense (if any):', expenses[0]);
    
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Error fetching expenses' });
  }
});

// Get all income for a user
router.get('/income', auth, async (req, res) => {
  try {
    const income = await Income.find({ userId: req.user.userId })
      .sort({ date: -1 })
      .limit(100);
    
    res.json(income);
  } catch (error) {
    console.error('Error fetching income:', error);
    res.status(500).json({ message: 'Error fetching income' });
  }
});

// Get financial summary (expenses and income)
router.get('/summary', auth, async (req, res) => {
  try {
    console.log('🔍 Finance route - Fetching summary for user:', req.user.userId);
    
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    
    const expenses = await Expense.find({ 
      userId: req.user.userId,
      ...dateFilter
    });
    
    const income = await Income.find({ 
      userId: req.user.userId,
      ...dateFilter
    });
    
    console.log('🔍 Summary - Expenses found:', expenses.length);
    console.log('🔍 Summary - Income found:', income.length);
    
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
    
    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
    
    const summary = {
      totalExpenses,
      totalIncome,
      netAmount: totalIncome - totalExpenses,
      expensesByCategory,
      recentExpenses: expenses.slice(0, 5),
      recentIncome: income.slice(0, 5)
    };
    
    console.log('🔍 Summary response:', summary);
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    res.status(500).json({ message: 'Error fetching financial summary' });
  }
});

// Create a new expense
router.post('/expenses', auth, async (req, res) => {
  try {
    const expense = new Expense({
      ...req.body,
      userId: req.user.userId
    });
    
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(400).json({ message: 'Error creating expense', error: error.message });
  }
});

// Create a new income
router.post('/income', auth, async (req, res) => {
  try {
    const income = new Income({
      ...req.body,
      userId: req.user.userId
    });
    
    await income.save();
    res.status(201).json(income);
  } catch (error) {
    console.error('Error creating income:', error);
    res.status(400).json({ message: 'Error creating income', error: error.message });
  }
});

// Update an expense
router.put('/expenses/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(400).json({ message: 'Error updating expense', error: error.message });
  }
});

// Update an income
router.put('/income/:id', auth, async (req, res) => {
  try {
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    
    res.json(income);
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(400).json({ message: 'Error updating income', error: error.message });
  }
});

// Delete an expense
router.delete('/expenses/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Error deleting expense' });
  }
});

// Delete an income
router.delete('/income/:id', auth, async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    
    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ message: 'Error deleting income' });
  }
});

module.exports = router;

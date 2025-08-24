const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PantryInventory = require('../models/PantryInventory');

// Get all pantry inventory for a user
router.get('/', auth, async (req, res) => {
  try {
    const { category, subcategory } = req.query;
    const userId = req.user.userId;
    
    let query = { userId };
    
    if (category) {
      query.category = category;
    }
    
    if (subcategory) {
      query.subcategory = subcategory;
    }
    
    const inventory = await PantryInventory.find(query)
      .sort({ category: 1, subcategory: 1, itemName: 1 });
    
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching pantry inventory:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get inventory summary
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const summary = await PantryInventory.getInventorySummary(userId);
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get low stock items
router.get('/low-stock', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const lowStockItems = await PantryInventory.find({ 
      userId, 
      isLow: true 
    }).sort({ category: 1, subcategory: 1 });
    
    res.json(lowStockItems);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new inventory item
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const inventoryData = { ...req.body, userId };
    
    const inventoryItem = new PantryInventory(inventoryData);
    
    // Check if item is low on stock
    inventoryItem.checkLowStock();
    
    await inventoryItem.save();
    
    res.status(201).json(inventoryItem);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update inventory item
router.put('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    
    const inventoryItem = await PantryInventory.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    // Check if item is low on stock
    inventoryItem.checkLowStock();
    await inventoryItem.save();
    
    res.json(inventoryItem);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark item as ordered today
router.patch('/:id/ordered-today', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    
    const inventoryItem = await PantryInventory.findOne({ _id: id, userId });
    
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    // Update last ordered date
    inventoryItem.markOrderedToday();
    await inventoryItem.save();
    
    res.json(inventoryItem);
  } catch (error) {
    console.error('Error marking item as ordered:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete inventory item
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    
    const inventoryItem = await PantryInventory.findOneAndDelete({ _id: id, userId });
    
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk update quantities
router.patch('/bulk-update', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { updates } = req.body; // Array of { id, quantity } objects
    
    const results = [];
    
    for (const update of updates) {
      const inventoryItem = await PantryInventory.findOne({ _id: update.id, userId });
      
      if (inventoryItem) {
        inventoryItem.quantity = update.quantity;
        inventoryItem.checkLowStock();
        await inventoryItem.save();
        results.push(inventoryItem);
      }
    }
    
    res.json(results);
  } catch (error) {
    console.error('Error bulk updating inventory:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

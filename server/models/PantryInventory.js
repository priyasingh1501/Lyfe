const mongoose = require('mongoose');

const pantryInventorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['fridge', 'essentials', 'snacks_breakfast'],
    required: true
  },
  subcategory: {
    type: String,
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  unit: {
    type: String,
    default: 'piece'
  },
  lastOrdered: {
    type: Date,
    default: Date.now
  },
  isLow: {
    type: Boolean,
    default: false
  },
  lowThreshold: {
    type: Number,
    default: 1
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient querying
pantryInventorySchema.index({ userId: 1, category: 1, subcategory: 1 });
pantryInventorySchema.index({ userId: 1, lastOrdered: 1 });
pantryInventorySchema.index({ userId: 1, isLow: 1 });

// Update timestamp on save
pantryInventorySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to check if item is low on stock
pantryInventorySchema.methods.checkLowStock = function() {
  this.isLow = this.quantity <= this.lowThreshold;
  return this.isLow;
};

// Method to update last ordered date
pantryInventorySchema.methods.markOrderedToday = function() {
  this.lastOrdered = new Date();
  return this;
};

// Static method to get inventory summary
pantryInventorySchema.statics.getInventorySummary = async function(userId) {
  const summary = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$category',
        totalItems: { $sum: 1 },
        lowStockItems: { $sum: { $cond: ['$isLow', 1, 0] } },
        categories: { $addToSet: '$subcategory' }
      }
    }
  ]);
  
  return summary;
};

module.exports = mongoose.model('PantryInventory', pantryInventorySchema);

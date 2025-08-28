import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit3, Save, X } from 'lucide-react';

// Helper function to normalize nutrient data from different sources
const getNormalizedNutrients = (food) => {
  if (!food) return null;
  
  // Handle local database format
  if (food.nutrients) {
    return food.nutrients;
  }
  
  // Handle Open Food Facts format
  if (food.nutriments100g) {
    return {
      kcal: food.nutriments100g.kcal || 0,
      protein: food.nutriments100g.protein || 0,
      fat: food.nutriments100g.fat || 0,
      carbs: food.nutriments100g.carbs || 0,
      fiber: food.nutriments100g.fiber || 0,
      sugar: food.nutriments100g.sugar || 0
    };
  }
  
  return null;
};

const MealItems = ({ items, onRemoveFood, onUpdatePortion }) => {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editUnit, setEditUnit] = useState('grams');

  const handleEdit = (item) => {
    setEditingId(item.foodId);
    setEditValue(item.grams.toString());
    setEditUnit('grams');
  };

  const handleSave = (item) => {
    let grams = parseFloat(editValue);
    
    // Convert traditional units to grams if needed
    if (editUnit !== 'grams' && item.food && item.food.portionUnits) {
      const unit = item.food.portionUnits.find(u => u.unit === editUnit);
      if (unit) {
        grams = unit.grams * parseFloat(editValue);
      }
    }
    
    if (!isNaN(grams) && grams > 0) {
      onUpdatePortion(item.foodId, grams);
      setEditingId(null);
      setEditValue('');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const getAvailableUnits = (item) => {
    if (!item.food || !item.food.portionUnits) {
      return [{ unit: 'grams', description: 'Grams' }];
    }
    
    return item.food.portionUnits.map(unit => ({
      unit: unit.unit,
      description: `${unit.description} (${unit.grams}g)`
    }));
  };

  const getDisplayPortion = (item) => {
    if (!item.food || !item.food.portionUnits) {
      return `${item.grams}g`;
    }
    
    // If there's a selected unit, show it prominently
    if (item.selectedUnit) {
      const quantity = item.grams / item.selectedUnit.grams;
      if (quantity >= 0.5 && quantity <= 5) {
        return `${quantity.toFixed(quantity % 1 === 0 ? 0 : 1)} ${item.selectedUnit.unit} (${item.grams}g)`;
      }
    }
    
    // Try to find a nice traditional unit representation
    const units = item.food.portionUnits;
    const grams = item.grams;
    
    // Find the best traditional unit
    for (const unit of units) {
      if (unit.unit !== 'grams') {
        const quantity = grams / unit.grams;
        if (quantity >= 0.5 && quantity <= 5) {
          return `${quantity.toFixed(quantity % 1 === 0 ? 0 : 1)} ${unit.unit} (${grams}g)`;
        }
      }
    }
    
    return `${grams}g`;
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-[#6B7280]">
        <p>No food items added yet</p>
        <p className="text-sm mt-2">Search and add foods to build your meal</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.foodId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#0A0C0F] border border-[#2A313A] rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-[#E8EEF2] mb-2">
                  {item.customName || item.food?.name || 'Unknown Food'}
                </h4>
                
                {/* Current portion display */}
                <div className="text-sm text-[#C9D1D9] mb-2">
                  Current: {getDisplayPortion(item)}
                </div>
                
                {/* Selected unit indicator */}
                {item.selectedUnit && (
                  <div className="mb-2">
                    <span className="inline-flex items-center px-2 py-1 bg-[#FFD200]/20 text-[#FFD200] text-xs rounded-full border border-[#FFD200]/50">
                      {item.selectedUnit.unit} selected
                    </span>
                  </div>
                )}
                
                {/* Nutritional info */}
                {item.food && (() => {
                  const nutrients = getNormalizedNutrients(item.food);
                  return nutrients ? (
                    <div className="grid grid-cols-4 gap-2 text-sm text-[#C9D1D9]">
                      <div>
                        <span className="text-[#FFD200] font-medium">kcal:</span>
                        <br />
                        {Math.round((nutrients.kcal || 0) * item.grams / 100)}
                      </div>
                      <div>
                        <span className="text-[#FFD200] font-medium">P:</span>
                        <br />
                        {((nutrients.protein || 0) * item.grams / 100).toFixed(1)}g
                      </div>
                      <div>
                        <span className="text-[#FFD200] font-medium">C:</span>
                        <br />
                        {((nutrients.carbs || 0) * item.grams / 100).toFixed(1)}g
                      </div>
                      <div>
                        <span className="text-[#FFD200] font-medium">F:</span>
                        <br />
                        {((nutrients.fat || 0) * item.grams / 100).toFixed(1)}g
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-[#6B7280] italic">
                      Nutritional data not available
                    </div>
                  );
                })()}
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center space-x-2 ml-4">
                {editingId === item.foodId ? (
                  <>
                    {/* Edit mode */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 px-2 py-1 bg-[#0A0C0F] border border-[#2A313A] rounded text-[#E8EEF2] text-sm"
                        placeholder="Amount"
                        min="0"
                        step="0.1"
                      />
                      <select
                        value={editUnit}
                        onChange={(e) => setEditUnit(e.target.value)}
                        className="px-2 py-1 bg-[#0A0C0F] border border-[#2A313A] rounded text-[#E8EEF2] text-sm"
                      >
                        {getAvailableUnits(item).map((unit) => (
                          <option key={unit.unit} value={unit.unit}>
                            {unit.unit}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleSave(item)}
                        className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        title="Save changes"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* View mode */}
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 bg-[#2A313A] text-[#C9D1D9] rounded hover:bg-[#3A414A] transition-colors"
                      title="Edit portion"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onRemoveFood(item.foodId)}
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      title="Remove food"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default MealItems;

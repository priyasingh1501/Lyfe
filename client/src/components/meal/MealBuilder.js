import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Save, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import toast from 'react-hot-toast';
import FoodSearch from './FoodSearch';
import MealItems from './MealItems';
import MealAnalysis from './MealAnalysis';
import MealContext from './MealContext';

const MealBuilder = () => {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mealItems, setMealItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [context, setContext] = useState({
    postWorkout: false,
    bodyMassKg: 70,
    plantDiversity: 3,
    fermented: false,
    omega3Tag: false,
    addedSugar: 0
  });
  const [isSaving, setIsSaving] = useState(false);

  // Search for foods
  const searchFoods = useCallback(async (query) => {
    if (!query.trim() || !token) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(buildApiUrl('/api/food/search'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: query.trim() })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      } else {
        toast.error('Failed to search foods');
      }
    } catch (error) {
      console.error('Error searching foods:', error);
      toast.error('Error searching foods');
    } finally {
      setIsSearching(false);
    }
  }, [token]);

  // Add food to meal
  const addFoodToMeal = useCallback((food, selectedUnit = null) => {
    // Handle different ID formats from different sources
    const foodId = food._id || food.id || food.barcode;
    const existingItem = mealItems.find(item => item.foodId === foodId);
    
    // Determine the portion to add
    let portionToAdd = food.portionGramsDefault || 100; // Default to 100g if not specified
    let unitDescription = '';
    
    if (selectedUnit) {
      portionToAdd = selectedUnit.grams;
      unitDescription = selectedUnit.description;
    }
    
    if (existingItem) {
      // Update existing item
      setMealItems(prev => prev.map(item => 
        item.foodId === foodId 
          ? { ...item, grams: item.grams + portionToAdd }
          : item
      ));
      const message = selectedUnit 
        ? `Updated ${food.name} with +${unitDescription} (${portionToAdd}g)`
        : `Updated ${food.name} portion`;
      toast.success(message);
    } else {
      // Add new item
      const newItem = {
        foodId: foodId,
        customName: food.name,
        grams: portionToAdd,
        food: food, // Store full food object for analysis
        selectedUnit: selectedUnit // Store the selected unit for display
      };
      setMealItems(prev => [...prev, newItem]);
      const message = selectedUnit 
        ? `Added ${food.name} (${unitDescription} = ${portionToAdd}g)`
        : `Added ${food.name} to meal`;
      toast.success(message);
    }
    
    // Clear search
    setSearchQuery('');
    setSearchResults([]);
  }, [mealItems]);

  // Remove food from meal
  const removeFoodFromMeal = useCallback((foodId) => {
    setMealItems(prev => prev.filter(item => item.foodId !== foodId));
    toast.success('Food removed from meal');
  }, []);

  // Update food portion
  const updateFoodPortion = useCallback((foodId, grams) => {
    setMealItems(prev => prev.map(item => 
      item.foodId === foodId 
        ? { ...item, grams: Math.max(0, grams) }
        : item
    ));
  }, []);

  // Save meal
  const saveMeal = useCallback(async () => {
    if (mealItems.length === 0) {
      toast.error('Please add at least one food item');
      return;
    }

    setIsSaving(true);
    try {
      const mealData = {
        items: mealItems.map(item => ({
          foodId: item.foodId,
          grams: item.grams
        })),
        notes,
        context
      };

      const response = await fetch(buildApiUrl('/api/meals'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(mealData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Meal saved successfully!');
        
        // Clear form
        setMealItems([]);
        setNotes('');
        setContext({
          postWorkout: false,
          bodyMassKg: 70,
          plantDiversity: 3,
          fermented: false,
          omega3Tag: false,
          addedSugar: 0
        });
      } else {
        toast.error('Failed to save meal');
      }
    } catch (error) {
      console.error('Error saving meal:', error);
      toast.error('Error saving meal');
    } finally {
      setIsSaving(false);
    }
  }, [mealItems, notes, context, token]);

  // Handle search input
  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      searchFoods(query);
    } else {
      setSearchResults([]);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchFoods(searchQuery);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C0F] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-[#E8EEF2] mb-4 font-oswald tracking-wide">
            MEAL BUILDER
          </h1>
          <p className="text-[#C9D1D9] font-inter text-lg">
            Build your meal, see nutritional insights, and track your eating habits
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Food Search & Meal Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Food Search */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold text-[#E8EEF2] mb-4 font-oswald tracking-wide">
                Search & Add Foods
              </h2>
              
              <form onSubmit={handleSearchSubmit} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#C9D1D9] h-5 w-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInput}
                    placeholder="Search for foods (e.g., idli, roti, paneer)..."
                    className="w-full pl-10 pr-4 py-3 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none placeholder-[#6B7280]"
                  />
                </div>
              </form>

              {/* Search Results */}
              <FoodSearch
                results={searchResults}
                isSearching={isSearching}
                onAddFood={addFoodToMeal}
              />
            </motion.div>

            {/* Meal Items */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold text-[#E8EEF2] mb-4 font-oswald tracking-wide">
                Meal Items
              </h2>
              
              <MealItems
                items={mealItems}
                onRemoveFood={removeFoodFromMeal}
                onUpdatePortion={updateFoodPortion}
              />
            </motion.div>

            {/* Notes & Context */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold text-[#E8EEF2] mb-4 font-oswald tracking-wide">
                Meal Context & Notes
              </h2>
              
              <MealContext
                context={context}
                setContext={setContext}
                notes={notes}
                setNotes={setNotes}
              />
            </motion.div>

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <button
                onClick={saveMeal}
                disabled={isSaving || mealItems.length === 0}
                className="inline-flex items-center px-8 py-4 bg-[#FFD200] text-[#0A0C0F] rounded-lg hover:bg-[#FFB800] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-oswald tracking-wide text-lg font-semibold shadow-lg hover:shadow-xl"
              >
                <Save className="h-5 w-5 mr-2" />
                {isSaving ? 'Saving...' : 'Save Meal'}
              </button>
            </motion.div>

            {/* Data Source Footnote */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-sm text-[#6B7280]"
            >
              <p>
                Data: IFCT/USDA/OpenFoodFacts + heuristics; see info for details.
              </p>
            </motion.div>
          </div>

          {/* Right Column - Live Analysis */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <MealAnalysis
              mealItems={mealItems}
              context={context}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MealBuilder;

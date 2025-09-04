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
  const [hasSearched, setHasSearched] = useState(false);
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

  // Indian portion units with their gram equivalents
  const indianPortionUnits = [
    { unit: 'katori', label: 'Katori', grams: 80, description: 'Small bowl' },
    { unit: 'roti', label: 'Roti', grams: 45, description: 'Flatbread' },
    { unit: 'idli', label: 'Idli', grams: 120, description: 'Steamed rice cake' },
    { unit: 'cup', label: 'Cup', grams: 200, description: 'Standard cup' },
    { unit: 'spoon', label: 'Spoon', grams: 15, description: 'Tablespoon' },
    { unit: 'piece', label: 'Piece', grams: 50, description: 'Standard piece' },
    { unit: 'handful', label: 'Handful', grams: 30, description: 'Handful' }
  ];

  // Search for foods using multi-source search with fallback
  const searchFoods = useCallback(async (query) => {
    if (!query.trim() || !token) return;
    
    setIsSearching(true);
    try {
      // Try multi-source search first (POST endpoint)
      console.log('🔍 Attempting multi-source search for:', query.trim());
      const response = await fetch(buildApiUrl('/api/food/search'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query.trim(),
          source: 'combined', // Search all sources: local, USDA, and OpenFoodFacts
          limit: 20
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Multi-source search response:', data);
        
        // The POST endpoint returns 'results' with multi-source data
        const results = data.results || [];
        console.log('📊 Raw results:', results);
        
        if (results.length > 0) {
          // Transform results to match expected format
          const foods = results.map(result => {
            // Handle different source formats
            if (result.source === 'IFCT') {
              // Local database food
              return {
                _id: result.id || result._id,
                name: result.name,
                source: 'IFCT', // Use consistent source name
                portionGramsDefault: result.portionGramsDefault || 100,
                nutrients: result.nutrients || result.nutriments100g,
                tags: result.tags || [],
                gi: result.gi,
                fodmap: result.fodmap,
                novaClass: result.novaClass,
                aliases: result.aliases || [],
                provenance: result.provenance || { source: 'Local Database' }
              };
            } else if (result.source === 'usda') {
              // USDA food
              return {
                _id: result.id,
                name: result.name,
                source: 'USDA',
                portionGramsDefault: 100,
                nutrients: {
                  kcal: result.nutriments100g?.kcal || 0,
                  protein: result.nutriments100g?.protein || 0,
                  fat: result.nutriments100g?.fat || 0,
                  carbs: result.nutriments100g?.carbs || 0,
                  fiber: result.nutriments100g?.fiber || 0,
                  sugar: result.nutriments100g?.sugar || 0,
                  vitaminC: 0,
                  zinc: 0,
                  selenium: 0,
                  iron: 0,
                  omega3: 0
                },
                tags: [],
                brand: result.brand,
                relevanceScore: result.relevanceScore,
                provenance: result.provenance || { source: 'USDA Database' }
              };
            } else if (result.source === 'off') {
              // OpenFoodFacts food
              return {
                _id: result.id,
                name: result.name,
                source: 'OpenFoodFacts',
                portionGramsDefault: 100,
                nutrients: {
                  kcal: result.nutriments100g?.kcal || 0,
                  protein: result.nutriments100g?.protein || 0,
                  fat: result.nutriments100g?.fat || 0,
                  carbs: result.nutriments100g?.carbs || 0,
                  fiber: result.nutriments100g?.fiber || 0,
                  sugar: result.nutriments100g?.sugar || 0,
                  vitaminC: 0,
                  zinc: 0,
                  selenium: 0,
                  iron: 0,
                  omega3: 0
                },
                tags: result.tags || [],
                brand: result.brand,
                barcode: result.barcode,
                novaClass: result.novaClass,
                relevanceScore: result.relevanceScore,
                provenance: result.provenance || { source: 'Open Food Facts' }
              };
            }
            return result;
          });
          
          // Remove duplicates based on name and source
          const uniqueFoods = foods.reduce((acc, food) => {
            const existingFood = acc.find(f => 
              f._id === food._id || 
              (f.name.toLowerCase() === food.name.toLowerCase() && f.source === food.source)
            );
            
            if (!existingFood) {
              acc.push(food);
            }
            return acc;
          }, []);
          
          console.log('✅ Multi-source search successful, found:', uniqueFoods.length, 'foods');
          setSearchResults(uniqueFoods);
          return;
        }
      }
      
      // Fallback to local search if multi-source search fails or returns no results
      console.log('🔄 Multi-source search failed or no results, falling back to local search');
      const fallbackResponse = await fetch(buildApiUrl(`/api/food/search?q=${encodeURIComponent(query.trim())}&limit=20`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        const foods = fallbackData.foods || [];
        
        // Transform fallback foods to ensure consistent source information
        const transformedFoods = foods.map(food => ({
          ...food,
          source: 'IFCT', // Local database foods are from IFCT
          provenance: food.provenance || { source: 'Local Database' }
        }));
        
        // Remove duplicates based on food ID and name
        const uniqueFoods = transformedFoods.reduce((acc, food) => {
          const existingFood = acc.find(f => 
            f._id === food._id || 
            f.name.toLowerCase() === food.name.toLowerCase()
          );
          
          if (!existingFood) {
            acc.push(food);
          }
          return acc;
        }, []);
        
        console.log('✅ Fallback local search successful, found:', uniqueFoods.length, 'foods');
        setSearchResults(uniqueFoods);
      } else {
        const errorData = await fallbackResponse.text();
        console.error('❌ Both searches failed:', response.status, errorData);
        toast.error(`Failed to search foods: ${fallbackResponse.status}`);
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
    
    // Determine the portion to add - default to katori if no unit specified
    let portionToAdd = food.portionGramsDefault || 100; // Default to 100g if not specified
    let unitDescription = '';
    let defaultUnit = indianPortionUnits[0]; // Default to katori
    
    if (selectedUnit) {
      portionToAdd = selectedUnit.grams;
      unitDescription = selectedUnit.description;
    } else {
      // Use default Indian portion unit (katori)
      portionToAdd = defaultUnit.grams;
      unitDescription = defaultUnit.description;
      selectedUnit = defaultUnit;
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
  }, [mealItems, indianPortionUnits]);

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

  // Handle search input - only update state, don't search
  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear results when input is empty
    if (!query.trim()) {
      setSearchResults([]);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setHasSearched(true);
      searchFoods(searchQuery);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
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
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#C9D1D9] h-5 w-5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchInput}
                      placeholder="Search for foods (e.g., idli, roti, paneer)..."
                      className="w-full pl-10 pr-4 py-3 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none placeholder-[#6B7280]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!searchQuery.trim()}
                    className="px-6 py-3 bg-[#FFD200] text-[#0A0C0F] rounded-lg hover:bg-[#FFB800] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-oswald tracking-wide font-semibold"
                  >
                    Search
                  </button>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="px-4 py-3 bg-[#2A313A] text-[#C9D1D9] rounded-lg hover:bg-[#3A414A] transition-colors duration-200 font-oswald tracking-wide"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>

              {/* Search Results */}
              <FoodSearch
                results={searchResults}
                isSearching={isSearching}
                hasSearched={hasSearched}
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

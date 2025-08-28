const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');
const auth = require('../middleware/auth');
const { foldName } = require('../lib/meal/norm');

/**
 * Search food items by name
 * GET /api/food/search?q=query&includeProvenance=true
 */
router.get('/search', auth, async (req, res) => {
  try {
    const { q, limit = 20, includeProvenance = false } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Search query is required',
        foods: []
      });
    }

    const searchQuery = foldName(q.trim());
    
    // Text search on nameFold
    const foods = await FoodItem.find(
      { $text: { $search: searchQuery } },
      { score: { $meta: 'textScore' } }
    )
          .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit))
      .select('name portionGramsDefault portionUnits nutrients tags gi fodmap novaClass provenance qualityFlags');

    // If no results from text search, try fuzzy matching
    if (foods.length === 0) {
      const fuzzyFoods = await FoodItem.find({
        $or: [
          { nameFold: { $regex: searchQuery, $options: 'i' } },
          { aliases: { $regex: searchQuery, $options: 'i' } }
        ]
      })
      .limit(parseInt(limit))
      .select('name portionGramsDefault nutrients tags gi fodmap novaClass provenance qualityFlags');
      
      return res.json({
        message: 'Foods found',
        foods: includeProvenance ? fuzzyFoods : fuzzyFoods.map(food => ({
          ...food.toObject(),
          provenance: {
            source: food.provenance?.source || food.source,
            measured: food.provenance?.measured || false,
            confidence: food.provenance?.confidence || 0.5,
            giOrigin: food.provenance?.giOrigin || 'unknown',
            novaOrigin: food.provenance?.novaOrigin || 'unknown',
            fodmapOrigin: food.provenance?.fodmapOrigin || 'unknown'
          }
        })),
        searchType: 'fuzzy'
      });
    }

    res.json({
      message: 'Foods found',
      foods: includeProvenance ? foods : foods.map(food => ({
        ...food.toObject(),
        provenance: {
          source: food.provenance?.source || food.source,
          measured: food.provenance?.measured || false,
          confidence: food.provenance?.confidence || 0.5,
          giOrigin: food.provenance?.giOrigin || 'unknown',
          novaOrigin: food.provenance?.novaOrigin || 'unknown',
          fodmapOrigin: food.provenance?.fodmapOrigin || 'unknown'
        }
      })),
      searchType: 'text'
    });

  } catch (error) {
    console.error('Error searching foods:', error);
    res.status(500).json({ 
      message: 'Error searching foods',
      error: error.message 
    });
  }
});

/**
 * Get food categories
 * GET /api/food/categories
 */
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await FoodItem.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      message: 'Categories found',
      categories
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      message: 'Error fetching categories',
      error: error.message 
    });
  }
});

/**
 * Get popular foods
 * GET /api/food/popular
 */
router.get('/popular', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // For now, return foods with high protein or fiber
    // In the future, this could be based on user preferences or usage
    const popularFoods = await FoodItem.find({
      $or: [
        { 'nutrients.protein': { $gte: 15 } },
        { 'nutrients.fiber': { $gte: 5 } },
        { tags: { $in: ['veg', 'protein'] } }
      ]
    })
    .sort({ 'nutrients.protein': -1 })
    .limit(parseInt(limit))
    .select('name portionGramsDefault portionUnits nutrients tags gi fodmap novaClass provenance qualityFlags');

    res.json({
      message: 'Popular foods found',
      foods: popularFoods
    });

  } catch (error) {
    console.error('Error fetching popular foods:', error);
    res.status(500).json({ 
      message: 'Error fetching popular foods',
      error: error.message 
    });
  }
});

/**
 * Get food suggestions based on current meal
 * GET /api/food/suggestions
 */
router.get('/suggestions', auth, async (req, res) => {
  try {
    const { currentFoods, mealType, limit = 5 } = req.query;
    
    let suggestions = [];
    
    if (currentFoods && currentFoods.length > 0) {
      // Analyze current foods and suggest complementary items
      const currentFoodIds = currentFoods.split(',').map(id => id.trim());
      
      // Get current foods to analyze
      const foods = await FoodItem.find({ _id: { $in: currentFoodIds } });
      
      // Check if we need protein, vegetables, or fiber
      let needsProtein = true;
      let needsVeg = true;
      let needsFiber = true;
      
      foods.forEach(food => {
        if (food.nutrients.protein >= 20) needsProtein = false;
        if (food.tags && food.tags.includes('veg')) needsVeg = false;
        if (food.nutrients.fiber >= 5) needsFiber = false;
      });
      
      // Build suggestion query
      const suggestionQuery = {};
      
      if (needsProtein) {
        suggestionQuery.$or = [
          { 'nutrients.protein': { $gte: 15 } },
          { tags: { $in: ['protein'] } }
        ];
      }
      
      if (needsVeg || needsFiber) {
        suggestionQuery.$or = suggestionQuery.$or || [];
        suggestionQuery.$or.push(
          { tags: { $in: ['veg', 'leafy'] } },
          { 'nutrients.fiber': { $gte: 3 } }
        );
      }
      
      if (Object.keys(suggestionQuery).length > 0) {
        suggestions = await FoodItem.find(suggestionQuery)
          .limit(parseInt(limit))
          .select('name portionGramsDefault portionUnits nutrients tags gi fodmap novaClass provenance qualityFlags');
      }
    }
    
    // If no specific suggestions, return some healthy defaults
    if (suggestions.length === 0) {
      suggestions = await FoodItem.find({
        tags: { $in: ['veg', 'protein'] },
        'nutrients.fiber': { $gte: 3 }
      })
      .limit(parseInt(limit))
      .select('name portionGramsDefault portionUnits nutrients tags gi fodmap novaClass provenance qualityFlags');
    }

    res.json({
      message: 'Food suggestions found',
      suggestions
    });

  } catch (error) {
    console.error('Error fetching food suggestions:', error);
    res.status(500).json({ 
      message: 'Error fetching food suggestions',
      error: error.message 
    });
  }
});

/**
 * Get food item by ID
 * GET /api/food/:id
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const food = await FoodItem.findById(id);
    
    if (!food) {
      return res.status(404).json({ 
        message: 'Food item not found' 
      });
    }

    res.json({
      message: 'Food item found',
      food
    });

  } catch (error) {
    console.error('Error fetching food item:', error);
    res.status(500).json({ 
      message: 'Error fetching food item',
      error: error.message 
    });
  }
});

module.exports = router;

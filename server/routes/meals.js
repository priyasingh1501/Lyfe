const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');
const FoodItem = require('../models/FoodItem');
const auth = require('../middleware/auth');
const { aggregateNutrients } = require('../lib/meal/aggregate');
const { inferBadges } = require('../lib/meal/badges');
const { mindfulMealScore } = require('../lib/meal/score');
const { computeMealEffects } = require('../lib/meal/effects');

/**
 * Create a new meal
 * POST /api/meals
 */
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { ts, items, notes, context } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'At least one food item is required'
      });
    }

    // Validate items
    for (const item of items) {
      if (!item.foodId || !item.grams || item.grams <= 0) {
        return res.status(400).json({
          message: 'Each item must have a valid foodId and grams > 0'
        });
      }
    }

    // Fetch food items
    const foodIds = items.map(item => item.foodId);
    const foods = await FoodItem.find({ _id: { $in: foodIds } });

    if (foods.length !== items.length) {
      return res.status(400).json({
        message: 'Some food items were not found'
      });
    }

    // Create food-grams mapping
    const foodMap = new Map();
    foods.forEach(food => foodMap.set(food._id.toString(), food));

    // Prepare items with food data
    const mealItems = items.map(item => ({
      foodId: item.foodId,
      customName: item.customName || foodMap.get(item.foodId).name,
      grams: item.grams
    }));

    // Aggregate nutrients
    const itemsWithFood = items.map(item => ({
      food: foodMap.get(item.foodId),
      grams: item.grams
    }));

    const totals = aggregateNutrients(itemsWithFood);

    // Infer badges
    const badges = inferBadges(totals, foods);

    // Calculate mindful meal score
    const scoreResult = mindfulMealScore(totals, badges, context);

    // Compute effects
    const effects = computeMealEffects(totals, badges, context);

    // Create meal object
    const mealData = {
      userId,
      ts: ts ? new Date(ts) : new Date(),
      items: mealItems,
      notes,
      context: context || {},
      computed: {
        totals,
        badges,
        mindfulMealScore: scoreResult.score,
        rationale: scoreResult.rationale,
        tip: scoreResult.tip,
        effects
      }
    };

    const meal = new Meal(mealData);
    await meal.save();

    // Populate food details for response
    await meal.populate('items.foodId');

    res.status(201).json({
      message: 'Meal created successfully',
      meal,
      analysis: {
        totals,
        badges,
        score: scoreResult,
        effects
      }
    });

  } catch (error) {
    console.error('Error creating meal:', error);
    res.status(500).json({
      message: 'Error creating meal',
      error: error.message
    });
  }
});

/**
 * Get user's meals
 * GET /api/meals
 */
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      startDate, 
      endDate, 
      limit = 50, 
      page = 1,
      sortBy = 'ts',
      sortOrder = 'desc'
    } = req.query;

    let query = { userId };
    
    // Date filtering
    if (startDate || endDate) {
      query.ts = {};
      if (startDate) query.ts.$gte = new Date(startDate);
      if (endDate) query.ts.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const meals = await Meal.find(query)
      .populate('items.foodId')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Meal.countDocuments(query);

    res.json({
      message: 'Meals retrieved successfully',
      meals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({
      message: 'Error fetching meals',
      error: error.message
    });
  }
});

/**
 * Get meal by ID
 * GET /api/meals/:id
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const meal = await Meal.findOne({ _id: id, userId })
      .populate('items.foodId');

    if (!meal) {
      return res.status(404).json({
        message: 'Meal not found'
      });
    }

    res.json({
      message: 'Meal retrieved successfully',
      meal
    });

  } catch (error) {
    console.error('Error fetching meal:', error);
    res.status(500).json({
      message: 'Error fetching meal',
      error: error.message
    });
  }
});

/**
 * Update meal
 * PUT /api/meals/:id
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { items, notes, context, presence, energy } = req.body;

    const meal = await Meal.findOne({ _id: id, userId });

    if (!meal) {
      return res.status(404).json({
        message: 'Meal not found'
      });
    }

    // If items are being updated, recalculate everything
    if (items && Array.isArray(items)) {
      if (items.length === 0) {
        return res.status(400).json({
          message: 'At least one food item is required'
        });
      }

      // Validate items
      for (const item of items) {
        if (!item.foodId || !item.grams || item.grams <= 0) {
          return res.status(400).json({
            message: 'Each item must have a valid foodId and grams > 0'
          });
        }
      }

      // Fetch food items
      const foodIds = items.map(item => item.foodId);
      const foods = await FoodItem.find({ _id: { $in: foodIds } });

      if (foods.length !== items.length) {
        return res.status(400).json({
          message: 'Some food items were not found'
        });
      }

      // Update items
      meal.items = items.map(item => ({
        foodId: item.foodId,
        customName: item.customName || foods.find(f => f._id.toString() === item.foodId).name,
        grams: item.grams
      }));

      // Recalculate everything
      const itemsWithFood = items.map(item => ({
        food: foods.find(f => f._id.toString() === item.foodId),
        grams: item.grams
      }));

      const totals = aggregateNutrients(itemsWithFood);
      const badges = inferBadges(totals, foods);
      const scoreResult = mindfulMealScore(totals, badges, context || meal.context);
      const effects = computeMealEffects(totals, badges, context || meal.context);

      meal.computed = {
        totals,
        badges,
        mindfulMealScore: scoreResult.score,
        rationale: scoreResult.rationale,
        tip: scoreResult.tip,
        effects
      };
    }

    // Update other fields
    if (notes !== undefined) meal.notes = notes;
    if (context !== undefined) meal.context = { ...meal.context, ...context };
    if (presence !== undefined) meal.presence = presence;
    if (energy !== undefined) meal.energy = energy;

    await meal.save();
    await meal.populate('items.foodId');

    res.json({
      message: 'Meal updated successfully',
      meal
    });

  } catch (error) {
    console.error('Error updating meal:', error);
    res.status(500).json({
      message: 'Error updating meal',
      error: error.message
    });
  }
});

/**
 * Delete meal
 * DELETE /api/meals/:id
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const meal = await Meal.findOneAndDelete({ _id: id, userId });

    if (!meal) {
      return res.status(404).json({
        message: 'Meal not found'
      });
    }

    res.json({
      message: 'Meal deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({
      message: 'Error deleting meal',
      error: error.message
    });
  }
});

/**
 * Get meal statistics
 * GET /api/meals/stats/overview
 */
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    let query = { userId };
    
    if (startDate || endDate) {
      query.ts = {};
      if (startDate) query.ts.$gte = new Date(startDate);
      if (endDate) query.ts.$lte = new Date(endDate);
    }

    const stats = await Meal.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalMeals: { $sum: 1 },
          averageScore: { $avg: '$computed.mindfulMealScore' },
          averageCalories: { $avg: '$computed.totals.kcal' },
          averageProtein: { $avg: '$computed.totals.protein' },
          averageFiber: { $avg: '$computed.totals.fiber' },
          proteinMeals: { $sum: { $cond: ['$computed.badges.protein', 1, 0] } },
          vegMeals: { $sum: { $cond: ['$computed.badges.veg', 1, 0] } },
          highNovaMeals: { $sum: { $cond: [{ $gte: ['$computed.badges.nova', 4] }, 1, 0] } }
        }
      }
    ]);

    const result = stats[0] || {
      totalMeals: 0,
      averageScore: 0,
      averageCalories: 0,
      averageProtein: 0,
      averageFiber: 0,
      proteinMeals: 0,
      vegMeals: 0,
      highNovaMeals: 0
    };

    res.json({
      message: 'Meal statistics retrieved successfully',
      stats: result
    });

  } catch (error) {
    console.error('Error fetching meal statistics:', error);
    res.status(500).json({
      message: 'Error fetching meal statistics',
      error: error.message
    });
  }
});

module.exports = router;

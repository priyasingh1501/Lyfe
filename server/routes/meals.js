const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');
const FoodItem = require('../models/FoodItem');
const auth = require('../middleware/auth');
const { aggregateNutrients } = require('../lib/meal/aggregate');
const { inferBadges } = require('../lib/meal/badges');
const { mindfulMealScore } = require('../lib/meal/score');
const { computeMealEffects } = require('../lib/meal/effects');
const OpenAIService = require('../services/openaiService');
const axios = require('axios');

// Initialize AI service
const aiService = new OpenAIService();

/**
 * Fetch external food data from USDA or other sources
 */
async function fetchExternalFoodData(externalId) {
  try {
    console.log('🔍 Fetching external food data for:', externalId);
    // Handle USDA food IDs
    if (externalId.startsWith('usda_')) {
      const fdcId = externalId.replace('usda_', '');
      const usdaApiKey = process.env.USDA_API_KEY;
      
      if (!usdaApiKey) {
        console.error('USDA API key not configured');
        return null;
      }

      console.log('🔍 Making USDA API call for FDC ID:', fdcId);
      const response = await axios.get(
        `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${usdaApiKey}`,
        { timeout: 10000 }
      );

      if (!response.data) {
        console.log('🔍 No data returned from USDA API');
        return null;
      }

      const food = response.data;
      console.log('🔍 USDA API response received, food name:', food.description);
      
      // Extract nutrients
      const nutrients = {
        kcal: food.foodNutrients?.find(n => n.nutrient?.name === 'Energy')?.amount || 0,
        protein: food.foodNutrients?.find(n => n.nutrient?.name === 'Protein')?.amount || 0,
        fat: food.foodNutrients?.find(n => n.nutrient?.name === 'Total lipid (fat)')?.amount || 0,
        carbs: food.foodNutrients?.find(n => n.nutrient?.name === 'Carbohydrate, by difference')?.amount || 0,
        fiber: food.foodNutrients?.find(n => n.nutrient?.name === 'Fiber, total dietary')?.amount || 0,
        sugar: food.foodNutrients?.find(n => n.nutrient?.name === 'Sugars, total including NLEA')?.amount || 0,
        vitaminC: food.foodNutrients?.find(n => n.nutrient?.name === 'Vitamin C, total ascorbic acid')?.amount || 0,
        zinc: food.foodNutrients?.find(n => n.nutrient?.name === 'Zinc, Zn')?.amount || 0,
        selenium: food.foodNutrients?.find(n => n.nutrient?.name === 'Selenium, Se')?.amount || 0,
        iron: food.foodNutrients?.find(n => n.nutrient?.name === 'Iron, Fe')?.amount || 0,
        omega3: 0 // USDA doesn't have omega-3 data
      };
      

      const foodData = {
        _id: externalId,
        name: food.description,
        source: 'USDA',
        externalId: fdcId,
        nutrients: nutrients,
        gi: null,
        gl: null,
        fodmap: 'Unknown',
        novaClass: 1,
        tags: [],
        provenance: {
          source: 'USDA Database',
          measured: true,
          confidence: 0.9,
          lastUpdated: new Date().toISOString()
        }
      };
      
      console.log('🔍 External food data created:', JSON.stringify(foodData, null, 2));
      return foodData;
    }

    // Handle OpenFoodFacts food IDs
    if (externalId.startsWith('off_')) {
      const offId = externalId.replace('off_', '');
      console.log('🔍 Making OpenFoodFacts API call for product ID:', offId);
      
      try {
        const response = await axios.get(
          `https://world.openfoodfacts.org/api/v0/product/${offId}.json`,
          { timeout: 10000 }
        );

        if (!response.data || response.data.status !== 1) {
          console.log('🔍 No data returned from OpenFoodFacts API');
          return null;
        }

        const product = response.data.product;
        console.log('🔍 OpenFoodFacts API response received, product name:', product.product_name);
        
        // Extract nutrients from OpenFoodFacts format
        const nutrients = {
          kcal: parseFloat(product.nutriments?.['energy-kcal_100g']) || 0,
          protein: parseFloat(product.nutriments?.['proteins_100g']) || 0,
          fat: parseFloat(product.nutriments?.['fat_100g']) || 0,
          carbs: parseFloat(product.nutriments?.['carbohydrates_100g']) || 0,
          fiber: parseFloat(product.nutriments?.['fiber_100g']) || 0,
          sugar: parseFloat(product.nutriments?.['sugars_100g']) || 0,
          vitaminC: parseFloat(product.nutriments?.['vitamin-c_100g']) || 0,
          zinc: parseFloat(product.nutriments?.['zinc_100g']) || 0,
          selenium: parseFloat(product.nutriments?.['selenium_100g']) || 0,
          iron: parseFloat(product.nutriments?.['iron_100g']) || 0,
          omega3: parseFloat(product.nutriments?.['omega-3-fat_100g']) || 0
        };

        const foodData = {
          _id: externalId,
          name: product.product_name || 'Unknown Product',
          source: 'OpenFoodFacts',
          externalId: offId,
          nutrients: nutrients,
          gi: null,
          gl: null,
          fodmap: 'Unknown',
          novaClass: product.nova_group || 1,
          tags: product.categories_tags || [],
          brand: product.brands,
          barcode: product.code,
          provenance: {
            source: 'Open Food Facts',
            measured: false,
            confidence: 0.7,
            lastUpdated: new Date().toISOString()
          }
        };
        
        console.log('🔍 External food data created:', JSON.stringify(foodData, null, 2));
        return foodData;
      } catch (offError) {
        console.error('Error fetching OpenFoodFacts data:', offError.message);
        return null;
      }
    }

    // Handle other external sources if needed
    console.log('Unsupported external food ID format:', externalId);
    return null;
  } catch (error) {
    console.error('Error fetching external food data:', error.message);
    return null;
  }
}

/**
 * Create a new meal
 * POST /api/meals
 */
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
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

    // Separate local and external food IDs
    const localFoodIds = items.filter(item => 
      /^[0-9a-fA-F]{24}$/.test(item.foodId)
    ).map(item => item.foodId);
    
    const externalFoodIds = items.filter(item => 
      !/^[0-9a-fA-F]{24}$/.test(item.foodId)
    );

    // Fetch local food items
    const localFoods = localFoodIds.length > 0 
      ? await FoodItem.find({ _id: { $in: localFoodIds } })
      : [];

    // Create food-grams mapping for local foods
    const foodMap = new Map();
    localFoods.forEach(food => foodMap.set(food._id.toString(), food));

    // Handle external foods by creating temporary food objects
    const externalFoods = [];
    for (const item of externalFoodIds) {
      // For now, we'll need to fetch the external food data
      // This is a simplified approach - in production, you might want to cache this
      const externalFood = await fetchExternalFoodData(item.foodId);
      if (externalFood) {
        foodMap.set(item.foodId, externalFood);
        externalFoods.push(externalFood);
      }
    }

    // Check if all items were found
    if (localFoods.length + externalFoods.length !== items.length) {
      return res.status(400).json({
        message: 'Some food items were not found'
      });
    }

    // Prepare items with food data
    const mealItems = items.map(item => ({
      foodId: item.foodId,
      customName: item.customName || foodMap.get(item.foodId)?.name || 'Unknown Food',
      grams: item.grams
    }));

    // Aggregate nutrients
    const itemsWithFood = items.map(item => ({
      food: foodMap.get(item.foodId),
      grams: item.grams
    }));

    const totals = aggregateNutrients(itemsWithFood);

    // Get all foods (local + external) for badge inference
    const allFoods = [...localFoods, ...externalFoods];

    // Infer badges
    const badges = inferBadges(totals, allFoods);

    // Calculate mindful meal score
    const scoreResult = mindfulMealScore(totals, badges, context);

    // Compute rule-based effects first
    const ruleBasedEffects = computeMealEffects(totals, badges, context);

    // Enhance with AI analysis
    let enhancedEffects = ruleBasedEffects;
    try {
      // Get user profile for AI analysis (you might want to fetch this from user model)
      const userProfile = {
        // Add user profile data here when available
        // age: req.user.age,
        // activityLevel: req.user.activityLevel,
        // healthGoals: req.user.healthGoals,
        // medicalConditions: req.user.medicalConditions
      };

      const mealDataForAI = {
        items: mealItems,
        computed: { totals, badges },
        context: context || {}
      };

      console.log('🤖 Starting AI meal analysis...');
      enhancedEffects = await aiService.analyzeMealEffects(mealDataForAI, userProfile, ruleBasedEffects);
      console.log('✅ AI meal analysis completed');
    } catch (aiError) {
      console.error('⚠️ AI analysis failed, using rule-based effects:', aiError.message);
      // Continue with rule-based effects if AI fails
    }

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
        effects: enhancedEffects
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
        effects: enhancedEffects
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
    const userId = req.user.userId;
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
      if (endDate) {
        // If endDate is provided, set it to end of day to include all meals on that date
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        query.ts.$lte = endDateObj;
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    console.log('🔍 GET /api/meals - Query:', JSON.stringify(query, null, 2));
    
    const meals = await Meal.find(query)
      .populate('items.foodId')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Meal.countDocuments(query);
    
    console.log('🔍 GET /api/meals - Found meals:', meals.length, 'Total:', total);
    if (meals.length > 0) {
      console.log('🔍 Sample meal:', JSON.stringify(meals[0], null, 2));
    }

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
    const userId = req.user.userId;
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
    const userId = req.user.userId;
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
    const userId = req.user.userId;
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
    const userId = req.user.userId;
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

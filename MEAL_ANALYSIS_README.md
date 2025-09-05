# 🍽️ Meal Analysis System

A comprehensive meal tracking and nutritional analysis system built for the Untangle app, specifically designed for Indian users with intelligent food recommendations and health insights.

## ✨ Features

### 🥗 **Smart Food Search**
- Search Indian foods by name and aliases (roti/chapati, curd/dahi)
- Fuzzy matching with spelling forgiveness
- Comprehensive nutritional data (macros, micros, GI, FODMAP, NOVA)

### 📊 **Live Nutritional Analysis**
- Real-time calculation of meal totals
- Macronutrient breakdown (protein, carbs, fat)
- Micronutrient tracking (iron, vitamin C, zinc, selenium, omega-3)
- Portion control with gram sliders (0-500g)

### 🏆 **Intelligent Badges**
- **Protein**: ≥20g or high density
- **Vegetables**: Contains veg/fiber ≥5g
- **GI**: Carb-weighted glycemic index
- **FODMAP**: Digestive health rating
- **NOVA**: Food processing classification

### 🎯 **Mindful Meal Score (0-5)**
- **5**: Excellent meal choice
- **4**: Very good with room for improvement
- **3**: Good meal, consider tweaks
- **2**: Fair, several areas to improve
- **1**: Needs significant improvement
- **0**: Consider different choices

### 💪 **Health Effects Analysis**
- **Strength**: Protein content, post-workout optimization
- **Immunity**: Fiber, vitamins, fermented foods
- **Inflammation**: Processing level, sugar, GI impact

### 🔧 **Meal Context Tracking**
- Post-workout meals
- Fermented food consumption
- Plant diversity count
- Body mass for portion optimization
- Added sugar tracking

## 🚀 Getting Started

### 1. **Environment Setup**
```bash
# In your client directory
echo "NEXT_PUBLIC_ENABLE_DEV_ENDPOINTS=true" >> .env.local
echo "REACT_APP_API_URL=http://localhost:5002" >> .env.local
```

### 2. **Seed the Database**
```bash
# Start your backend server
cd server
npm start

# In another terminal, seed the database
curl -X POST http://localhost:5002/api/dev/seed \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. **Access the Meal Builder**
Navigate to `/food` in your app to access the Meal Builder interface.

## 📁 Project Structure

```
src/
├── components/meal/
│   ├── MealBuilder.js          # Main component
│   ├── FoodSearch.js           # Food search and results
│   ├── MealItems.js            # Meal item management
│   ├── MealContext.js          # Context and notes
│   ├── MealAnalysis.js         # Live analysis display
│   └── index.js                # Component exports
├── pages/
│   └── Food.js                 # Updated food page
└── __tests__/
    └── components/meal/
        └── MealBuilder.test.js # Component tests

server/
├── models/
│   ├── FoodItem.js             # Food data model
│   ├── Meal.js                 # Meal tracking model
│   └── RecipeTemplate.js       # Recipe templates
├── lib/meal/
│   ├── aggregate.js            # Nutrient calculation
│   ├── badges.js               # Badge inference
│   ├── score.js                # Meal scoring
│   ├── effects.js              # Health effects
│   └── norm.js                 # Name normalization
├── routes/
│   ├── food.js                 # Food search API
│   ├── meals.js                # Meal management API
│   └── dev.js                  # Development endpoints
└── data/                       # Seed data files
    ├── ifct_seed.csv           # Nutritional data
    ├── gi_seed.csv             # Glycemic index
    ├── fodmap_seed.json        # Digestive health
    ├── nova_rules.json         # Processing levels
    ├── aliases.json            # Name variations
    └── portion_norms.json      # Serving sizes
```

## 🧪 Testing

### Run Component Tests
```bash
cd client
npm test -- --testPathPattern=MealBuilder
```

### Test API Endpoints
```bash
# Test food search
curl "http://localhost:5002/api/food/search?q=idli" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test meal creation
curl -X POST http://localhost:5002/api/meals \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"foodId": "FOOD_ID", "grams": 150}
    ],
    "notes": "Test meal"
  }'
```

## 🔍 API Endpoints

### Food Search
- `GET /api/food/search?q=query` - Search foods
- `GET /api/food/:id` - Get food details
- `GET /api/food/categories` - Get food categories
- `GET /api/food/popular` - Get popular foods
- `GET /api/food/suggestions` - Get food suggestions

### Meal Management
- `POST /api/meals` - Create meal
- `GET /api/meals` - Get user meals
- `GET /api/meals/:id` - Get meal details
- `PUT /api/meals/:id` - Update meal
- `DELETE /api/meals/:id` - Delete meal
- `GET /api/meals/stats/overview` - Get meal statistics

### Development
- `POST /api/dev/seed` - Seed database (dev only)

## 🎨 UI Components

### MealBuilder
The main interface with:
- Food search and results
- Meal item management
- Context and notes input
- Live analysis display
- Save functionality

### FoodSearch
Displays search results with:
- Nutritional information
- Badge indicators
- Quick add buttons
- Health disclaimers

### MealItems
Manages meal composition:
- Portion sliders (0-500g)
- Quick portion buttons
- Nutritional breakdown
- Remove functionality

### MealContext
Captures meal context:
- Post-workout status
- Fermented food flag
- Plant diversity count
- Body mass input
- Added sugar tracking

### MealAnalysis
Live analysis display:
- Nutritional totals
- Badge status
- Mindful meal score
- Health effects

## 🔬 Algorithm Details

### Mindful Meal Scoring
1. **Protein Bonus** (+2): ≥20g or high density
2. **Vegetable Bonus** (+1): Contains veg/fiber ≥5g
3. **Processing Penalty** (-1): NOVA ≥4
4. **Sugar Penalty** (-1): ≥15g added sugar
5. **GI Penalty** (-1): ≥70 glycemic index
6. **Balance Bonus** (+1): Carbs ≤45% or fiber ≥7g
7. **Context Bonuses** (+0.5): Post-workout, fermented

### Health Effects Calculation
- **Strength**: Protein content + post-workout carbs + iron
- **Immunity**: Fiber + vitamin C + zinc/selenium + fermented + diversity
- **Inflammation**: Fiber benefits - processing risks - sugar/GI risks

## 🚧 Development Notes

### Adding New Foods
1. Add to `data/ifct_seed.csv` with nutritional data
2. Update `data/gi_seed.csv` if GI data available
3. Update `data/fodmap_seed.json` for digestive health
4. Update `data/nova_rules.json` for processing level
5. Add aliases to `data/aliases.json`
6. Set portion norms in `data/portion_norms.json`

### Customizing Scoring
Modify the scoring logic in:
- `server/lib/meal/score.js` - Main scoring algorithm
- `server/lib/meal/effects.js` - Health effects calculation
- `server/lib/meal/badges.js` - Badge criteria

### Extending Analysis
Add new analysis features by:
1. Creating new calculation functions
2. Adding to the MealAnalysis component
3. Updating the API response structure
4. Adding corresponding tests

## 🎯 Future Enhancements

### Planned Features
- Recipe templates and suggestions
- Weekly/monthly meal insights
- Personal food preferences
- Allergy and dietary restrictions
- Meal planning and scheduling
- Social sharing and recommendations

### Integration Opportunities
- Fitness tracking apps
- Health monitoring devices
- Nutritionist consultations
- Community meal sharing
- Restaurant menu integration

## 🤝 Contributing

1. Follow the existing code structure
2. Add comprehensive tests
3. Update documentation
4. Follow the design system
5. Test with Indian food data

## 📚 Resources

- [IFCT Food Composition Database](https://ifct.ifpri.info/)
- [Glycemic Index Database](https://www.glycemicindex.com/)
- [FODMAP Food Guide](https://www.monashfodmap.com/)
- [NOVA Food Classification](https://www.foodpolitics.com/wp-content/uploads/NOVA-Classification-Reference.pdf)

## 🐛 Troubleshooting

### Common Issues
1. **Seed endpoint not working**: Check `NEXT_PUBLIC_ENABLE_DEV_ENDPOINTS=true`
2. **Food search failing**: Verify MongoDB connection and indexes
3. **Analysis not updating**: Check component re-rendering logic
4. **API errors**: Verify JWT token and CORS configuration

### Debug Mode
Enable debug logging by setting:
```bash
NODE_ENV=development
DEBUG=meal-analysis:*
```

---

**Built with ❤️ for the Untangle community**

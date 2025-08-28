import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

const MealAnalysis = ({ mealItems, context }) => {
  // Calculate totals
  const totals = useMemo(() => {
    if (mealItems.length === 0) return null;
    
    const totals = {
      kcal: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      sugar: 0,
      vitaminC: 0,
      zinc: 0,
      selenium: 0,
      iron: 0,
      omega3: 0
    };

    mealItems.forEach(item => {
      if (item.food && item.food.nutrients) {
        const factor = item.grams / 100;
        Object.keys(totals).forEach(nutrient => {
          if (item.food.nutrients[nutrient] !== undefined) {
            totals[nutrient] += (item.food.nutrients[nutrient] || 0) * factor;
          }
        });
      }
    });

    // Round to 2 decimal places
    Object.keys(totals).forEach(nutrient => {
      totals[nutrient] = Math.round(totals[nutrient] * 100) / 100;
    });

    return totals;
  }, [mealItems]);

  // Calculate badges
  const badges = useMemo(() => {
    if (!totals || mealItems.length === 0) return null;
    
    // Protein badge
    const proteinBadge = totals.protein >= 20 || (totals.kcal > 0 && (totals.protein / totals.kcal) * 100 >= 0.12);
    
    // Vegetable badge
    const hasVegTag = mealItems.some(item => 
      item.food?.tags?.some(tag => ['veg', 'leafy', 'vegetable'].includes(tag))
    );
    const vegBadge = hasVegTag || totals.fiber >= 5;
    
    // GI badge (carb-weighted mean)
    let gi = null;
    let totalCarbWeight = 0;
    let weightedGISum = 0;
    
    mealItems.forEach(item => {
      if (item.food?.gi && item.food.nutrients?.carbs) {
        const carbs = item.food.nutrients.carbs * item.grams / 100;
        totalCarbWeight += carbs;
        weightedGISum += carbs * item.food.gi;
      }
    });
    
    if (totalCarbWeight > 0) {
      gi = Math.round(weightedGISum / totalCarbWeight);
    }
    
    // FODMAP badge (worst rating)
    const fodmapLevels = { 'Unknown': 0, 'Low': 1, 'Medium': 2, 'High': 3 };
    let worstFodmap = 'Unknown';
    let worstLevel = 0;
    
    mealItems.forEach(item => {
      if (item.food?.fodmap && fodmapLevels[item.food.fodmap] > worstLevel) {
        worstLevel = fodmapLevels[item.food.fodmap];
        worstFodmap = item.food.fodmap;
      }
    });
    
    // NOVA badge (highest class)
    let nova = 1;
    mealItems.forEach(item => {
      if (item.food?.novaClass && item.food.novaClass > nova) {
        nova = item.food.novaClass;
      }
    });
    
    return {
      protein: proteinBadge,
      veg: vegBadge,
      gi,
      fodmap: worstFodmap,
      nova
    };
  }, [totals, mealItems]);

  // Calculate mindful meal score
  const score = useMemo(() => {
    if (!totals || !badges) return null;
    
    let score = 0;
    const rationale = [];
    
    // Protein bonus (+2)
    if (badges.protein) {
      score += 2;
      rationale.push('✅ Good protein content');
    }
    
    // Vegetable bonus (+1)
    if (badges.veg) {
      score += 1;
      rationale.push('✅ Contains vegetables/fiber');
    }
    
    // Ultra-processed penalty (-1)
    if (badges.nova >= 4) {
      score -= 1;
      rationale.push('⚠️ Ultra-processed foods');
    }
    
    // Sugar penalty (-1)
    if (totals.sugar >= 15) {
      score -= 1;
      rationale.push('⚠️ High sugar content');
    }
    
    // GI penalty (-1)
    if (badges.gi && badges.gi >= 70) {
      score -= 1;
      rationale.push('⚠️ High glycemic index');
    }
    
    // Carbohydrate balance bonus (+1)
    if (totals.kcal > 0) {
      const carbsPercentage = (totals.carbs * 4 / totals.kcal) * 100;
      if (carbsPercentage <= 45 || totals.fiber >= 7) {
        score += 1;
        rationale.push('✅ Balanced carbs/fiber');
      }
    }
    
    // Context bonuses
    if (context.postWorkout && badges.protein) {
      score += 0.5;
      rationale.push('✅ Good post-workout protein');
    }
    
    if (context.fermented && badges.veg) {
      score += 0.5;
      rationale.push('✅ Fermented vegetables');
    }
    
    score = Math.max(0, Math.min(5, score));
    
    return { score: Math.round(score * 10) / 10, rationale };
  }, [totals, badges, context]);

  // Calculate effects
  const effects = useMemo(() => {
    if (!totals || !badges) return null;
    
    // Strength effect (0-10)
    let strengthScore = 0;
    const strengthReasons = [];
    
    if (totals.protein >= 40) strengthScore = 7;
    else if (totals.protein >= 30) strengthScore = 6;
    else if (totals.protein >= 20) strengthScore = 5;
    else if (totals.protein >= 15) strengthScore = 3;
    else if (totals.protein >= 10) strengthScore = 1;
    
    if (context.postWorkout) {
      const requiredCarbs = Math.max(50, context.bodyMassKg * 0.8);
      if (totals.carbs >= requiredCarbs) {
        strengthScore += 2;
        strengthReasons.push('Post-workout carbs for glycogen');
      }
    }
    
    if (totals.iron >= 6) {
      strengthScore += 1;
      strengthReasons.push('Good iron for oxygen transport');
    }
    
    strengthScore = Math.min(10, strengthScore);
    
    // Immunity effect (0-10)
    let immunityScore = 0;
    const immunityReasons = [];
    
    if (totals.fiber >= 8) immunityScore += 3;
    else if (totals.fiber >= 5) immunityScore += 2;
    else if (totals.fiber >= 3) immunityScore += 1;
    
    if (totals.vitaminC >= 60) immunityScore += 2;
    else if (totals.vitaminC >= 30) immunityScore += 1;
    
    if (totals.zinc >= 5 || totals.selenium >= 30) immunityScore += 2;
    else if (totals.zinc >= 2 || totals.selenium >= 15) immunityScore += 1;
    
    if (context.fermented) immunityScore += 2;
    if (context.plantDiversity >= 5) immunityScore += 1;
    
    immunityScore = Math.min(10, immunityScore);
    
    // Inflammation effect (0-10, lower is better)
    let inflammationScore = 5; // Start neutral
    
    if (totals.fiber >= 8) inflammationScore -= 2;
    else if (totals.fiber >= 5) inflammationScore -= 1;
    
    if (totals.omega3 >= 0.5) inflammationScore -= 1;
    
    if (badges.nova >= 4) inflammationScore += 2;
    else if (badges.nova >= 3) inflammationScore += 1;
    
    if (context.addedSugar >= 15) inflammationScore += 1;
    if (badges.gi && badges.gi >= 70) inflammationScore += 1;
    
    inflammationScore = Math.max(0, Math.min(10, inflammationScore));
    
    const inflammationLabel = inflammationScore <= 3 ? 'Low' : inflammationScore <= 6 ? 'Medium' : 'High';
    
    return {
      strength: { score: strengthScore, reasons: strengthReasons },
      immunity: { score: immunityScore, reasons: immunityReasons },
      inflammation: { score: inflammationScore, label: inflammationLabel }
    };
  }, [totals, badges, context]);

  if (!totals) {
    return (
      <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-[#E8EEF2] mb-4 font-oswald tracking-wide">
          Meal Analysis
        </h2>
        <div className="text-center py-8 text-[#6B7280]">
          <p>Add foods to see live analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Totals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6"
      >
        <h2 className="text-xl font-semibold text-[#E8EEF2] mb-4 font-oswald tracking-wide">
          Nutritional Totals
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-[#2A313A] rounded-lg">
            <div className="text-2xl font-bold text-[#FFD200]">{Math.round(totals.kcal)}</div>
            <div className="text-sm text-[#C9D1D9]">kcal</div>
          </div>
          <div className="text-center p-3 bg-[#2A313A] rounded-lg">
            <div className="text-2xl font-bold text-[#3EA6FF]">{totals.protein}g</div>
            <div className="text-sm text-[#C9D1D9]">Protein</div>
          </div>
          <div className="text-center p-3 bg-[#2A313A] rounded-lg">
            <div className="text-2xl font-bold text-[#FF6B6B]">{totals.carbs}g</div>
            <div className="text-sm text-[#C9D1D9]">Carbs</div>
          </div>
          <div className="text-center p-3 bg-[#2A313A] rounded-lg">
            <div className="text-2xl font-bold text-[#FFD93D]">{totals.fat}g</div>
            <div className="text-sm text-[#C9D1D9]">Fat</div>
          </div>
        </div>
        
        {/* Additional nutrients */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <div className="text-center p-2 bg-[#0A0C0F] rounded">
            <div className="text-[#FFD200] font-medium">Fiber</div>
            <div className="text-[#E8EEF2]">{totals.fiber}g</div>
          </div>
          <div className="text-center p-2 bg-[#0A0C0F] rounded">
            <div className="text-[#FFD200] font-medium">Sugar</div>
            <div className="text-[#E8EEF2]">{totals.sugar}g</div>
          </div>
          <div className="text-center p-2 bg-[#0A0C0F] rounded">
            <div className="text-[#FFD200] font-medium">Iron</div>
            <div className="text-[#E8EEF2]">{totals.iron}mg</div>
          </div>
        </div>
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6"
      >
        <h2 className="text-xl font-semibold text-[#E8EEF2] mb-4 font-oswald tracking-wide">
          Meal Badges
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          <div className={`text-center p-3 rounded-lg border-2 ${
            badges.protein 
              ? 'bg-green-900/30 border-green-600 text-green-300' 
              : 'bg-gray-900/30 border-gray-600 text-gray-400'
          }`}>
            <div className="text-lg font-bold">{badges.protein ? '✓' : '✗'}</div>
            <div className="text-sm">Protein</div>
          </div>
          
          <div className={`text-center p-3 rounded-lg border-2 ${
            badges.veg 
              ? 'bg-green-900/30 border-green-600 text-green-300' 
              : 'bg-gray-900/30 border-gray-600 text-gray-400'
          }`}>
            <div className="text-lg font-bold">{badges.veg ? '✓' : '✗'}</div>
            <div className="text-sm">Vegetables</div>
          </div>
          
          <div className="text-center p-3 bg-[#2A313A] rounded-lg border-2 border-[#2A313A]">
            <div className="text-lg font-bold text-[#3EA6FF]">{badges.gi || '—'}</div>
            <div className="text-sm text-[#C9D1D9]">GI</div>
          </div>
          
          <div className={`text-center p-3 rounded-lg border-2 ${
            badges.fodmap === 'Low' 
              ? 'bg-green-900/30 border-green-600 text-green-300'
              : badges.fodmap === 'Medium'
              ? 'bg-yellow-900/30 border-yellow-600 text-yellow-300'
              : badges.fodmap === 'High'
              ? 'bg-red-900/30 border-red-600 text-red-300'
              : 'bg-gray-900/30 border-gray-600 text-gray-400'
          }`}>
            <div className="text-lg font-bold">{badges.fodmap}</div>
            <div className="text-sm">FODMAP</div>
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            badges.nova === 1 
              ? 'bg-green-900/30 text-green-300 border border-green-600'
              : badges.nova === 2
              ? 'bg-blue-900/30 text-blue-300 border border-blue-600'
              : badges.nova === 3
              ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-600'
              : 'bg-red-900/30 text-red-300 border border-red-600'
          }`}>
            NOVA {badges.nova}: {badges.nova === 1 ? 'Unprocessed' : badges.nova === 2 ? 'Minimal' : badges.nova === 3 ? 'Processed' : 'Ultra-processed'}
          </div>
        </div>
      </motion.div>

      {/* Mindful Meal Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6"
      >
        <h2 className="text-xl font-semibold text-[#E8EEF2] mb-4 font-oswald tracking-wide">
          Mindful Meal Score
        </h2>
        
        <div className="text-center mb-4">
          <div className={`text-4xl font-bold mb-2 ${
            score.score >= 4 ? 'text-green-400' :
            score.score >= 3 ? 'text-blue-400' :
            score.score >= 2 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {score.score}/5
          </div>
          <div className="text-sm text-[#C9D1D9]">
            {score.score >= 4 ? 'Excellent' : 
             score.score >= 3 ? 'Good' : 
             score.score >= 2 ? 'Fair' : 'Needs Improvement'}
          </div>
        </div>
        
        {/* Rationale */}
        <div className="space-y-2">
          {score.rationale.map((reason, index) => (
            <div key={index} className="text-sm text-[#C9D1D9] flex items-start space-x-2">
              <span className="text-[#FFD200] mt-0.5">•</span>
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Effects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6"
      >
        <h2 className="text-xl font-semibold text-[#E8EEF2] mb-4 font-oswald tracking-wide">
          Meal Effects
        </h2>
        
        <div className="space-y-4">
          {/* Strength */}
          <div className="p-3 bg-[#2A313A] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#C9D1D9] font-medium">💪 Strength</span>
              <span className="text-[#3EA6FF] font-bold">{effects.strength.score}/10</span>
            </div>
            <div className="w-full bg-[#0A0C0F] rounded-full h-2">
              <div 
                className="bg-[#3EA6FF] h-2 rounded-full transition-all duration-500"
                style={{ width: `${(effects.strength.score / 10) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Immunity */}
          <div className="p-3 bg-[#2A313A] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#C9D1D9] font-medium">🛡️ Immunity</span>
              <span className="text-[#4ADE80] font-bold">{effects.immunity.score}/10</span>
            </div>
            <div className="w-full bg-[#0A0C0F] rounded-full h-2">
              <div 
                className="bg-[#4ADE80] h-2 rounded-full transition-all duration-500"
                style={{ width: `${(effects.immunity.score / 10) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Inflammation */}
          <div className="p-3 bg-[#2A313A] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#C9D1D9] font-medium">🔥 Inflammation</span>
              <span className={`font-bold ${
                effects.inflammation.label === 'Low' ? 'text-[#4ADE80]' :
                effects.inflammation.label === 'Medium' ? 'text-[#FBBF24]' :
                'text-[#F87171]'
              }`}>
                {effects.inflammation.label}
              </span>
            </div>
            <div className="w-full bg-[#0A0C0F] rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  effects.inflammation.label === 'Low' ? 'bg-[#4ADE80]' :
                  effects.inflammation.label === 'Medium' ? 'bg-[#FBBF24]' :
                  'bg-[#F87171]'
                }`}
                style={{ width: `${(effects.inflammation.score / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MealAnalysis;

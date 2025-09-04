import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import { Calendar, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

const DailyMealKPIs = () => {
  const { token } = useAuth();
  const [dailyMeals, setDailyMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Fetch meals for today
  const fetchTodayMeals = async (isRefresh = false) => {
    if (!token) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const today = getTodayDate();
      const response = await fetch(
        `${buildApiUrl('/api/meals')}?startDate=${today}&endDate=${today}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch meals');
      }

      const data = await response.json();
      setDailyMeals(data.meals || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching today\'s meals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTodayMeals();
  }, [token]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchTodayMeals(true);
  };

  // Calculate aggregated effects from all meals
  const calculateAggregatedEffects = () => {
    if (!dailyMeals.length) return null;

    const aggregatedEffects = {
      strength: { score: 0, count: 0 },
      immunity: { score: 0, count: 0 },
      inflammation: { score: 0, count: 0 },
      energizing: { score: 0, count: 0 },
      gutFriendly: { score: 0, count: 0 },
      moodLifting: { score: 0, count: 0 },
      fatForming: { score: 0, count: 0 }
    };

    dailyMeals.forEach(meal => {
      if (meal.computed?.effects) {
        Object.keys(aggregatedEffects).forEach(effectKey => {
          if (meal.computed.effects[effectKey]?.score !== undefined) {
            aggregatedEffects[effectKey].score += meal.computed.effects[effectKey].score;
            aggregatedEffects[effectKey].count += 1;
          }
        });
      }
    });

    // Calculate averages
    Object.keys(aggregatedEffects).forEach(effectKey => {
      if (aggregatedEffects[effectKey].count > 0) {
        aggregatedEffects[effectKey].average = 
          Math.round((aggregatedEffects[effectKey].score / aggregatedEffects[effectKey].count) * 10) / 10;
      } else {
        aggregatedEffects[effectKey].average = 0;
      }
    });

    return aggregatedEffects;
  };

  // Calculate total nutrition for the day
  const calculateDailyNutrition = () => {
    if (!dailyMeals.length) return null;

    const totals = {
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0
    };

    dailyMeals.forEach(meal => {
      if (meal.computed?.totals) {
        Object.keys(totals).forEach(nutrient => {
          if (meal.computed.totals[nutrient]) {
            totals[nutrient] += meal.computed.totals[nutrient];
          }
        });
      }
    });

    // Round to 1 decimal place
    Object.keys(totals).forEach(nutrient => {
      totals[nutrient] = Math.round(totals[nutrient] * 10) / 10;
    });

    return totals;
  };

  // Get effect level and color
  const getEffectLevel = (score, effectKey) => {
    if (effectKey === 'fatForming' || effectKey === 'inflammation') {
      // Lower is better for these effects
      if (score <= 3) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50' };
      if (score <= 5) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-50' };
      if (score <= 7) return { level: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
      return { level: 'Needs Attention', color: 'text-red-600', bgColor: 'bg-red-50' };
    } else {
      // Higher is better for other effects
      if (score >= 7) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50' };
      if (score >= 5) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-50' };
      if (score >= 3) return { level: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
      return { level: 'Needs Attention', color: 'text-red-600', bgColor: 'bg-red-50' };
    }
  };

  const aggregatedEffects = calculateAggregatedEffects();
  const dailyNutrition = calculateDailyNutrition();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-600">Error loading daily meal data: {error}</p>
      </div>
    );
  }

  if (!dailyMeals.length) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-center">
          <Calendar className="w-5 h-5 text-blue-500 mr-2" />
          <p className="text-blue-600">No meals logged today. Start by adding your first meal!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Today's Meal Effects</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            {getTodayDate()}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`p-2 rounded-lg border transition-colors ${
              refreshing 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }`}
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Daily Nutrition Summary */}
      {dailyNutrition && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Daily Nutrition Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Calories:</span>
              <span className="ml-2 font-medium">{dailyNutrition.kcal} kcal</span>
            </div>
            <div>
              <span className="text-gray-500">Protein:</span>
              <span className="ml-2 font-medium">{dailyNutrition.protein}g</span>
            </div>
            <div>
              <span className="text-gray-500">Carbs:</span>
              <span className="ml-2 font-medium">{dailyNutrition.carbs}g</span>
            </div>
            <div>
              <span className="text-gray-500">Fat:</span>
              <span className="ml-2 font-medium">{dailyNutrition.fat}g</span>
            </div>
            <div>
              <span className="text-gray-500">Fiber:</span>
              <span className="ml-2 font-medium">{dailyNutrition.fiber}g</span>
            </div>
            <div>
              <span className="text-gray-500">Sugar:</span>
              <span className="ml-2 font-medium">{dailyNutrition.sugar}g</span>
            </div>
          </div>
        </div>
      )}

      {/* Effects KPIs */}
      {aggregatedEffects && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">Health Effects Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(aggregatedEffects).map(([effectKey, data]) => {
              const { level, color, bgColor } = getEffectLevel(data.average, effectKey);
              const icons = {
                strength: '💪',
                immunity: '🌿',
                inflammation: '🔥',
                energizing: '⚡️',
                gutFriendly: '🌀',
                moodLifting: '😊',
                fatForming: '🍔'
              };
              
              const labels = {
                strength: 'Strength',
                immunity: 'Immunity',
                inflammation: 'Inflammation',
                energizing: 'Energy',
                gutFriendly: 'Gut Health',
                moodLifting: 'Mood',
                fatForming: 'Fat Formation'
              };

              return (
                <div key={effectKey} className={`p-4 rounded-lg border ${bgColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{icons[effectKey]}</span>
                    <span className={`text-xs font-medium ${color}`}>{level}</span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    {labels[effectKey]}
                  </h4>
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-gray-900">
                      {data.average}/10
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({data.count} meals)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Meal Count Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total meals today:</span>
          <span className="font-medium text-gray-900">{dailyMeals.length}</span>
        </div>
      </div>
    </div>
  );
};

export default DailyMealKPIs;

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import { RefreshCw, Utensils } from 'lucide-react';
import Card from '../ui/Card';

const DailyMealKPIs = ({ refreshTrigger }) => {
  const { token } = useAuth();
  const [dailyMeals, setDailyMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get today's local date in YYYY-MM-DD format (avoid UTC shift)
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  // Fetch meals for today
  const fetchTodayMeals = useCallback(async (isRefresh = false) => {
    if (!token) {
      return;
    }

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
        const errorData = await response.json().catch(() => ({}));
        console.error('DailyMealKPIs: Failed to fetch meals:', response.status, errorData);
        throw new Error(`Failed to fetch meals: ${errorData.message || 'Unknown error'}`);
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
  }, [token]);


  useEffect(() => {
    fetchTodayMeals();
  }, [fetchTodayMeals]);

  // Respond to refresh trigger from parent component
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchTodayMeals(true);
    }
  }, [refreshTrigger, fetchTodayMeals]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchTodayMeals(true);
  };

  // Helper function to format meal time
  const formatMealTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Helper function to get meal effect level
  const getMealEffectLevel = (score) => {
    if (score >= 8) return { level: 'Excellent', color: 'text-green-600' };
    if (score >= 6) return { level: 'Good', color: 'text-blue-600' };
    if (score >= 4) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Needs Attention', color: 'text-red-600' };
  };

  const handleEffectClick = (effectKey, effectData, meal) => {
    console.log('🔍 Effect clicked:', effectKey, effectData);
    setSelectedEffect({ key: effectKey, data: effectData });
    setSelectedMeal(meal);
  };

  const closeEffectDetails = () => {
    setSelectedEffect(null);
    setSelectedMeal(null);
  };

  // Icons and labels for effects
  const icons = {
    strength: 'Strength',
    immunity: 'Immunity',
    inflammation: 'Inflammation',
    antiInflammatory: 'Anti-Inflammatory',
    energizing: 'Energizing',
    gutFriendly: 'Gut Friendly',
    moodLifting: 'Mood',
    fatForming: 'Fat Forming'
  };

  const labels = {
    strength: 'Strength',
    immunity: 'Immunity',
    inflammation: 'Inflammatory',
    antiInflammatory: 'Anti-Inflammatory',
    energizing: 'Energy',
    gutFriendly: 'Gut Health',
    moodLifting: 'Mood',
    fatForming: 'Fat Formation'
  };


  // Calculate daily nutrition totals
  const calculateDailyNutrition = () => {
    return dailyMeals.reduce((acc, meal) => {
      if (meal.computed?.totals) {
        Object.keys(meal.computed.totals).forEach(nutrient => {
          acc[nutrient] = (acc[nutrient] || 0) + (meal.computed.totals[nutrient] || 0);
        });
      }
      return acc;
    }, {});
  };


  // Calculate daily aggregated effects
  const calculateDailyEffects = () => {
    return dailyMeals.reduce((acc, meal) => {
      if (meal.computed?.effects) {
        Object.entries(meal.computed.effects).forEach(([effectKey, effectData]) => {
          if (!acc[effectKey]) {
            acc[effectKey] = {
              score: 0,
              level: 'Very Low',
              why: []
            };
          }
          
          // Sum up scores
          acc[effectKey].score += effectData.score || 0;
          
          // Combine reasons (avoid duplicates)
          if (effectData.why && Array.isArray(effectData.why)) {
            effectData.why.forEach(reason => {
              if (!acc[effectKey].why.includes(reason)) {
                acc[effectKey].why.push(reason);
              }
            });
          }
        });
      }
      return acc;
    }, {});
  };


  // Get current data (only daily now)
  const currentMeals = dailyMeals;
  const currentNutrition = calculateDailyNutrition();
  const currentEffects = calculateDailyEffects();
  
  if (loading) {
    return (
      <Card variant="elevated">
        <div className="animate-pulse">
          <div className="h-4 bg-background-tertiary rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-16 bg-background-tertiary rounded"></div>
            <div className="h-16 bg-background-tertiary rounded"></div>
            <div className="h-16 bg-background-tertiary rounded"></div>
            <div className="h-16 bg-background-tertiary rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="elevated">
        <div className="text-center">
          <p className="font-jakarta text-sm text-accent mb-4">Error loading meals: {error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </Card>
    );
  }

  if (!currentMeals.length) {
    return (
      <Card variant="elevated">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-[#2A313A] rounded-full mx-auto mb-4 flex items-center justify-center">
            <Utensils className="text-[#C9D1D9]" size={24} />
          </div>
          <h3 className="font-jakarta text-lg font-semibold text-text-primary mb-2">No Meals Today</h3>
          <p className="font-jakarta text-text-secondary mb-4">Log your meals to see daily nutrition insights</p>
          <a
            href="/food"
            className="inline-flex items-center px-4 py-2 bg-[#1E49C9] text-white text-sm rounded-lg hover:bg-[#1E49C9]/80 transition-colors"
          >
            LOG MEAL
          </a>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-jakarta text-2xl leading-normal text-text-primary font-bold">
          Daily Nutrition
        </h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1 px-2 py-1 font-jakarta text-xs leading-relaxed tracking-wider text-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Nutrition Summary */}
      <div className="mb-4 p-3 bg-background-tertiary rounded-lg">
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-text-primary">{Math.round(currentNutrition.kcal || 0)}</div>
            <div className="text-xs text-text-secondary">kcal</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-text-primary">{Math.round(currentNutrition.protein || 0)}g</div>
            <div className="text-xs text-text-secondary">protein</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-text-primary">{Math.round(currentNutrition.carbs || 0)}g</div>
            <div className="text-xs text-text-secondary">carbs</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-text-primary">{Math.round(currentNutrition.fat || 0)}g</div>
            <div className="text-xs text-text-secondary">fat</div>
          </div>
        </div>
        
        {/* Health Effects Summary */}
        {Object.entries(currentEffects).some(([effectKey, effectData]) => (effectData.score || 0) > 0) && (
          <div className="mt-3">
            <details className="group">
              <summary className="cursor-pointer text-xs text-text-secondary hover:text-text-primary transition-colors">
                Effects ({Object.entries(currentEffects).filter(([effectKey, effectData]) => (effectData.score || 0) > 0).length})
              </summary>
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(currentEffects)
                  .filter(([effectKey, effectData]) => (effectData.score || 0) > 0)
                  .map(([effectKey, effectData]) => {
                  const score = effectData.score || 0;
                  const bgColor = score >= 6 ? 'bg-green-900/20 border-green-500/30' : 
                                 score >= 4 ? 'bg-yellow-900/20 border-yellow-500/30' : 
                                 'bg-red-900/20 border-red-500/30';

                  return (
                    <div 
                      key={effectKey} 
                      className={`px-2 py-1 rounded border text-xs cursor-pointer hover:opacity-80 transition-opacity ${bgColor}`}
                      onClick={() => handleEffectClick(effectKey, effectData, null)}
                    >
                      <span className="text-xs">{icons[effectKey] || 'Data'}</span>
                      <span className="ml-1 font-medium">{labels[effectKey] || effectKey}</span>
                      <span className="ml-1 text-text-secondary">({score})</span>
                    </div>
                  );
                })}
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Day-Level Summary */}
      {currentMeals.length > 0 && (
        <div className="mt-4 p-4 bg-background-tertiary/30 rounded-lg border border-border-primary">
          <div className="text-center mb-3">
            <div className="text-sm text-text-secondary">
              {currentMeals.length} meal{currentMeals.length !== 1 ? 's' : ''} logged today
            </div>
          </div>
          
          {/* Daily Health Score */}
          {Object.entries(currentEffects).some(([effectKey, effectData]) => (effectData.score || 0) > 0) && (
            <div className="mb-4">
              <div className="text-sm font-medium text-text-primary mb-2 text-center">Daily Health Impact</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {Object.entries(currentEffects)
                  .filter(([effectKey, effectData]) => (effectData.score || 0) > 0)
                  .sort((a, b) => (b[1].score || 0) - (a[1].score || 0))
                  .map(([effectKey, effectData]) => {
                  const score = effectData.score || 0;
                  const bgColor = score >= 6 ? 'bg-green-900/20 border-green-500/30' : 
                                 score >= 4 ? 'bg-yellow-900/20 border-yellow-500/30' : 
                                 'bg-red-900/20 border-red-500/30';

                  return (
                    <div 
                      key={effectKey} 
                      className={`px-3 py-2 rounded-lg border text-sm cursor-pointer hover:opacity-80 transition-opacity ${bgColor}`}
                      onClick={() => handleEffectClick(effectKey, effectData, null)}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{labels[effectKey] || effectKey}</span>
                        <span className="text-xs text-text-secondary">({score})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Effect Details Modal */}
      {selectedEffect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background-secondary border border-border-primary rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">
                  {icons[selectedEffect.key]} {labels[selectedEffect.key]} Details
                </h3>
                <button
                  onClick={closeEffectDetails}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-primary">Score</span>
                  <span className={`text-lg font-bold ${getMealEffectLevel(selectedEffect.data.score || 0).color}`}>
                    {selectedEffect.data.score || 0}/10
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">Level</span>
                  <span className="text-sm text-text-secondary">
                    {selectedEffect.data.label || selectedEffect.data.level || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-text-primary mb-2">Contributing Factors</h4>
                {selectedEffect.data.why && selectedEffect.data.why.length > 0 ? (
                  <ul className="space-y-1">
                    {selectedEffect.data.why.map((reason, index) => (
                      <li key={index} className="text-sm text-text-secondary flex items-start">
                        <span className="mr-2">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-text-muted">No specific factors identified</p>
                )}
              </div>

              {/* AI Insights */}
              {selectedEffect.data.aiInsights && (
                <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">AI</span>
                    <h4 className="text-sm font-medium text-blue-300">AI Insights</h4>
                  </div>
                  <p className="text-sm text-blue-200 leading-relaxed">
                    {selectedEffect.data.aiInsights}
                  </p>
                </div>
              )}

              {/* AI Enhanced Indicator */}
              {selectedEffect.data.aiEnhanced && (
                <div className="mb-4 flex items-center gap-2 text-xs text-green-400">
                  <span>✨</span>
                  <span>Enhanced with AI analysis</span>
                </div>
              )}

              <div className="mb-4">
                <h4 className="text-sm font-medium text-text-primary mb-2">
                  {selectedMeal ? 'Meal Items' : 'All Meals Today'}
                </h4>
                <div className="space-y-2">
                  {selectedMeal ? (
                    selectedMeal.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-background-tertiary rounded">
                        <span className="text-sm text-text-primary">{item.customName}</span>
                        <span className="text-xs text-text-secondary">{item.grams}g</span>
                      </div>
                    ))
                  ) : (
                    currentMeals
                      .filter(meal => (meal.computed?.effects?.[selectedEffect.key]?.score || 0) > 0)
                      .map((meal, mealIndex) => (
                        <div key={mealIndex} className="p-2 bg-background-tertiary rounded">
                          <div className="text-sm font-medium text-text-primary mb-1">
                            Meal {mealIndex + 1} - {formatMealTime(meal.ts)}
                          </div>
                          <div className="space-y-1">
                            {meal.items.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex items-center justify-between text-xs">
                                <span className="text-text-secondary">{item.customName}</span>
                                <span className="text-text-muted">{item.grams}g</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={closeEffectDetails}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DailyMealKPIs;
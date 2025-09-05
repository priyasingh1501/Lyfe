import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import { RefreshCw } from 'lucide-react';

const DailyMealKPIs = ({ refreshTrigger }) => {
  const { token } = useAuth();
  const [dailyMeals, setDailyMeals] = useState([]);
  const [monthlyMeals, setMonthlyMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEffect, setSelectedEffect] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('day');

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    return dateStr;
  };

  // Get current month's date range
  const getCurrentMonthRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0]
    };
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

  // Fetch meals for current month
  const fetchMonthlyMeals = useCallback(async (isRefresh = false) => {
    if (!token) {
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const { startDate, endDate } = getCurrentMonthRange();
      
      const response = await fetch(
        `${buildApiUrl('/api/meals')}?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('DailyMealKPIs: Failed to fetch monthly meals:', response.status, errorData);
        throw new Error(`Failed to fetch monthly meals: ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('DailyMealKPIs: Fetched monthly meals:', data);
      
      setMonthlyMeals(data.meals || []);
      setError(null);
    } catch (err) {
      console.error('DailyMealKPIs: Error fetching monthly meals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'day') {
      fetchTodayMeals();
    } else if (activeTab === 'month') {
      fetchMonthlyMeals();
    }
  }, [activeTab, fetchTodayMeals, fetchMonthlyMeals]);

  // Respond to refresh trigger from parent component
  useEffect(() => {
    if (refreshTrigger > 0) {
      if (activeTab === 'day') {
        fetchTodayMeals(true);
      } else if (activeTab === 'month') {
        fetchMonthlyMeals(true);
      }
    }
  }, [refreshTrigger, activeTab, fetchTodayMeals, fetchMonthlyMeals]);

  // Handle manual refresh
  const handleRefresh = () => {
    if (activeTab === 'day') {
      fetchTodayMeals(true);
    } else if (activeTab === 'month') {
      fetchMonthlyMeals(true);
    }
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
    strength: '💪',
    immunity: '🛡️',
    inflammation: '🔥',
    antiInflammatory: '❄️',
    energizing: '⚡',
    gutFriendly: '🌱',
    moodLifting: '😊',
    fatForming: '🍔'
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

  // Calculate monthly nutrition totals
  const calculateMonthlyNutrition = () => {
    return monthlyMeals.reduce((acc, meal) => {
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

  // Calculate monthly aggregated effects
  const calculateMonthlyEffects = () => {
    return monthlyMeals.reduce((acc, meal) => {
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

  // Get current data based on active tab
  const currentMeals = activeTab === 'day' ? dailyMeals : monthlyMeals;
  const currentNutrition = activeTab === 'day' ? calculateDailyNutrition() : calculateMonthlyNutrition();
  const currentEffects = activeTab === 'day' ? calculateDailyEffects() : calculateMonthlyEffects();
  
  if (loading) {
    return (
      <div className="bg-background-secondary rounded-lg shadow-sm border border-border-primary p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-background-tertiary rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-16 bg-background-tertiary rounded"></div>
            <div className="h-16 bg-background-tertiary rounded"></div>
            <div className="h-16 bg-background-tertiary rounded"></div>
            <div className="h-16 bg-background-tertiary rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background-secondary rounded-lg shadow-sm border border-border-primary p-6 mb-6">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading meals: {error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-accent-green text-text-inverse rounded hover:bg-accent-green/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentMeals.length) {
    return (
      <div className="bg-background-secondary rounded-lg shadow-sm border border-border-primary p-4 mb-6">
        <div className="text-center text-text-secondary">
          No meals {activeTab === 'day' ? 'today' : 'this month'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-secondary rounded-lg shadow-sm border border-border-primary p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-text-primary">
            {activeTab === 'day' ? 'Today' : 'This Month'}
          </h2>
          <div className="flex bg-background-tertiary rounded p-1">
            <button
              onClick={() => setActiveTab('day')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                activeTab === 'day'
                  ? 'bg-accent-green text-text-inverse'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setActiveTab('month')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                activeTab === 'month'
                  ? 'bg-accent-green text-text-inverse'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Month
            </button>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1 px-2 py-1 text-xs text-text-secondary hover:text-text-primary disabled:opacity-50 transition-colors"
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
        {Object.keys(currentEffects).length > 0 && (
          <div className="mt-3">
            <details className="group">
              <summary className="cursor-pointer text-xs text-text-secondary hover:text-text-primary transition-colors">
                Effects ({Object.keys(currentEffects).length})
              </summary>
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(currentEffects).map(([effectKey, effectData]) => {
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
                      <span className="text-xs">{icons[effectKey] || '📊'}</span>
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

      {/* Individual Meals List */}
      <div className="space-y-2">
        {currentMeals.map((meal, index) => (
          <div key={meal._id || index} className="bg-background-tertiary/60 border border-border-primary rounded-lg p-3">
            {/* Meal Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary">
                  {formatMealTime(meal.ts)}
                </span>
              </div>
            </div>

            {/* Meal Effects - Upfront Display */}
            {meal.computed?.effects && Object.keys(meal.computed.effects).length > 0 ? (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {Object.entries(meal.computed.effects).map(([effectKey, effectData]) => {
                    const score = effectData.score || 0;
                    const bgColor = score >= 6 ? 'bg-green-900/20 border-green-500/30' : 
                                   score >= 4 ? 'bg-yellow-900/20 border-yellow-500/30' : 
                                   'bg-red-900/20 border-red-500/30';

                    return (
                      <div 
                        key={effectKey} 
                        className={`px-2 py-1 rounded border text-xs cursor-pointer hover:opacity-80 transition-opacity ${bgColor}`}
                        onClick={() => handleEffectClick(effectKey, effectData, meal)}
                      >
                        <span className="text-xs">{icons[effectKey] || '📊'}</span>
                        <span className="ml-1 font-medium">{labels[effectKey] || effectKey}</span>
                        <span className="ml-1 text-text-secondary">({score})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Meal Badges */}
            {meal.computed?.badges && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {/* Protein Badge */}
                  {meal.computed.badges.protein && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-300 border border-green-500/30">
                      💪 Protein
                    </span>
                  )}
                  
                  {/* Vegetable Badge */}
                  {meal.computed.badges.veg && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-300 border border-green-500/30">
                      🥬 Vegetables
                    </span>
                  )}
                  
                  {/* GI Badge */}
                  {meal.computed.badges.gi && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                      meal.computed.badges.gi <= 55 
                        ? 'bg-green-900/20 text-green-300 border-green-500/30'
                        : meal.computed.badges.gi <= 69
                        ? 'bg-yellow-900/20 text-yellow-300 border-yellow-500/30'
                        : 'bg-red-900/20 text-red-300 border-red-500/30'
                    }`}>
                      📊 GI: {meal.computed.badges.gi}
                    </span>
                  )}
                  
                  {/* FODMAP Badge */}
                  {meal.computed.badges.fodmap && meal.computed.badges.fodmap !== 'Unknown' && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                      meal.computed.badges.fodmap === 'Low'
                        ? 'bg-green-900/20 text-green-300 border-green-500/30'
                        : meal.computed.badges.fodmap === 'Medium'
                        ? 'bg-yellow-900/20 text-yellow-300 border-yellow-500/30'
                        : 'bg-red-900/20 text-red-300 border-red-500/30'
                    }`}>
                      🌱 FODMAP: {meal.computed.badges.fodmap}
                    </span>
                  )}
                  
                  {/* NOVA Badge */}
                  {meal.computed.badges.nova && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                      meal.computed.badges.nova === 1
                        ? 'bg-green-900/20 text-green-300 border-green-500/30'
                        : meal.computed.badges.nova === 2
                        ? 'bg-blue-900/20 text-blue-300 border-blue-500/30'
                        : meal.computed.badges.nova === 3
                        ? 'bg-yellow-900/20 text-yellow-300 border-yellow-500/30'
                        : 'bg-red-900/20 text-red-300 border-red-500/30'
                    }`}>
                      🏭 NOVA {meal.computed.badges.nova}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Meal Items */}
            <div className="mb-2">
              <div className="flex flex-wrap gap-2">
                {meal.items?.map((item, itemIndex) => (
                  <span key={itemIndex} className="text-xs bg-background-primary px-2 py-1 rounded">
                    {item.customName || item.food?.name || 'Unknown food'} ({item.grams}g)
                  </span>
                ))}
              </div>
            </div>

            {/* Nutrition Summary */}
            {meal.computed?.totals && (
              <div className="flex flex-wrap gap-1 text-xs mb-3">
                <span className="px-2 py-1 rounded bg-background-primary text-text-secondary">{meal.computed.totals.kcal || 0} kcal</span>
                <span className="px-2 py-1 rounded bg-background-primary text-text-secondary">{meal.computed.totals.protein || 0}g protein</span>
                <span className="px-2 py-1 rounded bg-background-primary text-text-secondary">{meal.computed.totals.carbs || 0}g carbs</span>
                <span className="px-2 py-1 rounded bg-background-primary text-text-secondary">{meal.computed.totals.fat || 0}g fat</span>
              </div>
            )}

            {/* AI Insights - Always show for debugging */}
            <div className="mt-2 pt-2 border-t border-border-primary">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">🤖</span>
                <h4 className="text-sm font-medium text-blue-300">AI Insights</h4>
              </div>
              <div className="text-xs text-blue-200 leading-relaxed">
                {(() => {
                  console.log('🔍 Debug meal data:', {
                    hasComputed: !!meal.computed,
                    hasEffects: !!meal.computed?.effects,
                    effectsKeys: meal.computed?.effects ? Object.keys(meal.computed.effects) : [],
                    hasAiInsights: !!meal.computed?.aiInsights,
                    aiInsights: meal.computed?.aiInsights,
                    fullComputed: meal.computed,
                    fullMeal: meal
                  });
                  
                  // First check for general AI insights at meal level
                  if (meal.computed?.aiInsights) {
                    console.log('🔍 Using general AI insights:', meal.computed.aiInsights);
                    return meal.computed.aiInsights;
                  }
                  
                  // Then find the first effect with AI insights
                  if (meal.computed?.effects) {
                    const effectsWithInsights = Object.entries(meal.computed.effects)
                      .filter(([_, effectData]) => effectData.aiInsights)
                      .map(([_, effectData]) => effectData.aiInsights);
                    
                    if (effectsWithInsights.length > 0) {
                      console.log('🔍 Using effect AI insights:', effectsWithInsights[0]);
                      return effectsWithInsights[0];
                    }
                  }
                  
                  // Fallback: Generate a basic insight based on the effects
                  const effects = meal.computed?.effects || {};
                  const insights = [];
                  
                  if (effects.strength?.score >= 7) {
                    insights.push("Excellent for muscle building and recovery");
                  }
                  if (effects.immunity?.score >= 7) {
                    insights.push("Great for immune system support");
                  }
                  if (effects.energizing?.score >= 7) {
                    insights.push("Very energizing for active periods");
                  }
                  if (effects.gutFriendly?.score >= 7) {
                    insights.push("Excellent for gut health");
                  }
                  if (effects.moodLifting?.score >= 7) {
                    insights.push("Great for mood and mental well-being");
                  }
                  if (effects.fatForming?.score >= 6) {
                    insights.push("May contribute to fat storage - consider lighter options");
                  }
                  if (effects.inflammation?.score >= 6) {
                    insights.push("May trigger inflammation - consider anti-inflammatory foods");
                  }
                  
                  if (insights.length > 0) {
                    console.log('🔍 Using fallback insights:', insights);
                    return insights.join(". ") + ".";
                  }
                  
                  console.log('🔍 Using default message');
                  console.log('🔍 Available effects:', effects);
                  return `AI analyzed this meal for nutritional impact and health effects. Effects: ${Object.keys(effects).join(', ')}`;
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Meal Count Summary */}
      {currentMeals.length > 0 && (
        <div className="mt-3 text-center">
          <div className="text-xs text-text-secondary">
            {currentMeals.length} meal{currentMeals.length !== 1 ? 's' : ''} {activeTab === 'day' ? 'today' : 'this month'}
          </div>
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
                    <span className="text-sm">🤖</span>
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
                  {selectedMeal ? 'Meal Items' : `All Meals ${activeTab === 'day' ? 'Today' : 'This Month'}`}
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
    </div>
  );
};

export default DailyMealKPIs;
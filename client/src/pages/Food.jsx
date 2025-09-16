import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MealBuilder from '../components/meal/MealBuilder';
import DailyMealKPIs from '../components/meal/DailyMealKPIs';
import FoodSearch from '../components/food/FoodSearch';
import TestCustomFood from '../components/food/TestCustomFood';
import { Section, Header, Banner, Card } from '../components/ui';

const Food = () => {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to trigger refresh of meal data
  const triggerMealRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  if (!user) {
    return (
      <Section>
        <Banner variant="info">
          Please log in to access food search and meal planning features.
        </Banner>
      </Section>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Food & Nutrition</h1>
      
      <div className="space-y-8">
        {/* Simple Test */}
        <div className="bg-blue-100 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">🔧 Debug Test</h2>
          <p className="mb-4">If you can see this, the page is loading correctly!</p>
          <button 
            onClick={() => alert('Button works!')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Button
          </button>
        </div>
        
        {/* Test Custom Food Component */}
        <TestCustomFood />
      </div>
    </div>
  );
};

export default Food;

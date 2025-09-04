import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MealBuilder from '../components/meal/MealBuilder';
import DailyMealKPIs from '../components/meal/DailyMealKPIs';
import { Section, Header, Banner } from '../components/ui';

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
    <Section>
      <Header level={1}>Food & Nutrition</Header>
      <p className="text-text-secondary mb-6">
        Search for foods, analyze nutrition, and build balanced meals with comprehensive analysis.
      </p>
      
      {/* Step 1: Meal Builder */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Step 1: Build Your Meal</h2>
        <p className="text-sm text-text-secondary mb-4">
          Search for food items, adjust portions, and save your meal.
        </p>
        <MealBuilder onMealSaved={triggerMealRefresh} />
      </div>
      
      {/* Step 2: Today's Meals */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Step 2: Today's Meals</h2>
        <p className="text-sm text-text-secondary mb-4">
          View your logged meals with detailed nutrient analysis and health effects.
        </p>
        <DailyMealKPIs refreshTrigger={refreshTrigger} />
      </div>
    </Section>
  );
};

export default Food;

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
      
      <div className="space-y-8">
        <MealBuilder onMealSaved={triggerMealRefresh} />
        <DailyMealKPIs refreshTrigger={refreshTrigger} />
      </div>
    </Section>
  );
};

export default Food;

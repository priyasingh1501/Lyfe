import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import MealBuilder from '../components/meal/MealBuilder';
import { Section, Header, Banner } from '../components/ui';

const Food = () => {
  const { user } = useAuth();

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
      <p className="text-gray-600 mb-6">
        Search for foods, analyze nutrition, and build balanced meals with comprehensive analysis.
      </p>
      <MealBuilder />
    </Section>
  );
};

export default Food;

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import MealBuilder from '../components/meal/MealBuilder';

const Food = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0C0F] text-[#E8EEF2] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FFD200]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0C0F] text-[#E8EEF2] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#FFD200] mb-4">
            Authentication Required
          </h1>
          <p className="text-lg text-[#C9D1D9] mb-6">
            Please log in to access the Food & Meal Builder
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-[#FFD200] text-[#0A0C0F] rounded-lg hover:bg-[#FFB800] transition-colors duration-200 font-semibold"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C0F] text-[#E8EEF2]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-[#FFD200] mb-4">
            Food & Meal Builder
          </h1>
          <p className="text-lg text-[#C9D1D9] max-w-2xl mx-auto">
            Build balanced meals, track nutrition, and get insights into your food choices
          </p>
        </motion.div>

        {/* Meal Builder Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <MealBuilder />
        </motion.div>
      </div>
    </div>
  );
};

export default Food;

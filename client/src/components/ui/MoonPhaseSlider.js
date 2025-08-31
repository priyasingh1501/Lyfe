import React from 'react';
import { motion } from 'framer-motion';

const MoonPhaseSlider = ({ 
  value, 
  onChange, 
  dimension
}) => {
  const phases = [
    { value: 1, label: 'Strong No', phase: '🌑', description: 'New Moon' },
    { value: 2, label: 'No', phase: '🌘', description: 'Waning Crescent' },
    { value: 3, label: 'Maybe', phase: '🌗', description: 'Last Quarter' },
    { value: 4, label: 'Yes', phase: '🌖', description: 'Waning Gibbous' },
    { value: 5, label: 'Strong Yes', phase: '🌕', description: 'Full Moon' }
  ];

  // Map dimension names to questions
  const getDimensionQuestion = (dim) => {
    const questions = {
      presence: "I noticed and enjoyed small moments.",
      emotionAwareness: "I recognized my feelings before reacting.",
      intentionality: "My actions matched my values/goals.",
      attentionQuality: "I gave full attention to tasks/people.",
      compassion: "I was kind to myself and others."
    };
    return questions[dim] || dim;
  };

  const handlePhaseClick = (phaseValue) => {
    onChange(phaseValue);
  };

  return (
    <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-4 mb-4">
      {/* Question and Moon Selectors Side by Side */}
      <div className="flex items-center justify-between gap-6">
        {/* Question */}
        <div className="flex-1">
          <h3 className="text-base font-semibold text-[#E8EEF2] font-oswald tracking-wide leading-relaxed">
            {getDimensionQuestion(dimension)}
          </h3>
        </div>

        {/* Moon Phase Slider */}
        <div className="flex items-center gap-3">
          {phases.map((phase) => (
            <motion.div
              key={phase.value}
              onClick={() => handlePhaseClick(phase.value)}
              className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
                value === phase.value 
                  ? 'scale-110' 
                  : 'hover:scale-105'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`text-3xl mb-1 transition-all duration-300 ${
                value === phase.value 
                  ? 'text-[#FFD200] drop-shadow-lg' 
                  : 'text-[#C9D1D9]'
              }`}>
                {phase.phase}
              </div>
              <div className={`text-xs font-medium text-center transition-colors duration-300 ${
                value === phase.value 
                  ? 'text-[#FFD200]' 
                  : 'text-[#C9D1D9]'
              }`}>
                {phase.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoonPhaseSlider;

import React from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

const MealContext = ({ context, setContext, notes, setNotes }) => {
  const updateContext = (key, value) => {
    setContext(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this meal..."
          rows={3}
          className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none placeholder-[#6B7280] resize-none"
        />
      </div>

      {/* Context options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Post-workout */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="postWorkout"
            checked={context.postWorkout}
            onChange={(e) => updateContext('postWorkout', e.target.checked)}
            className="w-4 h-4 text-[#FFD200] bg-[#0A0C0F] border-[#2A313A] rounded focus:ring-[#FFD200] focus:ring-2"
          />
          <label htmlFor="postWorkout" className="text-sm font-medium text-[#C9D1D9]">
            Post-workout meal
          </label>
        </div>

        {/* Fermented foods */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="fermented"
            checked={context.fermented}
            onChange={(e) => updateContext('fermented', e.target.checked)}
            className="w-4 h-4 text-[#FFD200] bg-[#0A0C0F] border-[#2A313A] rounded focus:ring-[#FFD200] focus:ring-2"
          />
          <label htmlFor="fermented" className="text-sm font-medium text-[#C9D1D9]">
            Contains fermented foods
          </label>
        </div>

        {/* Omega-3 rich */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="omega3Tag"
            checked={context.omega3Tag}
            onChange={(e) => updateContext('omega3Tag', e.target.checked)}
            className="w-4 h-4 text-[#FFD200] bg-[#0A0C0F] border-[#2A313A] rounded focus:ring-[#FFD200] focus:ring-2"
          />
          <label htmlFor="omega3Tag" className="text-sm font-medium text-[#C9D1D9]">
            Omega-3 rich foods
          </label>
        </div>
      </div>

      {/* Numeric inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Body mass */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Body Mass (kg)
          </label>
          <input
            type="number"
            min="30"
            max="200"
            value={context.bodyMassKg}
            onChange={(e) => updateContext('bodyMassKg', parseFloat(e.target.value) || 70)}
            className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
          />
        </div>

        {/* Plant diversity */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Plant Diversity (types)
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={context.plantDiversity}
            onChange={(e) => updateContext('plantDiversity', parseInt(e.target.value) || 3)}
            className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
          />
        </div>

        {/* Added sugar */}
        <div>
          <label className="block text-sm font-medium text-[#C9D1D9] mb-2">
            Added Sugar (g)
          </label>
          <input
            type="number"
            min="0"
            max="50"
            step="0.5"
            value={context.addedSugar}
            onChange={(e) => updateContext('addedSugar', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
          />
        </div>
      </div>

      {/* Context info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-3 bg-[#2A313A] rounded-lg border-l-4 border-[#FFD200]"
      >
        <div className="flex items-start space-x-2">
          <Info className="h-5 w-5 text-[#FFD200] mt-0.5 flex-shrink-0" />
          <div className="text-sm text-[#C9D1D9]">
            <p className="font-medium text-[#E8EEF2] mb-1">Why track meal context?</p>
            <ul className="space-y-1 text-xs">
              <li>• <strong>Post-workout:</strong> Affects protein and carb recommendations</li>
              <li>• <strong>Fermented foods:</strong> Boosts immunity score</li>
              <li>• <strong>Plant diversity:</strong> Improves nutrient variety</li>
              <li>• <strong>Body mass:</strong> Helps calculate optimal portions</li>
              <li>• <strong>Added sugar:</strong> Impacts inflammation risk</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MealContext;

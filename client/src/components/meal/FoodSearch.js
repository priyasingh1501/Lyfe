import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, Info } from 'lucide-react';

const FoodSearch = ({ results, isSearching, hasSearched, onAddFood }) => {
  if (isSearching) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#FFD200]" />
      </div>
    );
  }

  if (hasSearched && results.length === 0) {
    return (
      <div className="text-center py-8 text-[#6B7280]">
        <p className="text-sm text-red-600">No results found. Try a different search term.</p>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="text-center py-8 text-[#6B7280]">
        <p>Search for foods to add to your meal</p>
        <p className="text-sm mt-2">Try: idli, roti, paneer, dal, etc.</p>
      </div>
    );
  }

  const getProvenanceChip = (food) => {
    const provenance = food.provenance || {};
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {/* GI Provenance */}
        {food.gi && (
          <span className="inline-flex items-center px-2 py-1 bg-blue-900/20 text-blue-300 text-xs rounded-full border border-blue-700/30">
            <span className="mr-1">GI: {food.gi}</span>
            <span className="text-blue-400">•</span>
            <span className="ml-1">{provenance.giOrigin || 'unknown'}</span>
          </span>
        )}
        
        {/* FODMAP Provenance */}
        {food.fodmap && food.fodmap !== 'Unknown' && (
          <span className="inline-flex items-center px-2 py-1 bg-purple-900/20 text-purple-300 text-xs rounded-full border border-purple-700/30">
            <span className="mr-1">{food.fodmap}</span>
            <span className="text-purple-400">•</span>
            <span className="ml-1">{provenance.fodmapOrigin || 'unknown'}</span>
          </span>
        )}
        
        {/* NOVA Provenance */}
        {food.novaClass && (
          <span className="inline-flex items-center px-2 py-1 bg-orange-900/20 text-orange-300 text-xs rounded-full border border-orange-700/30">
            <span className="mr-1">NOVA {food.novaClass}</span>
            <span className="text-orange-400">•</span>
            <span className="ml-1">{provenance.novaOrigin || 'unknown'}</span>
          </span>
        )}
        
        {/* Source Info */}
        <span className="inline-flex items-center px-2 py-1 bg-gray-900/20 text-gray-300 text-xs rounded-full border border-gray-700/30">
          <Info className="h-3 w-3 mr-1" />
          {provenance.source || 'unknown'}
        </span>
      </div>
    );
  };

  const getTraditionalUnits = (food) => {
    if (!food.portionUnits || food.portionUnits.length === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        <span className="text-xs text-[#FFD200] font-medium">Click to add:</span>
        {food.portionUnits.map((unit, unitIndex) => (
          <button
            key={`unit-${food._id || food.id || food.barcode || unitIndex}-${unitIndex}`}
            onClick={() => onAddFood(food, unit)}
            className={`inline-flex items-center px-3 py-1 text-xs rounded-full border transition-all duration-200 hover:scale-105 cursor-pointer ${
              unit.isDefault
                ? 'bg-[#FFD200]/20 text-[#FFD200] border-[#FFD200]/50 hover:bg-[#FFD200]/30 hover:shadow-lg'
                : 'bg-[#2A313A] text-[#C9D1D9] border-[#2A313A] hover:bg-[#3A414A] hover:border-[#4A515A] hover:shadow-lg'
            }`}
            title={`Click to add ${unit.description} (${unit.grams}g)`}
          >
            <span className="mr-1">+</span>
            {unit.unit}
            {unit.isDefault && <span className="ml-1 text-[10px]">★</span>}
            <span className="ml-1 text-[10px] opacity-75">({unit.grams}g)</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-[#E8EEF2]">
          Search Results
        </h3>
        <span className="text-sm text-[#6B7280]">
          Showing {results.length} results
        </span>
      </div>
      
      <AnimatePresence>
        {results.map((food, index) => (
          <motion.div
            key={`meal-food-${food._id || food.id || food.barcode || index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
            className="bg-[#0A0C0F] border border-[#2A313A] rounded-lg p-4 hover:border-[#FFD200] transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-[#E8EEF2]">
                    {food.name}
                  </h4>
                  {/* Source indicator */}
                  <span className={`px-2 py-1 text-xs rounded-full border ${
                    food.source === 'IFCT' 
                      ? 'bg-green-900/30 text-green-300 border-green-700/50'
                      : food.source === 'USDA'
                      ? 'bg-blue-900/30 text-blue-300 border-blue-700/50'
                      : food.source === 'OpenFoodFacts'
                      ? 'bg-purple-900/30 text-purple-300 border-purple-700/50'
                      : 'bg-gray-900/30 text-gray-300 border-gray-700/50'
                  }`}>
                    {food.source}
                  </span>
                  {/* Relevance score for external sources */}
                  {food.relevanceScore && food.source !== 'IFCT' && (
                    <span className="px-2 py-1 text-xs rounded-full bg-[#FFD200]/20 text-[#FFD200] border border-[#FFD200]/50">
                      {Math.round(food.relevanceScore * 100)}% match
                    </span>
                  )}
                </div>
                
                                  {/* Default portion info */}
                  <div className="text-sm text-[#C9D1D9]">
                    <span className="text-[#FFD200] font-medium">Default portion:</span> {food.portionGramsDefault || 100}g
                    {food.brand && (
                      <span className="ml-3 text-[#6B7280]">
                        <span className="text-[#FFD200] font-medium">Brand:</span> {food.brand}
                      </span>
                    )}
                  </div>
                
                {/* Tags and badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {food.tags?.map((tag, tagIndex) => (
                    <span
                      key={`tag-${food._id || food.id || food.barcode || index}-${tagIndex}`}
                      className="px-2 py-1 bg-[#2A313A] text-[#C9D1D9] text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  
                  {/* GI Badge */}
                  {food.gi && (
                    <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-full border border-blue-700/50">
                      GI: {food.gi}
                    </span>
                  )}
                  
                  {/* FODMAP Badge */}
                  {food.fodmap && food.fodmap !== 'Unknown' && (
                    <span className={`px-2 py-1 text-xs rounded-full border ${
                      food.fodmap === 'Low' 
                        ? 'bg-green-900/30 text-green-300 border-green-700/50'
                        : food.fodmap === 'Medium'
                        ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50'
                        : 'bg-red-900/30 text-red-300 border-red-700/50'
                    }`}>
                      {food.fodmap}
                    </span>
                  )}
                  
                  {/* NOVA Badge */}
                  {food.novaClass && (
                    <span className={`px-2 py-1 text-xs rounded-full border ${
                      food.novaClass === 1
                        ? 'bg-green-900/30 text-green-300 border-green-700/50'
                        : food.novaClass === 2
                        ? 'bg-blue-900/30 text-blue-300 border-blue-700/50'
                        : food.novaClass === 3
                        ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50'
                        : 'bg-red-900/30 text-red-300 border-red-700/50'
                    }`}>
                      NOVA {food.novaClass}
                    </span>
                  )}
                </div>
                
                {/* Provenance Chips */}
                {getProvenanceChip(food)}
                
                {/* Traditional Units */}
                {getTraditionalUnits(food)}
                
                {/* Default portion - more prominent */}
                <div className="mt-3 text-sm text-[#FFD200] font-medium">
                  Default portion: {food.portionGramsDefault || 100}g
                </div>
              </div>
              
              {/* Add button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAddFood(food)}
                className="ml-4 p-3 bg-[#FFD200] text-[#0A0C0F] rounded-lg hover:bg-[#FFB800] transition-colors duration-200 flex-shrink-0"
                title={`Add ${food.name} to meal`}
              >
                <Plus className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-[#2A313A] rounded-lg">
        <p className="text-xs text-[#6B7280] text-center">
          <span className="text-[#FFD200]">ℹ️</span> GI: approximated; FODMAP: heuristic; 
          NOVA: processing level. This is guidance, not medical diagnosis.
        </p>
      </div>
    </div>
  );
};

export default FoodSearch;

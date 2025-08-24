import React from 'react';
import { motion } from 'framer-motion';

const TimeManagement = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="bg-gray-900 border-2 border-gray-600 rounded-lg p-6 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
        {/* Film grain overlay */}
        <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
        
        {/* Reason Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-blue-500 to-green-500"></div>
        
        <h1 className="text-2xl font-bold text-white mb-4 font-oswald tracking-wide">TIME MISSION</h1>
        <p className="text-gray-300 font-inter">Schedule management and time blocking features coming soon!</p>
      </div>
    </motion.div>
  );
};

export default TimeManagement;

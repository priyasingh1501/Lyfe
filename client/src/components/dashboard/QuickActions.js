import React from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Utensils, 
  BookOpen, 
  Target, 
  Brain, 
  DollarSign,
  Clock,
  Heart
} from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      id: 'add-task',
      label: 'Add Task',
      icon: Plus,
      href: '/goal-aligned-day',
      color: 'bg-[#3CCB7F]',
      hoverColor: 'hover:bg-[#2FB86B]',
      description: 'Quick task creation'
    },
    {
      id: 'log-meal',
      label: 'Log Meal',
      icon: Utensils,
      href: '/food',
      color: 'bg-[#3EA6FF]',
      hoverColor: 'hover:bg-[#2B8CE6]',
      description: 'Track nutrition'
    },
    {
      id: 'journal-entry',
      label: 'Journal',
      icon: BookOpen,
      href: '/journal',
      color: 'bg-[#FFD200]',
      hoverColor: 'hover:bg-[#FFB800]',
      description: 'Capture thoughts'
    },
    {
      id: 'mindfulness',
      label: 'Mindfulness',
      icon: Brain,
      href: '/goal-aligned-day',
      color: 'bg-[#9B59B6]',
      hoverColor: 'hover:bg-[#8E44AD]',
      description: 'Check-in'
    },
    {
      id: 'add-expense',
      label: 'Add Expense',
      icon: DollarSign,
      href: '/finance',
      color: 'bg-[#E74C3C]',
      hoverColor: 'hover:bg-[#C0392B]',
      description: 'Track spending'
    },
    {
      id: 'set-goal',
      label: 'Set Goal',
      icon: Target,
      href: '/goal-aligned-day',
      color: 'bg-[#F39C12]',
      hoverColor: 'hover:bg-[#E67E22]',
      description: 'Create objective'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-4 lg:p-6 relative overflow-hidden"
      style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
    >
      {/* Film grain overlay */}
      <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
      
      {/* Reason Strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD200] via-[#3EA6FF] to-[#3CCB7F]"></div>
      
      {/* Header */}
      <div className="mb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#FFD200] bg-opacity-20 rounded-lg">
            <Plus className="h-5 w-5 text-[#FFD200]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#E8EEF2] font-oswald tracking-wide">QUICK ACTIONS</h3>
            <p className="text-sm text-[#C9D1D9] font-inter">Fast access to common tasks</p>
          </div>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <motion.a
              key={action.id}
              href={action.href}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${action.color} ${action.hoverColor} text-[#0A0C0F] rounded-lg p-3 transition-all duration-200 group cursor-pointer border-2 border-transparent hover:border-[#FFD200]/30`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-2 bg-[#0A0C0F] bg-opacity-20 rounded-lg group-hover:bg-opacity-30 transition-all duration-200">
                  <IconComponent className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold font-oswald tracking-wide">
                    {action.label}
                  </div>
                  <div className="text-xs opacity-80 font-inter">
                    {action.description}
                  </div>
                </div>
              </div>
            </motion.a>
          );
        })}
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-6 h-6 bg-[#FFD200]"></div>
      <div className="absolute bottom-0 left-0 w-6 h-6 bg-[#3EA6FF]"></div>
    </motion.div>
  );
};

export default QuickActions;

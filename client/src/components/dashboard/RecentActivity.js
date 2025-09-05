import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Utensils, 
  BookOpen, 
  DollarSign, 
  Target, 
  Brain,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import axios from 'axios';

const RecentActivity = () => {
  const { token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Fetch data from multiple endpoints
      const [tasksRes, mealsRes, journalRes, expensesRes, mindfulnessRes] = await Promise.all([
        axios.get(buildApiUrl(`/api/tasks?startDate=${weekAgo}&endDate=${today}&limit=5`), {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        axios.get(buildApiUrl(`/api/meals?startDate=${weekAgo}&endDate=${today}&limit=5`), {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { meals: [] } })),
        axios.get(buildApiUrl(`/api/journal?startDate=${weekAgo}&endDate=${today}&limit=5`), {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        axios.get(buildApiUrl(`/api/finance/expenses?startDate=${weekAgo}&endDate=${today}&limit=5`), {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        axios.get(buildApiUrl(`/api/mindfulness/checkins?startDate=${weekAgo}&endDate=${today}&limit=5`), {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);

      const allActivities = [];

      // Process tasks
      (tasksRes.data || []).forEach(task => {
        allActivities.push({
          id: `task-${task._id}`,
          type: 'task',
          title: task.title || 'Task completed',
          description: task.description || 'Task completed',
          timestamp: task.completedAt || task.createdAt,
          icon: CheckCircle,
          color: 'text-[#3CCB7F]',
          bgColor: 'bg-[#3CCB7F]'
        });
      });

      // Process meals
      (mealsRes.data.meals || []).forEach(meal => {
        allActivities.push({
          id: `meal-${meal._id}`,
          type: 'meal',
          title: 'Meal logged',
          description: `${meal.items?.length || 0} items logged`,
          timestamp: meal.ts || meal.createdAt,
          icon: Utensils,
          color: 'text-[#3EA6FF]',
          bgColor: 'bg-[#3EA6FF]'
        });
      });

      // Process journal entries
      (journalRes.data || []).forEach(entry => {
        allActivities.push({
          id: `journal-${entry._id}`,
          type: 'journal',
          title: entry.title || 'Journal entry',
          description: entry.type || 'Daily reflection',
          timestamp: entry.createdAt,
          icon: BookOpen,
          color: 'text-[#FFD200]',
          bgColor: 'bg-[#FFD200]'
        });
      });

      // Process expenses
      (expensesRes.data || []).forEach(expense => {
        allActivities.push({
          id: `expense-${expense._id}`,
          type: 'expense',
          title: 'Expense added',
          description: `${expense.description || 'Expense'} - ₹${expense.amount || 0}`,
          timestamp: expense.date || expense.createdAt,
          icon: DollarSign,
          color: 'text-[#E74C3C]',
          bgColor: 'bg-[#E74C3C]'
        });
      });

      // Process mindfulness check-ins
      (mindfulnessRes.data || []).forEach(checkin => {
        allActivities.push({
          id: `mindfulness-${checkin._id}`,
          type: 'mindfulness',
          title: 'Mindfulness check-in',
          description: `Score: ${checkin.overallScore || 0}/10`,
          timestamp: checkin.date || checkin.createdAt,
          icon: Brain,
          color: 'text-[#9B59B6]',
          bgColor: 'bg-[#9B59B6]'
        });
      });

      // Sort by timestamp and take the most recent 8
      allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setActivities(allActivities.slice(0, 8));

    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now - activityTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return activityTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-4 lg:p-6 relative overflow-hidden"
        style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-[#2A313A] rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-[#2A313A] rounded"></div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

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
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3CCB7F] via-[#3EA6FF] to-[#FFD200]"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#3CCB7F] bg-opacity-20 rounded-lg">
            <Clock className="h-5 w-5 text-[#3CCB7F]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#E8EEF2] font-oswald tracking-wide">RECENT ACTIVITY</h3>
            <p className="text-sm text-[#C9D1D9] font-inter">Your latest actions</p>
          </div>
        </div>
        <button
          onClick={fetchRecentActivity}
          className="text-sm text-[#FFD200] hover:text-[#FFD200]/80 font-medium flex items-center font-oswald tracking-wide"
        >
          REFRESH
        </button>
      </div>

      <div className="space-y-3 relative z-10">
        {activities.length > 0 ? (
          activities.map((activity, index) => {
            const IconComponent = activity.icon;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 p-3 bg-[#0A0C0F] rounded-lg border border-[#2A313A] hover:border-[#FFD200]/30 transition-all duration-200"
              >
                <div className={`p-2 rounded-lg ${activity.bgColor} bg-opacity-20`}>
                  <IconComponent className={`h-4 w-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#E8EEF2] truncate">
                    {activity.title}
                  </div>
                  <div className="text-xs text-[#C9D1D9] truncate">
                    {activity.description}
                  </div>
                </div>
                <div className="text-xs text-[#C9D1D9] whitespace-nowrap">
                  {formatTimestamp(activity.timestamp)}
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-[#C9D1D9] mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-[#E8EEF2] mb-2">No Recent Activity</h4>
            <p className="text-sm text-[#C9D1D9] mb-4">Start using the app to see your activity here</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <a 
                href="/goal-aligned-day" 
                className="text-xs text-[#3CCB7F] hover:text-[#3CCB7F]/80 font-oswald tracking-wide"
              >
                ADD TASK
              </a>
              <span className="text-[#C9D1D9]">•</span>
              <a 
                href="/food" 
                className="text-xs text-[#3EA6FF] hover:text-[#3EA6FF]/80 font-oswald tracking-wide"
              >
                LOG MEAL
              </a>
              <span className="text-[#C9D1D9]">•</span>
              <a 
                href="/journal" 
                className="text-xs text-[#FFD200] hover:text-[#FFD200]/80 font-oswald tracking-wide"
              >
                JOURNAL
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-6 h-6 bg-[#3CCB7F]"></div>
      <div className="absolute bottom-0 left-0 w-6 h-6 bg-[#3EA6FF]"></div>
    </motion.div>
  );
};

export default RecentActivity;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Target, 
  Heart, 
  Bell, 
  AlertCircle,
  CheckCircle,
  Star
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import axios from 'axios';

const UpcomingReminders = () => {
  const { token } = useAuth();
  const [upcoming, setUpcoming] = useState({
    tasks: [],
    goals: [],
    habits: [],
    reminders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingData();
  }, []);

  const fetchUpcomingData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Fetch upcoming tasks, goals, and habits
      const [tasksRes, goalsRes, habitsRes] = await Promise.all([
        axios.get(buildApiUrl(`/api/tasks?startDate=${today}&endDate=${nextWeek}&status=pending`), {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        axios.get(buildApiUrl('/api/goals?status=active'), {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        axios.get(buildApiUrl('/api/habits?status=active'), {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);

      // Process tasks
      const upcomingTasks = (tasksRes.data || [])
        .filter(task => {
          const dueDate = new Date(task.dueDate || task.createdAt);
          const today = new Date();
          const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 7;
        })
        .map(task => ({
          id: `task-${task._id}`,
          type: 'task',
          title: task.title || 'Untitled Task',
          description: task.description || 'No description',
          dueDate: task.dueDate || task.createdAt,
          priority: task.priority || 'medium',
          icon: task.priority === 'high' ? AlertCircle : Clock,
          color: task.priority === 'high' ? 'text-[#D64545]' : 'text-[#3EA6FF]',
          bgColor: task.priority === 'high' ? 'bg-[#D64545]' : 'bg-[#3EA6FF]'
        }));

      // Process goals with upcoming deadlines
      const upcomingGoals = (goalsRes.data || [])
        .filter(goal => {
          const targetDate = new Date(goal.targetDate);
          const today = new Date();
          const diffDays = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 30;
        })
        .map(goal => ({
          id: `goal-${goal._id}`,
          type: 'goal',
          title: goal.title || 'Untitled Goal',
          description: goal.category || 'General',
          dueDate: goal.targetDate,
          priority: 'medium',
          icon: Target,
          color: 'text-[#3CCB7F]',
          bgColor: 'bg-[#3CCB7F]'
        }));

      // Process habits with reminders
      const upcomingHabits = (habitsRes.data || [])
        .filter(habit => habit.reminderTime)
        .map(habit => ({
          id: `habit-${habit._id}`,
          type: 'habit',
          title: habit.name || 'Untitled Habit',
          description: `Reminder at ${habit.reminderTime}`,
          dueDate: new Date().toISOString().split('T')[0] + 'T' + habit.reminderTime,
          priority: 'low',
          icon: Bell,
          color: 'text-[#FFD200]',
          bgColor: 'bg-[#FFD200]'
        }));

      // Create mock reminders for birthdays, anniversaries, etc.
      const mockReminders = [
        {
          id: 'reminder-1',
          type: 'reminder',
          title: 'Weekly Review',
          description: 'Review your goals and habits',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'medium',
          icon: Star,
          color: 'text-[#9B59B6]',
          bgColor: 'bg-[#9B59B6]'
        }
      ];

      setUpcoming({
        tasks: upcomingTasks.slice(0, 3),
        goals: upcomingGoals.slice(0, 2),
        habits: upcomingHabits.slice(0, 2),
        reminders: mockReminders
      });

    } catch (error) {
      console.error('Error fetching upcoming data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDueDate = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-[#D64545]';
      case 'medium': return 'border-[#FFD200]';
      default: return 'border-[#3EA6FF]';
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

  const allUpcoming = [
    ...upcoming.tasks,
    ...upcoming.goals,
    ...upcoming.habits,
    ...upcoming.reminders
  ].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

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
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#FFD200] bg-opacity-20 rounded-lg">
            <Calendar className="h-5 w-5 text-[#FFD200]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#E8EEF2] font-oswald tracking-wide">UPCOMING & REMINDERS</h3>
            <p className="text-sm text-[#C9D1D9] font-inter">What's next on your agenda</p>
          </div>
        </div>
        <button
          onClick={fetchUpcomingData}
          className="text-sm text-[#FFD200] hover:text-[#FFD200]/80 font-medium flex items-center font-oswald tracking-wide"
        >
          REFRESH
        </button>
      </div>

      <div className="space-y-3 relative z-10">
        {allUpcoming.length > 0 ? (
          allUpcoming.slice(0, 6).map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-3 p-3 bg-[#0A0C0F] rounded-lg border-l-4 ${getPriorityColor(item.priority)} hover:bg-[#1A1F2A] transition-all duration-200`}
              >
                <div className={`p-2 rounded-lg ${item.bgColor} bg-opacity-20`}>
                  <IconComponent className={`h-4 w-4 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#E8EEF2] truncate">
                    {item.title}
                  </div>
                  <div className="text-xs text-[#C9D1D9] truncate">
                    {item.description}
                  </div>
                </div>
                <div className="text-xs text-[#C9D1D9] whitespace-nowrap">
                  {formatDueDate(item.dueDate)}
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-[#C9D1D9] mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-[#E8EEF2] mb-2">Nothing Upcoming</h4>
            <p className="text-sm text-[#C9D1D9] mb-4">Your schedule is clear for now</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <a 
                href="/goal-aligned-day" 
                className="text-xs text-[#3CCB7F] hover:text-[#3CCB7F]/80 font-oswald tracking-wide"
              >
                ADD TASK
              </a>
              <span className="text-[#C9D1D9]">•</span>
              <a 
                href="/goal-aligned-day" 
                className="text-xs text-[#3EA6FF] hover:text-[#3EA6FF]/80 font-oswald tracking-wide"
              >
                SET GOAL
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-6 h-6 bg-[#FFD200]"></div>
      <div className="absolute bottom-0 left-0 w-6 h-6 bg-[#3EA6FF]"></div>
    </motion.div>
  );
};

export default UpcomingReminders;

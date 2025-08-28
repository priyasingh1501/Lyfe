import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { 
  Plus, 
  Target, 
  Edit3,
  Flame,
  Repeat
} from 'lucide-react';
import axios from 'axios';
import { buildApiUrl } from '../config';

const GoalAlignedDay = () => {
  const [goals, setGoals] = useState([]);
  const [todayMetrics, setTodayMetrics] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [activeTab, setActiveTab] = useState('day');
  
  // State to track which hours are marked as mindful
  const [mindfulHours, setMindfulHours] = useState(new Set());

  const [goalFormData, setGoalFormData] = useState({
    name: '',
    color: '#10B981',
    description: '',
    category: 'other',
    targetHours: 1,
    priority: 'medium'
  });

  const [taskFormData, setTaskFormData] = useState({
    title: '',
    duration: '',
    goalIds: []
  });

  const [habitFormData, setHabitFormData] = useState({
    title: '',
    time: '',
    repeatFrequency: 'daily'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [goalsRes, metricsRes, tasksRes] = await Promise.all([
        axios.get(buildApiUrl('/api/goals'), {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(buildApiUrl('/api/goals/today'), {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(buildApiUrl('/api/goals/streak'), {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(buildApiUrl('/api/tasks'), {
          headers: { Authorization: `Bearer ${token}` },
          params: { 
            date: new Date().toISOString().split('T')[0]
          }
        })
      ]);

      setGoals(goalsRes.data);
      setTodayMetrics(metricsRes.data);

      setTodayTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingGoal) {
        await axios.put(buildApiUrl(`/api/goals/${editingGoal._id}`), goalFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(buildApiUrl('/api/goals'), goalFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setShowGoalForm(false);
      setEditingGoal(null);
      setGoalFormData({
        name: '',
        color: '#10B981',
        description: '',
        category: 'other',
        targetHours: 1,
        priority: 'medium'
      });
      
      await fetchData();
    } catch (error) {
      console.error('Error saving goal:', error);
      alert(`Error saving goal: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      // Convert hours to minutes for storage
      const durationInMinutes = Math.round(parseFloat(taskFormData.duration) * 60);
      
      const taskData = {
        title: taskFormData.title,
        estimatedDuration: durationInMinutes,
        goalIds: taskFormData.goalIds,
        status: 'completed',
        completedAt: new Date()
      };
      
      await axios.post(buildApiUrl('/api/tasks'), taskData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowTaskForm(false);
      setTaskFormData({
        title: '',
        duration: '',
        goalIds: []
      });
      
      // Refresh data to recalculate metrics
      await fetchData();
    } catch (error) {
      console.error('Error creating task:', error);
      alert(`Error creating task: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleHabitSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      // Convert hours to minutes
      const durationInMinutes = Math.round(parseFloat(habitFormData.time) * 60);

      const habitData = {
        title: habitFormData.title,
        estimatedDuration: durationInMinutes,
        isHabit: true,
        habitCadence: habitFormData.repeatFrequency,
        status: 'pending'
      };

      await axios.post(buildApiUrl('/api/tasks'), habitData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowHabitForm(false);
      setHabitFormData({
        title: '',
        time: '',
        repeatFrequency: 'daily'
      });
      
      // Refresh data to recalculate metrics
      await fetchData();
    } catch (error) {
      console.error('Error creating habit:', error);
      alert(`Error creating habit: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleQuickCompleteHabit = async (habit) => {
    try {
      const token = localStorage.getItem('token');
      
      // Mark the habit as completed for today
      const updatedHabit = {
        ...habit,
        status: 'completed',
        completedAt: new Date()
      };
      
      await axios.put(buildApiUrl(`/api/tasks/${habit._id}`), updatedHabit, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh data to update the UI
      await fetchData();
      
      // Show success message
      alert(`Habit "${habit.title}" marked as complete!`);
    } catch (error) {
      console.error('Error completing habit:', error);
      alert(`Error completing habit: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setGoalFormData({
      name: goal.name,
      color: goal.color,
      description: goal.description || '',
      category: goal.category,
      targetHours: goal.targetHours,
      priority: goal.priority
    });
    setShowGoalForm(true);
  };



  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };



  const toggleHourMindfulness = (hour) => {
    setMindfulHours(prev => {
      const newSet = new Set(prev);
      if (newSet.has(hour)) {
        newSet.delete(hour);
      } else {
        newSet.add(hour);
      }
      return newSet;
    });
  };



  // Calculate current streak based on daily KPI logging
  const calculateCurrentStreak = () => {
    // Ensure todayTasks is an array and has data
    if (!Array.isArray(todayTasks) || todayTasks.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    
    // Check consecutive days backwards from today
    for (let i = 0; i < 365; i++) { // Check up to 1 year back
      const checkDate = new Date(currentDate);
      checkDate.setDate(currentDate.getDate() - i);
      const dateString = checkDate.toISOString().split('T')[0];
      
      // Check if there are any tasks for this date
      const hasTasksForDate = todayTasks.some(task => {
        if (!task || !task.completedAt) return false;
        const taskDate = new Date(task.completedAt).toISOString().split('T')[0];
        return taskDate === dateString;
      });
      
      if (hasTasksForDate) {
        streak++;
      } else {
        break; // Streak broken
      }
    }
    
    return streak;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FFD200]"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-full overflow-x-auto space-y-6"
    >
      {/* 1. MISSION CONTROL HEADER */}
      <div className="bg-gray-900 border-2 border-gray-600 rounded-lg p-6 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
        {/* Film grain overlay */}
        <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
        
        {/* Reason Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-blue-500 to-green-500"></div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-bold text-white font-oswald tracking-wide">MISSION CONTROL</h1>
            </div>
            
            {/* Tabs */}
            <div className="flex space-x-0.5 bg-[#0A0C0F] p-0.5 rounded-md w-fit border border-[#2A313A]">
              {['day', 'month', 'year'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-1 px-2 rounded-sm text-xs font-medium transition-colors font-oswald tracking-wide ${
                    activeTab === tab
                      ? 'bg-[#FFD200] text-[#0A0C0F] shadow-sm'
                      : 'text-[#C9D1D9] hover:text-[#FFD200]'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Streak Display - Moved to the right */}
          <div className="flex items-center gap-2 bg-[#0A0C0F] border-2 border-[#FFD200] rounded-lg px-3 py-1.5">
            <Flame className="text-[#FFD200]" size={16} />
            <div className="text-center">
              <div className="text-xs text-[#C9D1D9] font-oswald tracking-wide">STREAK</div>
              <div className="text-sm font-bold text-[#FFD200] font-mono">
                {!loading && Array.isArray(todayTasks) ? calculateCurrentStreak() : 0} days
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MISSION TIMELINE */}
      <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
        {/* Film grain overlay */}
        <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
        
        {/* Reason Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3CCB7F] via-[#3EA6FF] to-[#FFD200]"></div>
        
        <h3 className="text-lg font-semibold text-[#E8EEF2] mb-4 font-oswald tracking-wide">MISSION TIMELINE</h3>
        <p className="text-sm text-[#C9D1D9] mb-4 text-center font-inter">
          Each hour shows one status: Mindful, Not Mindful, or No activity
        </p>
        
        {/* Day Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-[#0A0C0F] border-2 border-[#FFD200] rounded-lg">
            <p className="text-lg font-bold text-[#FFD200] font-mono">
              {mindfulHours ? mindfulHours.size : 0}
            </p>
            <p className="text-xs text-[#FFD200]/80 font-oswald tracking-wide">MINDFUL HOURS</p>
          </div>
          <div className="text-center p-3 bg-[#0A0C0F] border-2 border-[#3EA6FF] rounded-lg">
            <p className="text-lg font-bold text-[#3EA6FF] font-mono">
              {24 - (mindfulHours ? mindfulHours.size : 0)}
            </p>
            <p className="text-xs text-[#3EA6FF]/80 font-oswald tracking-wide">NOT MINDFUL HOURS</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Instructions */}
          <div className="text-center mb-4">
            <p className="text-sm text-[#C9D1D9] font-inter">
              💡 Click on any hour rectangle to toggle between mindful (yellow) and not mindful (blue)
            </p>
          </div>
          
          {/* 24-Hour Strip */}
          <div className="flex flex-wrap justify-center gap-1 max-w-4xl mx-auto">
            {Array.from({ length: 24 }, (_, hour) => {
              const hourStart = new Date();
              hourStart.setHours(hour, 0, 0, 0);
              const hourEnd = new Date(hourStart);
              hourEnd.setHours(hour + 1, 0, 0, 0);
              

              
              // Check if this hour is marked as mindful
              const isMindful = mindfulHours.has(hour);
              
              let color = 'bg-[#3EA6FF]'; // Default: Not mindful (blue)
              let status = 'Not Mindful';
              
              if (isMindful) {
                color = 'bg-[#FFD200]'; // Mindful (yellow)
                status = 'Mindful';
              }
              
              // Format hour for display
              const displayHour = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
              
                                                  // Get tasks for this hour
                  const hourTasks = Array.isArray(todayTasks) ? todayTasks.filter(task => {
                    if (!task.completedAt) return false;
                    const taskTime = new Date(task.completedAt);
                    return taskTime >= hourStart && taskTime < hourEnd;
                  }) : [];
              

              
              return (
                <div key={hour} className="flex flex-col items-center group relative">
                  <div 
                    onClick={() => toggleHourMindfulness(hour)}
                    className={`w-5 h-6 sm:w-6 sm:h-8 rounded-sm ${color} transition-all duration-300 hover:scale-125 cursor-pointer shadow-sm`}
                  />
                  <span className="text-xs text-[#C9D1D9] mt-1 group-hover:text-[#FFD200] transition-colors font-mono">
                    {hour === 0 ? '12' : hour > 12 ? hour - 12 : hour}
                  </span>
                  
                  {/* Custom Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#0A0C0F] border-2 border-[#2A313A] rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 max-w-xs whitespace-pre-line text-left">
                    <div className="text-[#E8EEF2] text-xs font-inter">
                      <div className="font-oswald tracking-wide text-[#FFD200] mb-1">{displayHour}</div>
                      <div className="text-[#C9D1D9] mb-2">{status}</div>
                      
                      {hourTasks.length > 0 && (
                        <div>
                          <div className="text-[#3CCB7F] font-oswald tracking-wide mb-1">TASKS:</div>
                          {hourTasks.map((task, index) => (
                            <div key={index} className="mb-2 p-2 bg-[#11151A] rounded border border-[#2A313A]">
                              <div className="font-medium text-[#E8EEF2] mb-1">{task.title}</div>
                              <div className="text-[#C9D1D9] text-xs space-y-1">
                                <div>Time: {new Date(task.completedAt).toLocaleTimeString('en-US', { 
                                  hour: 'numeric', 
                                  minute: '2-digit',
                                  hour12: true 
                                })}</div>
                                <div>Goal: {task.goalIds && task.goalIds.length > 0 
                                  ? task.goalIds.map(goalId => {
                                      const goal = goals.find(g => g._id === goalId);
                                      return goal ? goal.name : 'Unknown Goal';
                                    }).join(', ')
                                  : 'No Goal'
                                }</div>
                                <div className={task.mindfulRating >= 3 ? 'text-[#3CCB7F]' : 'text-[#D64545]'}>
                                  {task.mindfulRating >= 3 ? '✓ Mindful' : '✗ Not Mindful'}
                                </div>
                                {task.isHabit && (
                                  <div className="text-[#FFD200]">Habit: {task.habitCadence}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#0A0C0F]"></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 justify-center">
              <div className="w-3 h-3 rounded-sm bg-[#FFD200]"></div>
              <span className="text-[#C9D1D9] text-xs sm:text-sm font-inter">Mindful</span>
            </div>
            <div className="flex items-center space-x-2 justify-center">
              <div className="w-3 h-3 rounded-sm bg-[#3EA6FF]"></div>
              <span className="text-[#C9D1D9] text-xs sm:text-sm font-inter">Not Mindful</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DAY GOAL CARD */}
      <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
            {/* Film grain overlay */}
            <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
            
            {/* Reason Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD200] via-[#3EA6FF] to-[#3CCB7F]"></div>
            
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#E8EEF2] font-oswald tracking-wide">DAY GOAL</h2>
              <button 
                onClick={() => setShowGoalForm(true)}
                className="text-xs bg-[#3CCB7F] text-[#0A0C0F] px-3 py-1.5 rounded hover:bg-[#2FB86B] transition-colors font-oswald tracking-wide"
              >
                SET GOAL
              </button>
            </div>
            
            {/* Daily Goals Summary */}
            {goals.length > 0 && (
              <div className="mb-6 p-4 bg-[#0A0C0F] border border-[#2A313A] rounded-lg">
                <h4 className="text-sm font-semibold text-[#E8EEF2] mb-3 font-oswald tracking-wide text-center">DAILY GOALS SUMMARY</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-[#3CCB7F] font-mono">
                      {goals.reduce((total, goal) => {
                        const completedHours = Array.isArray(todayTasks) ? todayTasks
                          .filter(task => 
                            task.goalIds && 
                            task.goalIds.includes(goal._id) && 
                            task.completedAt
                          )
                          .reduce((total, task) => {
                            const duration = task.estimatedDuration ? 
                              parseFloat(task.estimatedDuration) / 60 : 0;
                            return total + duration;
                          }, 0) : 0;
                        return total + completedHours;
                      }, 0).toFixed(1)}h
                    </p>
                    <p className="text-xs text-[#C9D1D9] font-inter">Total Hours Completed</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#FFD200] font-mono">
                      {goals.reduce((total, goal) => total + (goal.targetHours || 0), 0).toFixed(1)}h
                    </p>
                    <p className="text-xs text-[#C9D1D9] font-inter">Total Target Hours</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#3EA6FF] font-mono">
                      {goals.length}
                    </p>
                    <p className="text-xs text-[#C9D1D9] font-inter">Active Goals</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-4">
              {goals.slice(0, 3).map((goal) => {
                const goalHours = goal.targetHours || 0;
                const completedHours = Array.isArray(todayTasks) ? todayTasks
                  .filter(task => 
                    task.goalIds && 
                    task.goalIds.includes(goal._id) && 
                    task.completedAt
                  )
                  .reduce((total, task) => {
                    const duration = task.estimatedDuration ? 
                      parseFloat(task.estimatedDuration) / 60 : 0; // Convert minutes to hours
                    return total + duration;
                  }, 0) : 0;
                
                const percentage = goalHours > 0 ? Math.min((completedHours / goalHours) * 100, 100) : 0;
                
                return (
                  <div key={goal._id} className="p-4 bg-gradient-to-br from-[#0A0C0F] to-[#11151A] border-2 border-[#2A313A] rounded-xl group relative overflow-hidden shadow-lg hover:shadow-xl hover:border-[#3EA6FF]/30 transition-all duration-300">
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
                    
                    {/* Header with goal name and indicator */}
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: goal.color }}></div>
                        <span className="text-base font-semibold text-[#E8EEF2] font-oswald tracking-wide">{goal.name}</span>
                      </div>
                      
                      {/* Action buttons - visible on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                        <button
                          onClick={() => {
                            setTaskFormData({
                              ...taskFormData,
                              goalIds: [goal._id]
                            });
                            setShowTaskForm(true);
                          }}
                          className="p-2 bg-[#3CCB7F]/20 backdrop-blur-sm text-[#3CCB7F] rounded-lg hover:bg-[#3CCB7F] hover:text-[#0A0C0F] transition-all duration-200 shadow-lg"
                          title="Add task for this goal"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => handleEditGoal(goal)}
                          className="p-2 bg-[#2A313A]/80 backdrop-blur-sm text-[#C9D1D9] rounded-lg hover:bg-[#3A414A] hover:text-[#E8EEF2] transition-all duration-200 shadow-lg"
                          title="Edit goal"
                        >
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Hours display with better typography */}
                    <div className="text-center mb-4 relative z-10">
                      <div className="mb-2">
                        <p className="text-2xl font-bold text-[#FFD200] font-mono mb-1">
                          {completedHours.toFixed(1)}h
                        </p>
                        <p className="text-sm text-[#C9D1D9] font-inter">
                          of {goalHours}h target
                        </p>
                        <p className="text-xs text-[#C9D1D9] font-mono mt-1">
                          {percentage.toFixed(0)}% complete
                        </p>
                      </div>
                    </div>
                    
                    {/* Enhanced Circular Progress Indicator */}
                    <div className="flex justify-center mb-4 relative z-10">
                      <div className="relative w-20 h-20">
                        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                          {/* Background circle with subtle glow */}
                          <defs>
                            <filter id={`glow-${goal._id}`}>
                              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                              <feMerge> 
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                              </feMerge>
                            </filter>
                          </defs>
                          
                          {/* Background circle */}
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#2A313A"
                            strokeWidth="2.5"
                          />
                          {/* Progress circle with glow effect */}
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={goal.color}
                            strokeWidth="2.5"
                            strokeDasharray={`${percentage * 1.01}, 100`}
                            strokeLinecap="round"
                            className="transition-all duration-500 ease-out"
                            filter={`url(#glow-${goal._id})`}
                          />
                        </svg>
                        {/* Percentage text in center */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-[#E8EEF2] font-mono">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Status and Remaining Amount */}
                    <div className="space-y-3 relative z-10">
                      {/* Status Badge */}
                      <div className="text-center">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold font-oswald tracking-wide shadow-lg ${
                          percentage >= 100 
                            ? 'bg-gradient-to-r from-[#3CCB7F] to-[#2FB86B] text-white' 
                            : 'bg-gradient-to-r from-[#2A313A] to-[#3A414A] text-[#C9D1D9]'
                        }`}>
                          {percentage >= 100 
                            ? '🎯 GOAL ACHIEVED' 
                            : '⏳ IN PROGRESS'
                          }
                        </span>
                      </div>
                      
                      {/* Remaining Hours */}
                      {percentage < 100 && (
                        <div className="text-center">
                          <div className="bg-[#2A313A]/50 backdrop-blur-sm rounded-lg p-2 border border-[#3EA6FF]/20">
                            <p className="text-xs text-[#C9D1D9] font-inter mb-1">Remaining</p>
                            <p className="text-sm font-semibold text-[#3CCB7F] font-mono">
                              {(goalHours - completedHours).toFixed(1)}h
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Add Task Button */}
                      <div className="text-center mt-3">
                        <button
                          onClick={() => {
                            setTaskFormData({
                              ...taskFormData,
                              goalIds: [goal._id]
                            });
                            setShowTaskForm(true);
                          }}
                          className="w-full py-2 px-3 bg-[#3CCB7F] text-[#0A0C0F] rounded-lg hover:bg-[#2FB86B] transition-colors duration-200 font-oswald tracking-wide text-sm shadow-lg"
                        >
                          + Add Task
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {goals.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#2A313A] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Target className="text-[#C9D1D9]" size={24} />
                </div>
                <h4 className="text-md font-semibold text-[#E8EEF2] mb-2 font-oswald tracking-wide">NO GOALS SET YET</h4>
                <p className="text-[#C9D1D9] font-inter text-sm">Set your first goal to start tracking your daily progress</p>
              </div>
            )}
            

          </div>



      {/* Tab Content */}
      {activeTab === 'day' && (
        <>

          






          {/* Daily Habits Overview */}
          <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 relative overflow-hidden mb-8" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
            {/* Film grain overlay */}
            <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
            
            {/* Reason Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD200] to-[#3CCB7F]"></div>
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#E8EEF2] font-oswald tracking-wide">DAILY HABITS</h3>
              <div className="flex items-center space-x-4">
                <div className="text-xs text-[#C9D1D9] font-inter">
                  {Array.isArray(todayTasks) ? todayTasks.filter(task => task.isHabit).length : 0} habits today
                </div>
                <button
                  onClick={() => setShowHabitForm(true)}
                  className="bg-[#3CCB7F] text-[#0A0C0F] px-3 py-2 rounded-lg hover:bg-[#2FB86B] transition-colors text-sm font-medium font-oswald tracking-wide"
                >
                  ADD HABIT
                </button>
              </div>
            </div>
            
            {Array.isArray(todayTasks) && todayTasks.filter(task => task.isHabit).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayTasks.filter(task => task.isHabit).map((habit) => (
                  <div key={habit._id} className="bg-[#0A0C0F] border-2 border-[#2A313A] rounded-lg p-4 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
                    <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
                    
                    {/* Habit Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Repeat className="text-[#FFD200]" size={16} />
                        <h5 className="font-semibold text-[#E8EEF2] font-oswald tracking-wide">{habit.title}</h5>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-[#C9D1D9] font-inter">{habit.habitCadence || 'daily'}</span>
                        <div className={`w-3 h-3 rounded-full ${habit.completedAt ? 'bg-[#3CCB7F]' : 'bg-[#2A313A] border border-[#3CCB7F]'}`}></div>
                      </div>
                    </div>
                    
                    {/* Weekly Progress */}
                    <div className="mb-4">
                      <p className="text-xs text-[#3CCB7F] mb-2 font-oswald tracking-wide">THIS WEEK:</p>
                      <div className="flex space-x-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                          const isToday = index === new Date().getDay();
                          const isCompleted = habit.completedAt && 
                            new Date(habit.completedAt).toDateString() === new Date().toDateString();
                          
                          return (
                            <div
                              key={day}
                              className={`w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center font-mono ${
                                isToday && isCompleted
                                  ? 'bg-[#3CCB7F] text-[#0A0C0F]'
                                  : isToday
                                  ? 'bg-[#2A313A] text-[#3CCB7F] border-2 border-[#3CCB7F]'
                                  : isCompleted
                                  ? 'bg-[#2A313A] text-[#3CCB7F]'
                                  : 'bg-[#2A313A] text-[#C9D1D9]'
                              }`}
                              title={`${day}: ${isCompleted ? 'Completed' : 'Not completed'}`}
                            >
                              {day.charAt(0)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Habit Stats */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#C9D1D9] font-inter">Duration:</span>
                        <span className="text-[#FFD200] font-mono">{formatTime(habit.estimatedDuration || 25)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#C9D1D9] font-inter">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-oswald tracking-wide ${
                          habit.completedAt 
                            ? 'bg-[#3CCB7F] text-[#0A0C0F]' 
                            : 'bg-[#2A313A] text-[#C9D1D9] border border-[#3CCB7F]'
                        }`}>
                          {habit.completedAt ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                      
                      {habit.goalIds && habit.goalIds.length > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#C9D1D9] font-inter">Goal:</span>
                          <span className="text-[#3CCB7F] font-inter">
                            {goals.find(g => g._id === habit.goalIds[0])?.name || 'Unknown Goal'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Quick Complete Button */}
                    {!habit.completedAt && (
                      <div className="pt-3 border-t border-[#2A313A]">
                        <button
                          onClick={() => handleQuickCompleteHabit(habit)}
                          className="w-full bg-[#3CCB7F] text-[#0A0C0F] px-3 py-2 rounded-lg hover:bg-[#2FB86B] transition-colors text-sm font-medium font-oswald tracking-wide"
                        >
                          MARK AS COMPLETE
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#2A313A] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Repeat className="text-[#C9D1D9]" size={24} />
                </div>
                <h5 className="text-md font-semibold text-[#E8EEF2] mb-2 font-oswald tracking-wide">NO HABITS SET</h5>
                <p className="text-[#C9D1D9] font-inter text-sm">Create habits to build consistent daily routines</p>
              </div>
            )}
          </div>








          
          {/* Show fallback content when metrics are not available */}
          {!todayMetrics && (
            <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
              {/* Film grain overlay */}
              <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
              
              {/* Reason Strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD200] to-[#3CCB7F]"></div>
              
              <div className="text-center py-8">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FFD200] mx-auto mb-4"></div>
                    <h3 className="text-lg font-semibold text-[#E8EEF2] mb-2 font-oswald tracking-wide">LOADING YOUR DAILY METRICS</h3>
                    <p className="text-[#C9D1D9] font-inter">Please wait while we fetch your data...</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-[#2A313A] rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Target className="text-[#FFD200]" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-[#E8EEF2] mb-2 font-oswald tracking-wide">WELCOME TO GOAL-ALIGNED DAY!</h3>
                    <p className="text-[#C9D1D9] mb-4 font-inter">
                      Track your daily progress, manage goals, and build better habits. Get started by creating your first goal and completing tasks to see your metrics.
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={() => setActiveTab('goals')}
                        className="bg-[#FFD200] text-[#0A0C0F] px-4 py-2 rounded-lg hover:bg-[#FFD200]/90 transition-colors mr-2 font-oswald tracking-wide"
                      >
                        CREATE YOUR FIRST GOAL
                      </button>
                      <button
                        onClick={() => setActiveTab('tasks')}
                        className="bg-[#2A313A] text-[#C9D1D9] px-4 py-2 rounded-lg hover:bg-[#3EA6FF] hover:text-[#0A0C0F] transition-colors font-oswald tracking-wide"
                      >
                        ADD A TASK
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Month Tab */}
      {activeTab === 'month' && (
        <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
          {/* Film grain overlay */}
          <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
          
          {/* Reason Strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3EA6FF] to-[#FFD200]"></div>
          
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-[#E8EEF2] font-oswald tracking-wide">MONTHLY MINDFULNESS TRACKER</h3>
            <div className="text-xs text-[#C9D1D9] font-inter">
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </div>
          </div>
          
          {/* Month Grid - 5x7 layout */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-[#E8EEF2] mb-3 font-oswald tracking-wide">MINDFULNESS SCORE GRID</h4>
            <div className="grid grid-cols-7 gap-1 max-w-4xl mx-auto">
              {(() => {
                const currentDate = new Date();
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const firstDayOfMonth = new Date(year, month, 1).getDay();
                
                // Create array of all days in month
                const days = [];
                
                // Add empty cells for days before month starts
                for (let i = 0; i < firstDayOfMonth; i++) {
                  days.push(null);
                }
                
                // Add all days in month
                for (let i = 1; i <= daysInMonth; i++) {
                  days.push(i);
                }
                
                // Fill remaining cells to complete 5x7 grid (35 cells)
                while (days.length < 35) {
                  days.push(null);
                }
                
                return days.map((day, index) => {
                  if (day === null) {
                    return <div key={index} className="w-8 h-8"></div>;
                  }
                  
                  // Calculate mindfulness score for this day (mock data for now)
                  const mindfulnessScore = Math.floor(Math.random() * 5) + 1; // 1-5 score
                  const intensity = mindfulnessScore / 5; // 0-1 intensity
                  
                  // Create yellow shade based on score
                  const yellowShade = `rgba(255, 210, 0, ${intensity * 0.8 + 0.2})`; // 20%-100% opacity
                  
                  return (
                    <div key={index} className="group relative">
                      <div 
                        className="w-8 h-8 rounded border border-[#2A313A] cursor-pointer transition-all duration-200 hover:scale-110"
                        style={{ backgroundColor: yellowShade }}
                        title={`Day ${day}: Mindfulness Score ${mindfulnessScore}/5`}
                      />
                      <span className="text-xs text-[#C9D1D9] mt-1 block text-center font-mono">
                        {day}
                      </span>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#0A0C0F] border-2 border-[#2A313A] rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                        <div className="text-[#E8EEF2] text-xs font-inter">
                          <div className="font-oswald tracking-wide text-[#FFD200] mb-1">Day {day}</div>
                          <div className="text-[#C9D1D9]">Mindfulness Score: {mindfulnessScore}/5</div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#0A0C0F]"></div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
          
          {/* Monthly Goals Summary */}
          <div className="bg-[#0A0C0F] border border-[#2A313A] rounded-lg p-4">
            <h4 className="text-sm font-semibold text-[#E8EEF2] mb-3 font-oswald tracking-wide text-center">MONTHLY GOALS SUMMARY</h4>
            {goals.length > 0 ? (
              <div className="space-y-3">
                {goals.map((goal) => {
                  // Calculate monthly stats for this goal
                  const monthlyTasks = Array.isArray(todayTasks) ? todayTasks.filter(task => 
                    task.goalIds && 
                    task.goalIds.includes(goal._id) && 
                    task.completedAt &&
                    new Date(task.completedAt).getMonth() === new Date().getMonth()
                  ) : [];
                  
                  const totalHours = monthlyTasks.reduce((total, task) => {
                    const duration = task.estimatedDuration ? parseFloat(task.estimatedDuration) / 60 : 0;
                    return total + duration;
                  }, 0);
                  
                  const tasksCompleted = monthlyTasks.length;
                  
                  return (
                    <div key={goal._id} className="flex items-center justify-between p-3 bg-[#11151A] rounded border border-[#2A313A]">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: goal.color }}></div>
                        <span className="text-sm font-medium text-[#E8EEF2] font-oswald tracking-wide">{goal.name}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-[#C9D1D9] font-inter">
                        <span>{totalHours.toFixed(1)}h</span>
                        <span>{tasksCompleted} tasks</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-[#C9D1D9] font-inter">
                No goals set for this month
              </div>
            )}
          </div>
        </div>
      )}

      {/* Year Tab */}
      {activeTab === 'year' && (
        <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
          {/* Film grain overlay */}
          <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
          
          {/* Reason Strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD200] to-[#3CCB7F]"></div>
          
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#E8EEF2] font-oswald tracking-wide">YEARLY OVERVIEW</h3>
            <div className="text-xs text-[#C9D1D9] font-inter">
              {new Date().getFullYear()} Progress
            </div>
          </div>
          
          {/* Year Grid - 52 weeks */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-[#E8EEF2] mb-3 font-oswald tracking-wide">WEEKLY PROGRESS GRID</h4>
            <div className="grid grid-cols-13 gap-1 max-w-6xl mx-auto">
              {(() => {
                const weeks = [];
                for (let week = 1; week <= 52; week++) {
                  weeks.push(week);
                }
                
                return weeks.map((week) => {
                  // Calculate weekly stats (mock data for now)
                  const weeklyTasks = Math.floor(Math.random() * 10) + 1; // 1-10 tasks
                  const weeklyHours = Math.floor(Math.random() * 20) + 1; // 1-20 hours
                  const intensity = (weeklyTasks + weeklyHours) / 30; // 0-1 intensity
                  
                  // Create color based on activity level
                  const color = `rgba(62, 166, 255, ${intensity * 0.8 + 0.2})`; // Blue with varying opacity
                  
                  return (
                    <div key={week} className="group relative">
                      <div 
                        className="w-6 h-6 rounded border border-[#2A313A] cursor-pointer transition-all duration-200 hover:scale-110"
                        style={{ backgroundColor: color }}
                        title={`Week ${week}: ${weeklyTasks} tasks, ${weeklyHours}h`}
                      />
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#0A0C0F] border-2 border-[#2A313A] rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                        <div className="text-[#E8EEF2] text-xs font-inter">
                          <div className="font-oswald tracking-wide text-[#3EA6FF] mb-1">Week {week}</div>
                          <div className="text-[#C9D1D9]">{weeklyTasks} tasks completed</div>
                          <div className="text-[#C9D1D9]">{weeklyHours}h total</div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#0A0C0F]"></div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            <div className="text-center mt-2">
              <p className="text-xs text-[#C9D1D9] font-inter">52 weeks of the year</p>
            </div>
          </div>
          
          {/* Yearly Goals Summary */}
          <div className="bg-[#0A0C0F] border border-[#2A313A] rounded-lg p-4">
            <h4 className="text-sm font-semibold text-[#E8EEF2] mb-3 font-oswald tracking-wide text-center">YEARLY GOALS SUMMARY</h4>
            {goals.length > 0 ? (
              <div className="space-y-3">
                {goals.map((goal) => {
                  // Calculate yearly stats for this goal
                  const yearlyTasks = Array.isArray(todayTasks) ? todayTasks.filter(task => 
                    task.goalIds && 
                    task.goalIds.includes(goal._id) && 
                    task.completedAt &&
                    new Date(task.completedAt).getFullYear() === new Date().getFullYear()
                  ) : [];
                  
                  const totalHours = yearlyTasks.reduce((total, task) => {
                    const duration = task.estimatedDuration ? parseFloat(task.estimatedDuration) / 60 : 0;
                    return total + duration;
                  }, 0);
                  
                  const tasksCompleted = yearlyTasks.length;
                  
                  return (
                    <div key={goal._id} className="flex items-center justify-between p-3 bg-[#11151A] rounded border border-[#2A313A]">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: goal.color }}></div>
                        <span className="text-sm font-medium text-[#E8EEF2] font-oswald tracking-wide">{goal.name}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-[#C9D1D9] font-inter">
                        <span>{totalHours.toFixed(1)}h</span>
                        <span>{tasksCompleted} tasks</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-[#C9D1D9] font-inter">
                No goals set for this year
              </div>
            )}
          </div>
        </div>
      )}



      {/* Goals Tab */}


      {/* Goal Form Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
            {/* Film grain overlay */}
            <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
            
            {/* Reason Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3CCB7F] to-[#FFD200]"></div>
            
            <h3 className="text-lg font-semibold text-[#E8EEF2] mb-4 font-oswald tracking-wide">
              {editingGoal ? 'Edit Goal' : 'Add New Goal'}
            </h3>
            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] mb-1 font-inter">Name</label>
                <input
                  type="text"
                  value={goalFormData.name}
                  onChange={(e) => setGoalFormData({...goalFormData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] mb-1 font-inter">Color</label>
                <input
                  type="color"
                  value={goalFormData.color}
                  onChange={(e) => setGoalFormData({...goalFormData, color: e.target.value})}
                  className="w-full h-10 border border-[#2A313A] rounded-lg bg-[#0A0C0F]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] mb-1 font-inter">Description</label>
                <textarea
                  value={goalFormData.description}
                  onChange={(e) => setGoalFormData({...goalFormData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                  rows="3"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#C9D1D9] mb-1 font-inter">Category</label>
                  <select
                    value={goalFormData.category}
                    onChange={(e) => setGoalFormData({...goalFormData, category: e.target.value})}
                    className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                  >
                    <option value="sleep" className="bg-[#0A0C0F] text-[#E8EEF2]">Sleep</option>
                    <option value="partner" className="bg-[#0A0C0F] text-[#E8EEF2]">Partner</option>
                    <option value="reading" className="bg-[#0A0C0F] text-[#E8EEF2]">Reading</option>
                    <option value="deep-work" className="bg-[#0A0C0F] text-[#E8EEF2]">Deep Work</option>
                    <option value="health" className="bg-[#0A0C0F] text-[#E8EEF2]">Health</option>
                    <option value="mindfulness" className="bg-[#0A0C0F] text-[#E8EEF2]">Mindfulness</option>
                    <option value="fitness" className="bg-[#0A0C0F] text-[#E8EEF2]">Fitness</option>
                    <option value="learning" className="bg-[#0A0C0F] text-[#E8EEF2]">Learning</option>
                    <option value="social" className="bg-[#0A0C0F] text-[#E8EEF2]">Social</option>
                    <option value="other" className="bg-[#0A0C0F] text-[#E8EEF2]">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#C9D1D9] mb-1 font-inter">Target Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={goalFormData.targetHours}
                    onChange={(e) => setGoalFormData({...goalFormData, targetHours: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] mb-1 font-inter">Priority</label>
                <select
                  value={goalFormData.priority}
                  onChange={(e) => setGoalFormData({...goalFormData, priority: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                >
                  <option value="low" className="bg-[#0A0C0F] text-[#E8EEF2]">Low</option>
                  <option value="medium" className="bg-[#0A0C0F] text-[#E8EEF2]">Medium</option>
                  <option value="high" className="bg-[#0A0C0F] text-[#E8EEF2]">High</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#3CCB7F] text-[#0A0C0F] py-2 px-4 rounded-lg hover:bg-[#2FB86B] transition-colors font-oswald tracking-wide"
                >
                  {editingGoal ? 'Update Goal' : 'Add Goal'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowGoalForm(false);
                    setEditingGoal(null);
                    setGoalFormData({
                      name: '',
                      color: '#10B981',
                      description: '',
                      category: 'other',
                      targetHours: 1,
                      priority: 'medium'
                    });
                  }}
                  className="flex-1 bg-[#2A313A] text-[#E8EEF2] py-2 px-4 rounded-lg hover:bg-[#3A414A] transition-colors font-oswald tracking-wide"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
            {/* Film grain overlay */}
            <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
            
            {/* Reason Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD200] to-[#3CCB7F]"></div>
            
            <h3 className="text-lg font-semibold text-[#E8EEF2] mb-4 font-oswald tracking-wide">
              Add New Task
            </h3>
            
            {/* Goal Info Display */}
            {taskFormData.goalIds.length > 0 && (
              <div className="mb-4 p-3 bg-[#0A0C0F] border border-[#3CCB7F] rounded-lg">
                <p className="text-sm text-[#C9D1D9] font-inter mb-1">Task will be added to:</p>
                <p className="text-[#3CCB7F] font-semibold font-oswald tracking-wide">
                  {goals.find(g => g._id === taskFormData.goalIds[0])?.name || 'Selected Goal'}
                </p>
              </div>
            )}
            
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] mb-1 font-inter">Task Title *</label>
                <input
                  type="text"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({...taskFormData, title: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                  placeholder="Enter task description"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] mb-1 font-inter">Duration (hours) *</label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="24"
                  value={taskFormData.duration}
                  onChange={(e) => setTaskFormData({...taskFormData, duration: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                  placeholder="0.5"
                  required
                />
                <p className="text-xs text-[#C9D1D9] mt-1 font-inter">Enter duration in hours (e.g., 0.5 for 30 minutes)</p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#3CCB7F] text-[#0A0C0F] py-2 px-4 rounded-lg hover:bg-[#2FB86B] transition-colors font-oswald tracking-wide"
                >
                  Add Task
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskForm(false);
                    setTaskFormData({
                      title: '',
                      duration: '',
                      goalIds: []
                    });
                  }}
                  className="flex-1 bg-[#2A313A] text-[#E8EEF2] py-2 px-4 rounded-lg hover:bg-[#3A414A] transition-colors font-oswald tracking-wide"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Habit Form Modal */}
      {showHabitForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
            {/* Film grain overlay */}
            <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
            
            {/* Reason Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3CCB7F] to-[#FFD200]"></div>
            
            <h3 className="text-lg font-semibold text-[#E8EEF2] mb-4 font-oswald tracking-wide">
              Add New Habit
            </h3>
            
            <form onSubmit={handleHabitSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] mb-1 font-inter">Habit Title *</label>
                <input
                  type="text"
                  value={habitFormData.title}
                  onChange={(e) => setHabitFormData({...habitFormData, title: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                  placeholder="Enter habit description"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] mb-1 font-inter">Hours Everyday *</label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="24"
                  value={habitFormData.time}
                  onChange={(e) => setHabitFormData({...habitFormData, time: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                  placeholder="1.5"
                  required
                />
                <p className="text-xs text-[#C9D1D9] mt-1 font-inter">Enter hours per day (e.g., 1.5 for 1 hour 30 minutes)</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] mb-1 font-inter">Repeat Frequency *</label>
                <select
                  value={habitFormData.repeatFrequency}
                  onChange={(e) => setHabitFormData({...habitFormData, repeatFrequency: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <p className="text-xs text-[#C9D1D9] mt-1 font-inter">How often should this habit be repeated</p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#3CCB7F] text-[#0A0C0F] py-2 px-4 rounded-lg hover:bg-[#2FB86B] transition-colors font-oswald tracking-wide"
                >
                  Add Habit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowHabitForm(false);
                    setHabitFormData({
                      title: '',
                      time: '',
                      repeatFrequency: 'daily'
                    });
                  }}
                  className="flex-1 bg-[#2A313A] text-[#E8EEF2] py-2 px-4 rounded-lg hover:bg-[#3A414A] transition-colors font-oswald tracking-wide"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            setTaskFormData({
              title: '',
              duration: '',
              goalIds: []
            });
            setShowTaskForm(true);
          }}
          className="bg-[#3CCB7F] text-[#0A0C0F] p-4 rounded-full shadow-lg hover:bg-[#2FB86B] transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>
    </motion.div>
  );
};

export default GoalAlignedDay;

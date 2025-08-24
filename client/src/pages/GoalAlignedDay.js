import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Target, 
  Clock, 
  TrendingUp, 
  Calendar,
  Edit3,
  Trash2,
  Flame,
  CheckCircle,
  Star,
  Repeat
} from 'lucide-react';
import axios from 'axios';

const GoalAlignedDay = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [todayMetrics, setTodayMetrics] = useState(null);
  const [streakInfo, setStreakInfo] = useState({});
  const [weeklyData, setWeeklyData] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filter states for different tabs
  const [taskFilter, setTaskFilter] = useState('daily');
  const [goalFilter, setGoalFilter] = useState('daily');
  const [habitFilter, setHabitFilter] = useState('daily');

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
    start: '',
    end: '',
    estimatedDuration: '',
    goalIds: [],
    mindfulRating: 3,
    isHabit: false,
    habitCadence: 'daily'
  });

  useEffect(() => {
    fetchData();
  }, []);



  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [goalsRes, metricsRes, streakRes, weeklyRes, tasksRes] = await Promise.all([
        axios.get('/api/goals', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/goals/today', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/goals/streak', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/goals/weekly', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
          params: { 
            date: new Date().toISOString().split('T')[0],
            status: 'completed'
          }
        })
      ]);



      setGoals(goalsRes.data);
      setTodayMetrics(metricsRes.data);
      setStreakInfo(streakRes.data);
      setWeeklyData(weeklyRes.data);
      setTodayTasks(tasksRes.data.tasks || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Set empty states on error
      setGoals([]);
      setTodayMetrics(null);
      setStreakInfo({});
      setWeeklyData([]);
      setTodayTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingGoal) {
        const response = await axios.put(`/api/goals/${editingGoal._id}`, goalFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        const response = await axios.post('/api/goals', goalFormData, {
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
    
    // Validate habit requirements
    if (taskFormData.isHabit && (!taskFormData.goalIds || taskFormData.goalIds.length === 0)) {
      alert('Habits must be associated with at least one goal. Please select a goal before creating this habit.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      // Calculate duration if start/end time provided
      let duration = taskFormData.estimatedDuration;
      if (taskFormData.start && taskFormData.end) {
        const start = new Date(taskFormData.start);
        const end = new Date(taskFormData.end);
        duration = Math.round((end - start) / (1000 * 60)); // Convert to minutes
      }
      
      const taskData = {
        title: taskFormData.title,
        start: taskFormData.start || undefined,
        end: taskFormData.end || undefined,
        estimatedDuration: duration,
        goalIds: taskFormData.goalIds,
        mindfulRating: taskFormData.mindfulRating,
        isHabit: taskFormData.isHabit,
        habitCadence: taskFormData.isHabit ? taskFormData.habitCadence : undefined,
        status: 'completed',
        completedAt: new Date()
      };
      
      await axios.post('/api/tasks', taskData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowTaskForm(false);
      setTaskFormData({
        title: '',
        start: '',
        end: '',
        estimatedDuration: '',
        goalIds: [],
        mindfulRating: 3,
        isHabit: false,
        habitCadence: 'daily'
      });
      
      // Refresh data to recalculate metrics
      await fetchData();
    } catch (error) {
      console.error('Error creating task:', error);
      alert(`Error creating task: ${error.response?.data?.message || error.message}`);
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
      
      await axios.put(`/api/tasks/${habit._id}`, updatedHabit, {
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

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/goals/${goalId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatPercentage = (percentage) => {
    return `${percentage}%`;
  };

  const calculateMindfulnessScore = () => {
    if (todayMetrics && todayMetrics.averageMindfulRating) {
      return todayMetrics.averageMindfulRating;
    }
    if (!todayTasks || todayTasks.length === 0) return 0;
    
    const totalRating = todayTasks.reduce((sum, task) => {
      return sum + (task.mindfulRating || 3); // Default to 3 if no rating
    }, 0);
    
    return Math.round(totalRating / todayTasks.length * 20) / 20; // Round to 1 decimal place
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
      className="relative w-full max-w-full overflow-x-auto"
    >
      {/* Header - Mission Card */}
      <div className="bg-gray-900 border-2 border-gray-600 rounded-lg p-6 relative overflow-hidden mb-6" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
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
              {['overview', 'tasks', 'habits', 'goals'].map((tab) => (
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
            
            {/* Streak Display */}
            <div className="flex items-center gap-2 bg-[#0A0C0F] border-2 border-[#FFD200] rounded-lg px-3 py-1.5">
              <Flame className="text-[#FFD200]" size={16} />
              <div className="text-center">
                <div className="text-xs text-[#C9D1D9] font-oswald tracking-wide">STREAK</div>
                <div className="text-sm font-bold text-[#FFD200] font-mono">
                  {streakInfo.currentStreak || 0} days
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowTaskForm(true)}
              className="bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-400 flex items-center gap-1 font-oswald tracking-wide transition-colors text-sm border border-amber-400 hover:shadow-lg hover:shadow-amber-500/20"
            >
              <Plus size={16} />
              ADD TASK
            </button>
            <button
              onClick={() => setShowGoalForm(true)}
              className="bg-gray-700 text-white px-3 py-1.5 rounded hover:bg-gray-600 flex items-center gap-1 font-oswald tracking-wide transition-colors text-sm border border-gray-600 hover:border-gray-500"
            >
              <Plus size={16} />
              ADD GOAL
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>

          


          {/* 24-Hour Visual Strip - Progress Rings */}
          {todayMetrics && (
            <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 relative overflow-hidden mb-8" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
              {/* Film grain overlay */}
              <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
              
              {/* Reason Strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3CCB7F] via-[#3EA6FF] to-[#FFD200]"></div>
              
              <h3 className="text-lg font-semibold text-[#E8EEF2] mb-4 font-oswald tracking-wide">MISSION TIMELINE</h3>
              <p className="text-sm text-[#C9D1D9] mb-4 text-center font-inter">
                Each hour shows one status: Goal-aligned + Mindful, Goal-aligned only, Mindful only, Not Mindful/Not Goal-Oriented, or No activity
              </p>
              
              {/* Day Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-[#0A0C0F] border-2 border-[#3CCB7F] rounded-lg">
                  <p className="text-lg font-bold text-[#3CCB7F] font-mono">
                    {todayTasks.filter(task => {
                      if (!task.completedAt) return false;
                      const taskTime = new Date(task.completedAt);
                      const hour = taskTime.getHours();
                      return hour >= 0 && hour < 24;
                    }).filter(task => task.goalIds && task.goalIds.length > 0 && task.mindfulRating >= 4).length}
                  </p>
                  <p className="text-xs text-[#3CCB7F]/80 font-oswald tracking-wide">PERFECT HOURS</p>
                </div>
                <div className="text-center p-3 bg-[#0A0C0F] border-2 border-[#3EA6FF] rounded-lg">
                  <p className="text-lg font-bold text-[#3EA6FF] font-mono">
                    {todayTasks.filter(task => {
                      if (!task.completedAt) return false;
                      const taskTime = new Date(task.completedAt);
                      const hour = taskTime.getHours();
                      return hour >= 0 && hour < 24;
                    }).filter(task => task.goalIds && task.goalIds.length > 0 && task.mindfulRating < 4).length}
                  </p>
                  <p className="text-xs text-[#3EA6FF]/80 font-oswald tracking-wide">GOAL-ALIGNED</p>
                </div>
                <div className="text-center p-3 bg-[#0A0C0F] border-2 border-[#FFD200] rounded-lg">
                  <p className="text-lg font-bold text-[#FFD200] font-mono">
                    {todayTasks.filter(task => {
                      if (!task.completedAt) return false;
                      const taskTime = new Date(task.completedAt);
                      const hour = taskTime.getHours();
                      return hour >= 0 && hour < 24;
                    }).filter(task => (!task.goalIds || task.goalIds.length === 0) && task.mindfulRating >= 4).length}
                  </p>
                  <p className="text-xs text-[#FFD200]/80 font-oswald tracking-wide">MINDFUL</p>
                </div>
                <div className="text-center p-3 bg-[#0A0C0F] border-2 border-[#D64545] rounded-lg">
                  <p className="text-lg font-bold text-[#D64545] font-mono">
                    {todayTasks.filter(task => {
                      if (!task.completedAt) return false;
                      const taskTime = new Date(task.completedAt);
                      const hour = taskTime.getHours();
                      return hour >= 0 && hour < 24;
                    }).filter(task => (!task.goalIds || task.goalIds.length === 0) && task.mindfulRating < 4).length}
                  </p>
                  <p className="text-xs text-[#D64545]/80 font-oswald tracking-wide">NOT MINDFUL, NOT GOAL-ORIENTED</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* 24-Hour Strip */}
                <div className="flex flex-wrap justify-center gap-1 max-w-4xl mx-auto">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const hourStart = new Date();
                    hourStart.setHours(hour, 0, 0, 0);
                    const hourEnd = new Date(hourStart);
                    hourEnd.setHours(hour + 1, 0, 0, 0);
                    
                    // Check if this hour has any activity
                    const hasActivity = todayTasks.some(task => {
                      if (!task.completedAt) return false;
                      const taskTime = new Date(task.completedAt);
                      return taskTime >= hourStart && taskTime < hourEnd;
                    });
                    
                    // Check if this hour has goal-aligned activity
                    const hasGoalAligned = todayTasks.some(task => {
                      if (!task.completedAt || !task.goalIds || task.goalIds.length === 0) return false;
                      const taskTime = new Date(task.completedAt);
                      return taskTime >= hourStart && taskTime < hourEnd;
                    });
                    
                    // Check if this hour has mindful activity
                    const hasMindful = todayTasks.some(task => {
                      if (!task.completedAt || !task.mindfulRating || task.mindfulRating < 4) return false;
                      const taskTime = new Date(task.completedAt);
                      return taskTime >= hourStart && taskTime < hourEnd;
                    });
                    
                    let color = 'bg-[#2A313A]'; // No activity
                    let status = 'No activity';
                    
                    if (hasActivity) {
                      if (hasGoalAligned && hasMindful) {
                        color = 'bg-[#3CCB7F]'; // Goal-aligned + Mindful
                        status = 'Goal-aligned + Mindful';
                      } else if (hasGoalAligned) {
                        color = 'bg-[#3EA6FF]'; // Only Goal-aligned
                        status = 'Goal-aligned';
                      } else if (hasMindful) {
                        color = 'bg-[#FFD200]'; // Only Mindful
                        status = 'Mindful';
                      } else {
                        color = 'bg-[#D64545]'; // Not mindful, not goal-oriented
                        status = 'Not Mindful, Not Goal-Oriented';
                      }
                    }
                    
                    // Format hour for display
                    const displayHour = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
                    
                    // Get tasks for this hour
                    const hourTasks = todayTasks.filter(task => {
                      if (!task.completedAt) return false;
                      const taskTime = new Date(task.completedAt);
                      return taskTime >= hourStart && taskTime < hourEnd;
                    });
                    
                    // Build detailed tooltip content
                    let tooltipContent = `${displayHour}\n${status}`;
                    if (hourTasks.length > 0) {
                      tooltipContent += `\n\nTasks:`;
                      hourTasks.forEach((task, index) => {
                        const taskTime = new Date(task.completedAt);
                        const timeStr = taskTime.toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        });
                        const goalNames = task.goalIds && task.goalIds.length > 0 
                          ? task.goalIds.map(goalId => {
                              const goal = goals.find(g => g._id === goalId);
                              return goal ? goal.name : 'Unknown Goal';
                            }).join(', ')
                          : 'No Goal';
                        const mindfulText = task.mindfulRating >= 4 ? '✓ Mindful' : '✗ Not Mindful';
                        
                        tooltipContent += `\n${index + 1}. ${task.title}`;
                        tooltipContent += `\n   Time: ${timeStr}`;
                        tooltipContent += `\n   Goal: ${goalNames}`;
                        tooltipContent += `\n   ${mindfulText}`;
                        if (task.isHabit) {
                          tooltipContent += `\n   Habit: ${task.habitCadence}`;
                        }
                        tooltipContent += `\n`;
                      });
                    }
                    
                    return (
                      <div key={hour} className="flex flex-col items-center group relative">
                        <div 
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
                                      <div className={task.mindfulRating >= 4 ? 'text-[#3CCB7F]' : 'text-[#D64545]'}>
                                        {task.mindfulRating >= 4 ? '✓ Mindful' : '✗ Not Mindful'}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 text-sm max-w-4xl mx-auto">
                  <div className="flex items-center space-x-2 justify-center">
                    <div className="w-3 h-3 rounded-sm bg-[#3CCB7F]"></div>
                    <span className="text-[#C9D1D9] text-xs sm:text-sm font-inter">Goal + Mindful</span>
                  </div>
                  <div className="flex items-center space-x-2 justify-center">
                    <div className="w-3 h-3 rounded-sm bg-[#3EA6FF]"></div>
                    <span className="text-[#C9D1D9] text-xs sm:text-sm font-inter">Goal-aligned</span>
                  </div>
                  <div className="flex items-center space-x-2 justify-center">
                    <div className="w-3 h-3 rounded-sm bg-[#FFD200]"></div>
                    <span className="text-[#C9D1D9] text-xs sm:text-sm font-inter">Mindful</span>
                  </div>
                  <div className="flex items-center space-x-2 justify-center">
                    <div className="w-3 h-3 rounded-sm bg-[#D64545]"></div>
                    <span className="text-[#C9D1D9] text-xs sm:text-sm font-inter">Not Mindful, Not Goal-Oriented</span>
                  </div>
                  <div className="flex items-center space-x-2 justify-center">
                    <div className="w-3 h-3 rounded-sm bg-[#2A313A]"></div>
                    <span className="text-[#C9D1D9] text-xs sm:text-sm font-inter">No activity</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Weekly Progress */}
          {weeklyData && weeklyData.length > 0 && (
            <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 relative overflow-hidden mb-8" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
              {/* Film grain overlay */}
              <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
              
              {/* Reason Strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3CCB7F] via-[#FFD200] to-[#3EA6FF]"></div>
              
              <h3 className="text-lg font-semibold text-[#E8EEF2] mb-4 font-oswald tracking-wide">WEEKLY PROGRESS</h3>
              <div className="grid grid-cols-7 gap-2">
                {weeklyData.map((day, index) => (
                  <div key={index} className="text-center">
                    <p className="text-xs text-[#C9D1D9] mb-1 font-inter">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <div 
                      className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-medium font-mono ${
                        day.score24 >= 8 
                          ? 'bg-[#3CCB7F] text-[#0A0C0F]' 
                          : day.score24 >= 4 
                          ? 'bg-[#FFD200] text-[#0A0C0F]'
                          : 'bg-[#2A313A] text-[#C9D1D9]'
                      }`}
                    >
                      {day.score24.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Goal Breakdown */}
          {todayMetrics && todayMetrics.goalBreakdown && todayMetrics.goalBreakdown.length > 0 && (
            <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 relative overflow-hidden mb-8" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
              {/* Film grain overlay */}
              <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
              
              {/* Reason Strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3EA6FF] to-[#3CCB7F]"></div>
              
              <h3 className="text-lg font-semibold text-[#E8EEF2] mb-4 font-oswald tracking-wide">GOAL BREAKDOWN</h3>
              <div className="space-y-3">
                {todayMetrics.goalBreakdown.map((goal, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#0A0C0F] border border-[#2A313A] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: goal.goalColor }}
                      ></div>
                      <span className="font-medium text-[#E8EEF2] font-oswald tracking-wide">{goal.goalName}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#FFD200] font-mono">{formatTime(goal.minutes)}</p>
                      <p className="text-xs text-[#C9D1D9] font-inter">{formatPercentage(goal.percentage)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}








          
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

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
          {/* Film grain overlay */}
          <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
          
          {/* Reason Strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3EA6FF] to-[#FFD200]"></div>
          
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-[#E8EEF2] font-oswald tracking-wide">TASK MANAGEMENT</h3>
            <button
              onClick={() => setShowTaskForm(true)}
              className="bg-[#FFD200] text-[#0A0C0F] px-4 py-2 rounded-lg hover:bg-[#FFD200]/90 transition-colors font-medium font-oswald tracking-wide"
            >
              ADD TASK
            </button>
          </div>
          
          {/* Time Filter */}
          <div className="bg-[#0A0C0F] border-2 border-[#2A313A] rounded-lg p-4 mb-6 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
            <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3EA6FF] to-[#FFD200]"></div>
            
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-[#E8EEF2] font-oswald tracking-wide">TIME PERIOD</h4>
              <div className="text-xs text-[#C9D1D9] font-inter">
                {taskFilter === 'daily' ? 'Today' : taskFilter === 'weekly' ? 'This Week' : 'This Month'}
              </div>
            </div>
            
            <div className="flex space-x-2">
              {['daily', 'weekly', 'monthly'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTaskFilter(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium font-oswald tracking-wide transition-all ${
                    taskFilter === period
                      ? 'bg-[#FFD200] text-[#0A0C0F] shadow-lg'
                      : 'bg-[#2A313A] text-[#C9D1D9] border border-[#2A313A] hover:border-[#FFD200]/50'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {todayTasks && todayTasks.length > 0 ? (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <div key={task._id} className={`bg-[#0A0C0F] border-2 border-[#2A313A] rounded-lg p-4 ${
                  task.isHabit 
                    ? 'border-[#3CCB7F] bg-[#0A0C0F]' 
                    : 'border-[#2A313A]'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {task.isHabit && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-[#3CCB7F] rounded-full"></div>
                          <span className="text-xs text-[#3CCB7F] font-medium bg-[#2A313A] px-2 py-1 rounded-full font-oswald tracking-wide">
                            {task.habitCadence} HABIT
                          </span>
                        </div>
                      )}
                      <span className={`font-semibold font-oswald tracking-wide ${
                        task.isHabit ? 'text-[#3CCB7F]' : 'text-[#E8EEF2]'
                      }`}>{task.title}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-[#FFD200] font-mono">
                        {task.start && task.end 
                          ? `${new Date(task.start).toLocaleTimeString()} - ${new Date(task.end).toLocaleTimeString()}`
                          : `${formatTime(task.estimatedDuration || 25)}`
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-[#C9D1D9] font-inter">MINDFUL:</span>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Star
                            key={rating}
                            size={14}
                            className={`${
                              rating <= (task.mindfulRating || 3)
                                ? 'text-[#FFD200] fill-current'
                                : 'text-[#2A313A]'
                            }`}
                          />
                        ))}
                      </div>
                      
                      {task.goalIds && task.goalIds.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-[#C9D1D9] font-inter">GOALS:</span>
                          <div className="flex space-x-1">
                            {task.goalIds.map((goalId) => {
                              const goal = goals.find(g => g._id === goalId);
                              return goal ? (
                                <div
                                  key={goalId}
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: goal.color }}
                                  title={goal.name}
                                ></div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm text-[#C9D1D9] font-inter">
                      Completed at {new Date(task.completedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#C9D1D9] font-inter">No tasks completed today</p>
              <p className="text-sm text-[#C9D1D9]/80 font-inter">Add your first task to get started!</p>
            </div>
          )}
        </div>
      )}

      {/* Habits Tab */}
      {activeTab === 'habits' && (
        <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
          {/* Film grain overlay */}
          <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
          
          {/* Reason Strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3CCB7F] to-[#3EA6FF]"></div>
          
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-[#E8EEF2] font-oswald tracking-wide">HABIT TRACKING</h3>
            <button
              onClick={() => setShowTaskForm(true)}
              className="bg-[#FFD200] text-[#0A0C0F] px-4 py-2 rounded-lg hover:bg-[#FFD200]/90 transition-colors font-medium font-oswald tracking-wide"
            >
              ADD HABIT
            </button>
          </div>
          
          {/* Time Filter */}
          <div className="bg-[#0A0C0F] border-2 border-[#2A313A] rounded-lg p-4 mb-6 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
            <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3CCB7F] to-[#3EA6FF]"></div>
            
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-[#E8EEF2] font-oswald tracking-wide">TIME PERIOD</h4>
              <div className="text-xs text-[#C9D1D9] font-inter">
                {habitFilter === 'daily' ? 'Today' : habitFilter === 'weekly' ? 'This Week' : 'This Month'}
              </div>
            </div>
            
            <div className="flex space-x-2">
              {['daily', 'weekly', 'monthly'].map((period) => (
                <button
                  key={period}
                  onClick={() => setHabitFilter(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium font-oswald tracking-wide transition-all ${
                    habitFilter === period
                      ? 'bg-[#FFD200] text-[#0A0C0F] shadow-lg'
                      : 'bg-[#2A313A] text-[#C9D1D9] border border-[#2A313A] hover:border-[#FFD200]/50'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {goals && goals.length > 0 ? (
            <div className="space-y-6">
              {goals.map((goal) => {
                const goalHabits = todayTasks.filter(task => 
                  task.isHabit && 
                  task.goalIds && 
                  task.goalIds.includes(goal._id)
                );
                
                if (goalHabits.length === 0) return null;
                
                return (
                  <div key={goal._id} className="bg-[#0A0C0F] border-2 border-[#2A313A] rounded-lg p-4 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
                    <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
                    
                    <div className="flex items-center space-x-3 mb-4">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: goal.color }}
                      ></div>
                      <h4 className="font-semibold text-[#E8EEF2] font-oswald tracking-wide">{goal.name}</h4>
                    </div>
                    
                    <div className="space-y-3">
                      {goalHabits.map((habit) => (
                        <div key={habit._id} className="bg-[#11151A] border-2 border-[#3CCB7F] rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span className="font-medium text-[#E8EEF2] font-oswald tracking-wide">{habit.title}</span>
                              <span className="text-xs text-[#3CCB7F] bg-[#2A313A] px-2 py-1 rounded-full font-oswald tracking-wide">
                                {habit.habitCadence} HABIT
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-[#FFD200] font-mono">
                                {formatTime(habit.estimatedDuration || 25)}
                              </span>
                              <div className="flex items-center space-x-1">
                                <Flame className="text-[#FFD200]" size={14} />
                                <span className="text-xs text-[#C9D1D9] font-inter">
                                  {habit.completedAt ? 'Today' : 'Not done'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Weekly Habit Tracker */}
                          <div className="mb-3">
                            <p className="text-sm text-[#3CCB7F] mb-2 font-oswald tracking-wide">THIS WEEK:</p>
                            <div className="flex space-x-1">
                              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                                const isToday = index === new Date().getDay();
                                const isCompleted = habit.completedAt && 
                                  new Date(habit.completedAt).toDateString() === new Date().toDateString();
                                
                                return (
                                  <button
                                    key={day}
                                    className={`w-8 h-8 rounded-full text-xs font-medium transition-colors font-mono ${
                                      isToday && isCompleted
                                        ? 'bg-[#3CCB7F] text-[#0A0C0F]'
                                        : isToday
                                        ? 'bg-[#2A313A] text-[#3CCB7F] border-2 border-[#3CCB7F]'
                                        : isCompleted
                                        ? 'bg-[#2A313A] text-[#3CCB7F]'
                                        : 'bg-[#2A313A] text-[#C9D1D9] hover:border-[#3CCB7F]/50'
                                    }`}
                                    title={`${day}: ${isCompleted ? 'Completed' : 'Not completed'}`}
                                  >
                                    {day.charAt(0)}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-[#C9D1D9] font-inter">MINDFUL:</span>
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <Star
                                  key={rating}
                                  size={12}
                                  className={`${
                                    rating <= (habit.mindfulRating || 3)
                                      ? 'text-[#FFD200] fill-current'
                                      : 'text-[#2A313A]'
                                  }`}
                                />
                              ))}
                            </div>
                            
                            <span className="text-[#C9D1D9] font-inter">
                              {habit.completedAt ? (
                                `Completed at ${new Date(habit.completedAt).toLocaleTimeString()}`
                              ) : (
                                'Not completed today'
                              )}
                            </span>
                          </div>
                          
                          {/* Quick Complete Button */}
                          {!habit.completedAt && (
                            <div className="mt-3 pt-3 border-t border-[#2A313A]">
                              <button
                                onClick={() => handleQuickCompleteHabit(habit)}
                                className="w-full bg-[#3CCB7F] text-[#0A0C0F] px-3 py-2 rounded-lg hover:bg-[#3CCB7F]/90 transition-colors text-sm font-medium font-oswald tracking-wide"
                              >
                                MARK AS COMPLETE
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#C9D1D9] font-inter">No habits found</p>
              <p className="text-sm text-[#C9D1D9]/80 font-inter">Create a goal first, then add habits to track your progress!</p>
            </div>
          )}
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
          {/* Film grain overlay */}
          <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
          
          {/* Reason Strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3CCB7F] to-[#3EA6FF]"></div>
          
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-[#E8EEF2] font-oswald tracking-wide">GOAL MANAGEMENT</h3>
            <button
              onClick={() => setShowGoalForm(true)}
              className="bg-[#FFD200] text-[#0A0C0F] px-4 py-2 rounded-lg hover:bg-[#FFD200]/90 transition-colors font-medium font-oswald tracking-wide"
            >
              ADD GOAL
            </button>
          </div>
          
          {/* Time Filter */}
          <div className="bg-[#0A0C0F] border-2 border-[#2A313A] rounded-lg p-4 mb-6 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
            <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3CCB7F] to-[#3EA6FF]"></div>
            
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-[#E8EEF2] font-oswald tracking-wide">TIME PERIOD</h4>
              <div className="text-xs text-[#C9D1D9] font-inter">
                {goalFilter === 'daily' ? 'Today' : goalFilter === 'weekly' ? 'This Week' : 'This Month'}
              </div>
            </div>
            
            <div className="flex space-x-2">
              {['daily', 'weekly', 'monthly'].map((period) => (
                <button
                  key={period}
                  onClick={() => setGoalFilter(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium font-oswald tracking-wide transition-all ${
                    goalFilter === period
                      ? 'bg-[#FFD200] text-[#0A0C0F] shadow-lg'
                      : 'bg-[#2A313A] text-[#C9D1D9] border border-[#2A313A] hover:border-[#FFD200]/50'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <div key={goal._id} className="bg-[#0A0C0F] border-2 border-[#2A313A] rounded-lg p-4 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
                <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
                
                <div className="flex items-center justify-between mb-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: goal.color }}
                  ></div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditGoal(goal)}
                      className="p-1 text-[#C9D1D9] hover:text-[#FFD200] transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="p-1 text-[#C9D1D9] hover:text-[#D64545] transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h4 className="font-semibold text-[#E8EEF2] mb-2 font-oswald tracking-wide">{goal.name}</h4>
                <p className="text-sm text-[#C9D1D9] mb-2 font-inter">{goal.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#C9D1D9] font-inter">Target: {goal.targetHours}h</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-oswald tracking-wide ${
                    goal.priority === 'high' ? 'bg-[#D64545] text-[#E8EEF2]' :
                    goal.priority === 'medium' ? 'bg-[#FFD200] text-[#0A0C0F]' :
                    'bg-[#3CCB7F] text-[#0A0C0F]'
                  }`}>
                    {goal.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal Form Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-sohne">
              {editingGoal ? 'Edit Goal' : 'Add New Goal'}
            </h3>
            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={goalFormData.name}
                  onChange={(e) => setGoalFormData({...goalFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="color"
                  value={goalFormData.color}
                  onChange={(e) => setGoalFormData({...goalFormData, color: e.target.value})}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={goalFormData.description}
                  onChange={(e) => setGoalFormData({...goalFormData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows="3"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={goalFormData.category}
                    onChange={(e) => setGoalFormData({...goalFormData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="sleep">Sleep</option>
                    <option value="partner">Partner</option>
                    <option value="reading">Reading</option>
                    <option value="deep-work">Deep Work</option>
                    <option value="health">Health</option>
                    <option value="mindfulness">Mindfulness</option>
                    <option value="fitness">Fitness</option>
                    <option value="learning">Learning</option>
                    <option value="social">Social</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={goalFormData.targetHours}
                    onChange={(e) => setGoalFormData({...goalFormData, targetHours: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={goalFormData.priority}
                  onChange={(e) => setGoalFormData({...goalFormData, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors font-sohne"
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
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors font-sohne"
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-sohne">
              {taskFormData.isHabit ? 'Add New Habit' : 'Add New Task'}
            </h3>
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({...taskFormData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={taskFormData.start}
                    onChange={(e) => setTaskFormData({...taskFormData, start: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    value={taskFormData.end}
                    onChange={(e) => setTaskFormData({...taskFormData, end: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) - if no start/end time</label>
                <input
                  type="number"
                  min="0"
                  value={taskFormData.estimatedDuration}
                  onChange={(e) => setTaskFormData({...taskFormData, estimatedDuration: parseInt(e.target.value) || ''})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goals {taskFormData.isHabit && <span className="text-red-500">*</span>}
                </label>
                <select
                  multiple
                  value={taskFormData.goalIds}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                    setTaskFormData({...taskFormData, goalIds: selectedOptions});
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    taskFormData.isHabit && (!taskFormData.goalIds || taskFormData.goalIds.length === 0)
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  size="3"
                  required={taskFormData.isHabit}
                >
                  {goals.map((goal) => (
                    <option key={goal._id} value={goal._id}>{goal.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {taskFormData.isHabit 
                    ? 'Habits must be associated with at least one goal' 
                    : 'Hold Ctrl/Cmd to select multiple goals'
                  }
                </p>
                {taskFormData.isHabit && (!taskFormData.goalIds || taskFormData.goalIds.length === 0) && (
                  <p className="text-xs text-red-500 mt-1">Please select at least one goal for this habit</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mindful Rating (1-5)</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setTaskFormData({...taskFormData, mindfulRating: rating})}
                      className={`p-2 rounded-full transition-colors ${
                        taskFormData.mindfulRating === rating
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      <Star size={16} fill={taskFormData.mindfulRating >= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isHabit"
                  checked={taskFormData.isHabit}
                  onChange={(e) => setTaskFormData({...taskFormData, isHabit: e.target.checked})}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isHabit" className="text-sm font-medium text-gray-700">This is a habit</label>
              </div>
              
              {taskFormData.isHabit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Habit Cadence</label>
                  <select
                    value={taskFormData.habitCadence}
                    onChange={(e) => setTaskFormData({...taskFormData, habitCadence: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors font-sohne"
                >
                  {taskFormData.isHabit ? 'Add Habit' : 'Add Task'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskForm(false);
                    setTaskFormData({
                      title: '',
                      startTime: '',
                      endTime: '',
                      duration: '',
                      goalIds: [],
                      mindfulRating: 3,
                      isHabit: false,
                      habitCadence: 'daily'
                    });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors font-sohne"
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
          onClick={() => setShowTaskForm(true)}
          className="bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>
    </motion.div>
  );
};

export default GoalAlignedDay;

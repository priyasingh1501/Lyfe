
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { buildApiUrl } from '../config';
import { CreateHabitPopup } from '../components/habits';
import { CreateGoalPopup } from '../components/goals';
import { CreateTaskPopup } from '../components/tasks';

const GoalAlignedDay = () => {
  const { user, token } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  
  const [tasks, setTasks] = useState([]);
  const [showCreateHabitPopup, setShowCreateHabitPopup] = useState(false);
  const [showCreateGoalPopup, setShowCreateGoalPopup] = useState(false);
  const [showCreateTaskPopup, setShowCreateTaskPopup] = useState(false);
  const [selectedGoalForTask, setSelectedGoalForTask] = useState(null);
  const [selectedGoalForHabit, setSelectedGoalForHabit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completingHabits, setCompletingHabits] = useState(new Set());
  const [completedHabits, setCompletedHabits] = useState(new Set());

  // Format date components separately
  const formatDateComponents = (date) => {
    return {
      day: date.getDate(),
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      month: date.toLocaleDateString('en-US', { month: 'long' }),
      year: date.getFullYear()
    };
  };

  // Get day title
  const getDayTitle = () => {
    const dateComponents = formatDateComponents(selectedDate);
    return `${dateComponents.dayName}, ${dateComponents.month} ${dateComponents.day}`;
  };

  // Load user's habits
  const loadHabits = useCallback(async () => {
    try {
      const response = await fetch(buildApiUrl('/api/habits'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHabits(data || []);
      } else {
        console.error('❌ Habits response not ok:', response.status);
        const errorText = await response.text();
        console.error('❌ Habits error response:', errorText);
      }
    } catch (error) {
      console.error('❌ Error loading habits:', error);
    }
  }, [token]);

  // Load user's goals
  const loadGoals = useCallback(async () => {
    try {
      const response = await fetch(buildApiUrl('/api/goals'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGoals(data || []);
      } else {
        console.error('❌ Goals response not ok:', response.status);
        const errorText = await response.text();
        console.error('❌ Goals error response:', errorText);
      }
    } catch (error) {
      console.error('❌ Error loading goals:', error);
    }
  }, [token]);

  // Load user's tasks
  const loadTasks = useCallback(async () => {
    try {
      const response = await fetch(buildApiUrl('/api/tasks'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Tasks loaded successfully:', data);
        setTasks(data.tasks || []);
      } else {
        console.error('❌ Tasks response not ok:', response.status);
        const errorText = await response.text();
        console.error('❌ Tasks error response:', errorText);
      }
    } catch (error) {
      console.error('❌ Error loading tasks:', error);
    }
  }, [token]);


  // Handle habit creation
  const handleHabitCreated = (newHabit) => {
    setHabits(prev => [newHabit, ...prev]);
  };

  // Handle goal creation
  const handleGoalCreated = (newGoal) => {
    setGoals(prev => [newGoal, ...prev]);
  };

  // Handle task creation
  const handleTaskCreated = (newTask) => {
    console.log('✅ Task created successfully:', newTask);
    setTasks(prev => [newTask, ...prev]);
  };

  // Handle opening task creation popup for a specific goal
  const handleAddTaskToGoal = (goal) => {
    console.log('🎯 Opening task creation popup for goal:', goal);
    setSelectedGoalForTask(goal);
    setShowCreateTaskPopup(true);
  };

  // Handle opening habit creation popup for a specific goal
  const handleAddHabitToGoal = (goal) => {
    setSelectedGoalForHabit(goal);
    setShowCreateHabitPopup(true);
  };

  // Get tasks for a specific goal (both completed and pending)
  const getTasksForGoal = (goalId) => {
    return tasks.filter(task => 
      task.goalIds && 
      task.goalIds.includes(goalId)
    );
  };

  // Get habits for a specific goal
  const getHabitsForGoal = (goalId) => {
    const goalHabits = habits.filter(habit => {
      const habitGoalId = habit.goalId;
      let matches = false;
      
      // Handle both string and object goalId
      if (typeof habitGoalId === 'object' && habitGoalId !== null) {
        // If goalId is populated object, compare _id
        matches = habitGoalId._id === goalId || habitGoalId._id === goalId.toString();
      } else {
        // If goalId is string, compare directly
        matches = habitGoalId === goalId || habitGoalId === goalId.toString() || habitGoalId?.toString() === goalId?.toString();
      }
      
      const isActive = habit.isActive !== false;
      const result = matches && isActive;
      
      return result;
    });
    return goalHabits;
  };

  // Get all activities (tasks + habits) for a specific goal
  const getActivitiesForGoal = (goalId) => {
    const goalTasks = getTasksForGoal(goalId);
    const goalHabits = getHabitsForGoal(goalId);
    
    // Combine tasks and habits into a unified list
    const activities = [
      ...goalTasks.map(task => ({
        ...task,
        type: 'task',
        displayName: task.title,
        duration: task.estimatedDuration || 0,
        isCompleted: task.status === 'completed'
      })),
      ...goalHabits.map(habit => ({
        ...habit,
        type: 'habit',
        displayName: habit.habit,
        duration: habit.valueMin || 0,
        isCompleted: isHabitCompletedToday(habit)
      }))
    ];
    
    return activities;
  };

  // Check if a habit is completed today
  const isHabitCompletedToday = (habit) => {
    if (!habit.checkins || !Array.isArray(habit.checkins)) return false;
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const isCompleted = habit.checkins.some(checkin => {
      const checkinDate = new Date(checkin.date);
      const checkinStr = checkinDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      return checkinStr === todayStr && checkin.completed;
    });
    
    // Debug logging
    if (habit.habit && habit.checkins.length > 0) {
      console.log(`🔍 Habit "${habit.habit}" completion check:`, {
        habitId: habit._id,
        checkins: habit.checkins.map(c => ({
          date: c.date,
          dateStr: new Date(c.date).toISOString().split('T')[0],
          completed: c.completed
        })),
        today: todayStr,
        isCompleted
      });
    }
    
    return isCompleted;
  };

  // Handle habit completion
  const handleHabitComplete = async (habit) => {
    // Add habit to completing set
    setCompletingHabits(prev => new Set([...prev, habit._id]));
    
    try {
      const response = await fetch(buildApiUrl(`/api/habits/${habit._id}/checkin`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: new Date().toISOString(),
          completed: true,
          duration: habit.valueMin || 0,
          notes: '',
          quality: 'good'
        })
      });

      if (response.ok) {
        console.log('✅ Habit completed successfully, reloading data...');
        
        // Show success state briefly
        setCompletedHabits(prev => new Set([...prev, habit._id]));
        setTimeout(() => {
          setCompletedHabits(prev => {
            const newSet = new Set(prev);
            newSet.delete(habit._id);
            return newSet;
          });
        }, 2000);
        
        // Reload data to get updated habit checkins
        await Promise.all([
          loadHabits(),
          loadGoals()
        ]);
        
        // Also trigger backend goal progress recalculation
        try {
          await fetch(buildApiUrl('/api/goals/today'), {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('✅ Goal progress recalculated on backend');
        } catch (error) {
          console.warn('⚠️ Failed to recalculate goal progress on backend:', error);
        }
        
        // Force a re-render by updating state
        setHabits(prev => [...prev]);
        setGoals(prev => [...prev]);
      } else {
        console.error('❌ Failed to complete habit:', response.status);
      }
    } catch (error) {
      console.error('❌ Error completing habit:', error);
    } finally {
      // Remove habit from completing set
      setCompletingHabits(prev => {
        const newSet = new Set(prev);
        newSet.delete(habit._id);
        return newSet;
      });
    }
  };

  // Helper: does a habit occur today based on frequency and date range
  const doesHabitOccurToday = (habit) => {
    if (!habit || habit.isActive === false) return false;
    const today = new Date();
    const start = new Date(habit.startDate || today);
    const end = new Date(habit.endDate || today);
    // Normalize
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    if (today < start || today > end) return false;

    const freq = habit.frequency || 'daily';
    if (freq === 'daily') return true;
    if (freq === 'weekly') {
      return today.getDay() === new Date(habit.startDate || today).getDay();
    }
    if (freq === 'monthly') {
      return today.getDate() === new Date(habit.startDate || today).getDate();
    }
    return false;
  };

  // Helper: get today's check-in for a habit
  const getTodayHabitCheckin = (habit) => {
    if (!habit || !Array.isArray(habit.checkins)) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return habit.checkins.find((c) => {
      const d = new Date(c.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
  };

  // Build a pseudo-task from a completed habit check-in
  const mapHabitToPseudoTask = (habit, checkin) => {
    const durationMin = (checkin && checkin.duration) || habit.valueMin || 0;
    const completedAt = (checkin && checkin.date) || new Date().toISOString();
    return {
      _id: `habit-${habit._id}`,
      title: habit.habit,
      estimatedDuration: durationMin,
      completedAt: typeof completedAt === 'string' ? completedAt : new Date(completedAt).toISOString(),
      goalIds: habit.goalId ? [habit.goalId] : [],
      isHabit: true,
    };
  };

  // Get today's tasks for a specific goal, merging completed habits for today
  const getTodayTasksForGoal = (goalId) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

    // Completed normal tasks today
    const completedTasksToday = tasks.filter((task) =>
      task.goalIds &&
      task.goalIds.includes(goalId) &&
      task.completedAt &&
      task.completedAt.split('T')[0] === todayStr
    );

    // Completed habits today (as pseudo tasks)
    const completedHabitsToday = (habits || [])
      .filter((h) => h.goalId && (h.goalId === goalId || (h.goalId?._id && h.goalId._id === goalId)))
      .filter((h) => doesHabitOccurToday(h))
      .map((h) => ({ habit: h, checkin: getTodayHabitCheckin(h) }))
      .filter(({ checkin }) => checkin && checkin.completed)
      .map(({ habit, checkin }) => mapHabitToPseudoTask(habit, checkin));

    return [...completedTasksToday, ...completedHabitsToday];
  };

  // Get tasks for a specific goal completed on the selected date
  const getTasksForGoalOnDate = (goalId) => {
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    return tasks.filter(task => 
      task.goalIds && 
      task.goalIds.includes(goalId) && 
      task.completedAt && 
      task.completedAt.split('T')[0] === selectedDateStr
    );
  };

  // Get total hours logged for a goal (all time)
  const getTotalHoursForGoal = (goalId) => {
    const goalTasks = getTasksForGoal(goalId);
    return goalTasks.reduce((total, task) => {
      const duration = task.estimatedDuration || 0;
      return total + (duration / 60); // Convert minutes to hours
    }, 0);
  };

  // Get today's hours logged for a goal (tasks + completed habits)
  const getTodayHoursForGoal = (goalId) => {
    const todayTasks = getTodayTasksForGoal(goalId);
    const taskHours = todayTasks.reduce((total, task) => {
      const duration = task.estimatedDuration || 0;
      return total + duration / 60;
    }, 0);

    // Add completed habits for this goal
    const goalHabits = getHabitsForGoal(goalId);
    const habitHours = goalHabits.reduce((total, habit) => {
      if (isHabitCompletedToday(habit)) {
        const duration = habit.valueMin || 0;
        return total + duration / 60; // Convert minutes to hours
      }
      return total;
    }, 0);

    const totalHours = taskHours + habitHours;
    
    // Debug logging
    console.log(`🔍 Goal ${goalId} hours calculation:`, {
      goalId,
      taskHours,
      habitHours,
      totalHours,
      goalHabits: goalHabits.map(h => ({
        habit: h.habit,
        valueMin: h.valueMin,
        isCompleted: isHabitCompletedToday(h),
        checkins: h.checkins
      }))
    });

    return totalHours;
  };

  // Get hours logged for a goal on the selected date
  const getHoursForGoalOnDate = (goalId) => {
    const goalTasks = getTasksForGoalOnDate(goalId);
    const taskHours = goalTasks.reduce((total, task) => {
      const duration = task.estimatedDuration || 0;
      return total + (duration / 60); // Convert minutes to hours
    }, 0);

    // Add completed habits for this goal on the selected date
    const goalHabits = getHabitsForGoal(goalId);
    const selectedDateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const habitHours = goalHabits.reduce((total, habit) => {
      if (habit.checkins && Array.isArray(habit.checkins)) {
        const checkinForDate = habit.checkins.find(checkin => {
          const checkinDate = new Date(checkin.date);
          const checkinStr = checkinDate.toISOString().split('T')[0]; // YYYY-MM-DD format
          return checkinStr === selectedDateStr && checkin.completed;
        });
        
        if (checkinForDate) {
          const duration = habit.valueMin || 0;
          return total + duration / 60; // Convert minutes to hours
        }
      }
      return total;
    }, 0);

    return taskHours + habitHours;
  };


  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };


  // Load data on component mount
  useEffect(() => {
    if (user && token) {
      setLoading(true);
      setError(null);
      
      const loadAllData = async () => {
        try {
          await Promise.all([
            loadHabits(),
            loadGoals(),
            loadTasks()
          ]);
        } catch (err) {
          console.error('Error loading data:', err);
          setError('Failed to load data. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      
      loadAllData();
    }
  }, [user, token]);

  // Debug summary when tasks and goals are loaded
  useEffect(() => {
    if (tasks.length > 0 && goals.length > 0) {
      const totalTasks = tasks.length;
      const tasksWithGoals = tasks.filter(t => t.goalIds && t.goalIds.length > 0).length;
      const totalHours = tasks.reduce((sum, t) => sum + ((t.actualDuration || t.estimatedDuration || 0) / 60), 0);
    }
  }, [tasks, goals]);



  const dateComponents = formatDateComponents(selectedDate);

  // Show loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
            <Card className="h-full">
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E49C9] mx-auto mb-4"></div>
                  <p className="text-[#94A3B8]">Loading your goals and activities...</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
            <Card className="h-full">
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="text-[#FF6B6B] text-6xl mb-4">⚠️</div>
                  <p className="text-[#FF6B6B] text-lg mb-4">{error}</p>
                  <Button 
                    variant="primary" 
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Bento Grid Layout - Pinterest Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[minmax(200px,auto)] [&>*:nth-child(odd)]:animate-fade-in [&>*:nth-child(even)]:animate-fade-in-delayed">
        
        {/* Header Card - Full width */}
        <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
          <Card className="h-full">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#E8EEF2] font-oswald tracking-tight">
                  Goal-Aligned Day
                </h1>
                <p className="text-[#94A3B8] mt-2 text-lg">
                  Focus on your goals and daily activities
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowCreateGoalPopup(true)}
                  className="px-6 py-2"
                >
                  Add Goal
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Goals Cards */}
        {goals.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
            <Card className="h-full">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-[#E8EEF2] mb-2">
                  No goals found
                </h3>
                <p className="text-[#94A3B8] mb-6">
                  Create some goals to get started with your goal-aligned day!
                </p>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowCreateGoalPopup(true)}
                  className="px-6 py-2"
                >
                  Create Your First Goal
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          goals.map((goal, index) => {
            const goalTasks = getTodayTasksForGoal(goal._id);
            const goalActivities = getActivitiesForGoal(goal._id);
            return (
              <div key={goal._id || index} className="md:col-span-2 lg:col-span-3 xl:col-span-4">
                <Card className="h-full min-h-[500px] group relative hover:border-[rgba(255,255,255,0.3)] hover:shadow-lg hover:shadow-[#1E49C9]/20 transition-all duration-300">
                  
                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xl font-bold text-[#E8EEF2] truncate">
                        {goal.name}
                      </h4>
                      <Badge variant={goal.isActive ? "default" : "secondary"} className="text-xs px-3 py-1 flex-shrink-0">
                        {goal.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#94A3B8] leading-relaxed line-clamp-2">
                      {goal.description}
                    </p>
                  </div>

                  {/* Progress Section */}
                  <div className="mb-6 bg-[#11151A]/50 rounded-lg p-4 border border-[rgba(255,255,255,0.1)]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-[#E8EEF2]">Today's Progress</span>
                      <span className="text-lg font-bold text-[#1E49C9]">
                        {Math.round(getTodayHoursForGoal(goal._id) * 10) / 10}h / {goal.targetHours || 0}h
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-[#2A313A] rounded-full h-3 mb-3">
                      <div 
                        className="bg-gradient-to-r from-[#1E49C9] to-[#3EA6FF] h-3 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min((getTodayHoursForGoal(goal._id) / (goal.targetHours || 1)) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-sm text-[#94A3B8]">
                      <span>0h</span>
                      <span>{goal.targetHours || 0}h target</span>
                    </div>
                  </div>
                  
                  {/* Activities Section */}
                  {goalActivities.length > 0 && (
                    <div className="mb-6 flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-[#E8EEF2]">
                          Activities ({goalActivities.length})
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {goalActivities.slice(0, 6).map((activity, activityIndex) => (
                          <div key={activity._id || activityIndex} className="flex flex-col p-2 bg-[#11151A]/50 rounded-lg border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] transition-colors">
                            {/* Activity Header */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-[#1E49C9]">
                                {activity.type === 'habit' ? 'Habit' : 'Task'}
                              </span>
                              <span className="text-xs text-[#94A3B8] bg-[#2A313A] px-1 py-0.5 rounded text-[10px]">
                                {activity.duration}m
                              </span>
                            </div>
                            
                            {/* Activity Name */}
                            <div className="flex-1 mb-2">
                              <span className="text-xs text-[#E8EEF2] line-clamp-2 leading-tight">
                                {activity.displayName}
                              </span>
                            </div>
                            
                            {/* Action Button/Status */}
                            <div className="flex justify-center">
                              {activity.type === 'habit' ? (
                                activity.isCompleted || completedHabits.has(activity._id) ? (
                                  <div className="flex items-center gap-1 text-xs text-[#1E49C9] font-medium">
                                    <span className="text-[#1E49C9]">✓</span>
                                    <span>Done</span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleHabitComplete(activity)}
                                    disabled={completingHabits.has(activity._id)}
                                    className="text-xs px-2 py-1 bg-[#1E49C9]/10 border border-[#1E49C9]/30 text-[#1E49C9] rounded-md hover:bg-[#1E49C9]/20 hover:border-[#1E49C9]/50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                  >
                                    {completingHabits.has(activity._id) ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b border-[#1E49C9]"></div>
                                        <span>Marking...</span>
                                      </>
                                    ) : (
                                      'Mark'
                                    )}
                                  </button>
                                )
                              ) : (
                                <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                                  <span>{activity.isCompleted ? '✓' : '⏳'}</span>
                                  <span>{activity.isCompleted ? 'Done' : 'Pending'}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {goalActivities.length > 6 && (
                          <div className="col-span-2 text-xs text-[#94A3B8] text-center py-2 bg-[#11151A]/30 rounded">
                            +{goalActivities.length - 6} more activities
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                
                  {/* Action Buttons */}
                  <div className="mt-auto pt-4 border-t border-[rgba(255,255,255,0.1)]">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddTaskToGoal(goal)}
                        className="text-xs px-3 py-1 flex-1 border-[#1E49C9]/30 text-[#1E49C9] hover:bg-[#1E49C9]/10"
                      >
                        + Add Task
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddHabitToGoal(goal)}
                        className="text-xs px-3 py-1 flex-1 border-[#1E49C9]/30 text-[#1E49C9] hover:bg-[#1E49C9]/10"
                      >
                        + Add Habit
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })
        )}
      </div>

      {/* Create Habit Popup */}
      <CreateHabitPopup
        isOpen={showCreateHabitPopup}
        onClose={() => {
          setShowCreateHabitPopup(false);
          setSelectedGoalForHabit(null);
        }}
        onHabitCreated={handleHabitCreated}
        goals={goals}
        selectedGoal={selectedGoalForHabit}
      />

      {/* Create Goal Popup */}
      <CreateGoalPopup
        isOpen={showCreateGoalPopup}
        onClose={() => setShowCreateGoalPopup(false)}
        onGoalCreated={handleGoalCreated}
      />

      {/* Create Task Popup */}
      <CreateTaskPopup
        isOpen={showCreateTaskPopup}
        onClose={() => {
          setShowCreateTaskPopup(false);
          setSelectedGoalForTask(null);
        }}
        onTaskCreated={handleTaskCreated}
        goalId={selectedGoalForTask?._id}
        goalName={selectedGoalForTask?.name}
      />
    </div>
  );
};

export default GoalAlignedDay;


import React, { useState, useEffect, useCallback } from 'react';
import { Card, Section, Header, Button, Badge, MonthGrid } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { buildApiUrl } from '../config';
import MindfulnessCheckin from '../components/mindfulness/MindfulnessCheckin';
import { CreateHabitPopup } from '../components/habits';
import { CreateGoalPopup } from '../components/goals';
import { CreateTaskPopup } from '../components/tasks';

const GoalAlignedDay = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('mindfulness');
  const [timePeriod, setTimePeriod] = useState('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  
  const [tasks, setTasks] = useState([]);
  const [mindfulnessCheckins, setMindfulnessCheckins] = useState([]);
  const [showCreateHabitPopup, setShowCreateHabitPopup] = useState(false);
  const [showCreateGoalPopup, setShowCreateGoalPopup] = useState(false);
  const [showCreateTaskPopup, setShowCreateTaskPopup] = useState(false);
  const [selectedGoalForTask, setSelectedGoalForTask] = useState(null);
  const [selectedGoalForHabit, setSelectedGoalForHabit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mindfulnessSaveState, setMindfulnessSaveState] = useState(null);

  const tabs = [
    { id: 'mindfulness', label: 'Mindfulness', icon: '' },
    { id: 'habits', label: 'Habits', icon: '' },
    { id: 'goals', label: 'Goals', icon: '' }
  ];

  const timePeriods = [
    { id: 'day', label: 'Day', icon: '' },
    { id: 'month', label: 'Year', icon: '' }
  ];

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format date components separately
  const formatDateComponents = (date) => {
    return {
      day: date.getDate(),
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      month: date.toLocaleDateString('en-US', { month: 'long' }),
      year: date.getFullYear()
    };
  };

  // Get time period title
  const getTimePeriodTitle = () => {
    const dateComponents = formatDateComponents(selectedDate);
    
    switch (timePeriod) {
      case 'day':
        return `${dateComponents.dayName}, ${dateComponents.month} ${dateComponents.day}`;
      case 'month':
        return `${dateComponents.month} ${dateComponents.year}`;
      default:
        return formatDate(selectedDate);
    }
  };

  // Get time period subtitle
  const getTimePeriodSubtitle = () => {
    switch (timePeriod) {
      case 'day':
        return 'Your goal-aligned day planning';
      case 'month':
        return 'Monthly overview and planning';
      default:
        return 'Goal-aligned planning';
    }
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
      // Load ALL tasks by fetching all pages if needed
      let allTasks = [];
      let page = 1;
      let hasMorePages = true;
      
      while (hasMorePages) {
        const response = await fetch(buildApiUrl(`/api/tasks?limit=100&page=${page}`), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const tasksData = data.tasks || [];
          allTasks = [...allTasks, ...tasksData];
          
          // Check if there are more pages
          hasMorePages = page < data.totalPages;
          page++;
        } else {
          console.error('Error loading tasks page:', response.status);
          break;
        }
      }
      
      setTasks(allTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }, [token]);

  // Load user's mindfulness check-ins
  const loadMindfulnessCheckins = useCallback(async () => {
    try {
      const response = await fetch(buildApiUrl('/api/mindfulness'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMindfulnessCheckins(data || []);
      } else {
        console.error('❌ Response not ok:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ Error response body:', errorText);
      }
    } catch (error) {
      console.error('❌ Error loading mindfulness check-ins:', error);
      console.error('❌ Error details:', error.message);
    }
  }, [token]);

  // Handle time period change
  const handleTimePeriodChange = (period) => {
    setTimePeriod(period);
    // Reset to mindfulness tab when switching to day view
    if (period === 'day') {
      setActiveTab('mindfulness');
    }
  };

  // Handle mindfulness check-in completion
  const handleMindfulnessComplete = () => {
    loadMindfulnessCheckins();
  };

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
    setTasks(prev => [newTask, ...prev]);
  };

  // Handle opening task creation popup for a specific goal
  const handleAddTaskToGoal = (goal) => {
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
    today.setHours(0, 0, 0, 0);
    
    return habit.checkins.some(checkin => {
      const checkinDate = new Date(checkin.date);
      checkinDate.setHours(0, 0, 0, 0);
      return checkinDate.getTime() === today.getTime() && checkin.completed;
    });
  };

  // Handle habit completion
  const handleHabitComplete = async (habit) => {
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
        loadHabits();
        loadGoals();
      } else {
        console.error('❌ Failed to complete habit:', response.status);
      }
    } catch (error) {
      console.error('❌ Error completing habit:', error);
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

    return taskHours + habitHours;
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
    const selectedDateObj = new Date(selectedDate);
    selectedDateObj.setHours(0, 0, 0, 0);
    
    const habitHours = goalHabits.reduce((total, habit) => {
      if (habit.checkins && Array.isArray(habit.checkins)) {
        const checkinForDate = habit.checkins.find(checkin => {
          const checkinDate = new Date(checkin.date);
          checkinDate.setHours(0, 0, 0, 0);
          return checkinDate.getTime() === selectedDateObj.getTime() && checkin.completed;
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


  // Handle date selection from month grid
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setTimePeriod('day'); // Switch to day view when a date is selected
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
            loadTasks(),
            loadMindfulnessCheckins()
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


  const renderMindfulnessTab = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Mindfulness Check-in</h3>
        <p className="text-gray-600 mb-4">
          Take a moment to reflect on your mindfulness practice for {getTimePeriodTitle()}
        </p>
        <MindfulnessCheckin onCheckinComplete={handleMindfulnessComplete} />
      </Card>
    </div>
  );



  // Render unified day view with all three sections
  const renderUnifiedDayView = () => (
    <div className="space-y-8">
      {/* Mindfulness Section */}
      <div className="w-full">
        <MindfulnessCheckin 
          onCheckinComplete={handleMindfulnessComplete}
          goals={goals}
          getTodayTasksForGoal={getTodayTasksForGoal}
          getActivitiesForGoal={getActivitiesForGoal}
          getTodayHoursForGoal={getTodayHoursForGoal}
          onSaveStateChange={setMindfulnessSaveState}
        />
      </div>

      {/* Goals Section */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[#E8EEF2] font-oswald tracking-wide">
            Goals
          </h2>
          <Button variant="secondary" onClick={() => setShowCreateGoalPopup(true)}>
            Add Goal
          </Button>
        </div>
        
        {goals.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-[#C9D1D9]">No goals found. Create some goals to get started!</p>
            <Button variant="secondary" onClick={() => setShowCreateGoalPopup(true)} className="mt-3">
              Add Goal
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal, index) => {
              const goalTasks = getTodayTasksForGoal(goal._id);
              const goalActivities = getActivitiesForGoal(goal._id);
              return (
                <div 
                  key={goal._id || index} 
                  className="group relative bg-[rgba(0,0,0,0.2)] border border-[#3CCB7F]/30 rounded-xl p-6 hover:border-[#3CCB7F] hover:shadow-lg hover:shadow-[#3CCB7F]/20 transition-all duration-300 min-h-[350px] flex flex-col"
                >
                      
                      {/* Header */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xl font-bold text-[#E8EEF2]">
                            {goal.name}
                          </h4>
                          <Badge variant={goal.isActive ? "default" : "secondary"} className="text-xs px-3 py-1">
                            {goal.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#94A3B8] leading-relaxed">
                          {goal.description}
                        </p>
                      </div>
                          
                          {/* Progress Section */}
                          <div className="mb-6 bg-[#11151A]/50 rounded-lg p-4 border border-[#2A313A]">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-[#E8EEF2]">Today's Progress</span>
                              <span className="text-lg font-bold text-[#3CCB7F]">
                                {Math.round(getTodayHoursForGoal(goal._id) * 10) / 10}h / {goal.targetHours || 0}h
                              </span>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-[#2A313A] rounded-full h-3 mb-3">
                              <div 
                                className="bg-gradient-to-r from-[#3CCB7F] to-[#4ECDC4] h-3 rounded-full transition-all duration-500"
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
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {goalActivities.slice(0, 3).map((activity, activityIndex) => (
                                  <div key={activity._id || activityIndex} className="flex items-center justify-between p-2 bg-[#11151A]/50 rounded-lg border border-[#2A313A] hover:border-[#3CCB7F]/50 transition-colors">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <span className="text-sm">
                                        {activity.type === 'habit' ? 'Habit' : 'Task'}
                                      </span>
                                      <span className="text-xs text-[#E8EEF2] truncate">
                                        {activity.displayName}
                                      </span>
                                      <span className="text-xs text-[#94A3B8]">
                                        {activity.duration}m
                                      </span>
                                    </div>
                                    <div className="flex-shrink-0 ml-2">
                                      {activity.type === 'habit' ? (
                                        activity.isCompleted ? (
                                          <span className="text-xs text-[#3CCB7F] font-bold">
                                            ✅
                                          </span>
                                        ) : (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleHabitComplete(activity)}
                                            className="text-xs px-2 py-1 h-6"
                                          >
                                            Mark
                                          </Button>
                                        )
                                      ) : (
                                        <span className="text-xs text-[#94A3B8]">
                                          {activity.isCompleted ? '✅' : '⏳'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                {goalActivities.length > 3 && (
                                  <div className="text-xs text-[#94A3B8] text-center py-1">
                                    +{goalActivities.length - 3} more
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                      
                      {/* Action Buttons */}
                      <div className="mt-auto pt-4 border-t border-[#2A313A]">
                        <div className="flex gap-3">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddTaskToGoal(goal)}
                            className="text-sm px-4 py-2 flex-1"
                          >
                            + Add Task
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddHabitToGoal(goal)}
                            className="text-sm px-4 py-2 flex-1"
                          >
                            + Add Habit
                          </Button>
                        </div>
                      </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Check-in Button */}
      {mindfulnessSaveState && (
        <div className="w-full">
          <div className="flex justify-center">
            <Button
              onClick={mindfulnessSaveState.saveCheckin}
              disabled={mindfulnessSaveState.saving || !mindfulnessSaveState.canSave}
              loading={mindfulnessSaveState.saving}
              size="lg"
              className="min-w-[200px]"
            >
              {mindfulnessSaveState.canSave ? 'Check-in' : 'Rate All Dimensions First'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const dateComponents = formatDateComponents(selectedDate);

  // Show loading state
  if (loading) {
    return (
      <Section>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading your goals and activities...</p>
          </div>
        </div>
      </Section>
    );
  }

  // Show error state
  if (error) {
    return (
      <Section>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-status-error text-6xl mb-4">⚠️</div>
            <p className="text-status-error text-lg mb-4">{error}</p>
            <Button 
              variant="primary" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Header level={1} className="tracking-tight">Goal-Aligned Day</Header>
        </div>
        
        {/* Time Period Segmented Buttons */}
        <div className="flex space-x-1 bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-1 shadow-lg">
          {timePeriods.map((period) => (
            <button
              key={period.id}
              onClick={() => handleTimePeriodChange(period.id)}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                timePeriod === period.id
                  ? 'bg-[#1E49C9] text-white shadow-lg scale-105'
                  : 'text-[#94A3B8] hover:text-[#E8EEF2] hover:bg-[#2A313A]'
              }`}
            >
              <span className="text-lg">{period.icon}</span>
              <span>{period.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content based on time period */}
      {timePeriod === 'day' ? (
        // Show unified day view
        renderUnifiedDayView()
      ) : (
        // Show month view with calendar grid
        <div className="space-y-8">
          {/* Month Grid Calendar */}
          <Card variant="elevated">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-[#E8EEF2]">Monthly Overview</h3>
              <p className="text-[#94A3B8] mt-2">Click on any day to switch to day view</p>
            </div>
            <div className="bg-[#1E2330] border border-[#2A313A] rounded-lg p-4">
              {/* Debug info */}
              <div className="mb-4 p-3 bg-[#11151A] rounded-lg border border-[#2A313A]">
                <p className="text-sm text-[#94A3B8]">
                  Debug: Selected Date: {selectedDate.toDateString()}, 
                  Habits: {habits.length}, 
                  Goals: {goals.length}, 
                  Mindfulness: {mindfulnessCheckins.length}
                </p>
              </div>
              
              {/* Validate data before passing to MonthGrid */}
              {(() => {
                // Validate selectedDate
                if (!selectedDate || !(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
                  console.error('GoalAlignedDay: Invalid selectedDate', selectedDate);
                  return (
                    <div className="text-center py-8 text-red-500">
                      Error: Invalid selected date
                    </div>
                  );
                }

                // Validate mindfulnessCheckins
                if (!Array.isArray(mindfulnessCheckins)) {
                  console.error('GoalAlignedDay: mindfulnessCheckins is not an array', mindfulnessCheckins);
                  return (
                    <div className="text-center py-8 text-red-500">
                      Error: Invalid mindfulness data
                    </div>
                  );
                }

                // Validate habits
                if (!Array.isArray(habits)) {
                  console.error('GoalAlignedDay: habits is not an array', habits);
                  return (
                    <div className="text-center py-8 text-red-500">
                      Error: Invalid habits data
                    </div>
                  );
                }

                // Validate goals
                if (!Array.isArray(goals)) {
                  console.error('GoalAlignedDay: goals is not an array', goals);
                  return (
                    <div className="text-center py-8 text-red-500">
                      Error: Invalid goals data
                    </div>
                  );
                }

                // Filter out invalid mindfulness check-ins
                const validMindfulnessCheckins = mindfulnessCheckins.filter(checkin => {
                  if (!checkin || !checkin.date) {
                    console.warn('GoalAlignedDay: Invalid mindfulness checkin', checkin);
                    return false;
                  }
                  return true;
                });

                return mindfulnessCheckins.length > 0 ? (
                  <MonthGrid
                    selectedDate={selectedDate}
                    habits={habits}
                    goals={goals}
                    mindfulnessCheckins={validMindfulnessCheckins}
                    onDateSelect={handleDateSelect}
                    onMonthChange={setSelectedDate}
                  />
                ) : (
                <div className="text-center py-8">
                  <div className="text-[#94A3B8] mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002 2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-[#94A3B8] text-lg mb-2">No mindfulness data yet</p>
                  <p className="text-[#64748B] mb-4">Complete your first mindfulness check-in to see your activity grid</p>
                  <Button 
                    onClick={() => setTimePeriod('day')}
                    className="bg-gradient-to-r from-[#3CCB7F] to-[#4ECDC4] text-white px-4 py-2 rounded-lg hover:from-[#3CCB7F]/90 hover:to-[#4ECDC4]/90"
                  >
                    Start Mindfulness Check-in
                  </Button>
                </div>
              );
            })()}
            </div>
          </Card>


          {/* Goals Table */}
          <Card variant="elevated">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-[#E8EEF2]">Annual Goals Progress</h3>
              <p className="text-[#C9D1D9] mt-2">Track your goal progress based on total hours invested vs annual targets</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2A313A]">
                    <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Goal</th>
                    <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Daily Target</th>
                    <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Tasks</th>
                    <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Hours Logged</th>
                    <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Progress</th>
                    <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {goals.filter(goal => goal.isActive !== false).map((goal, index) => {
                    const currentYear = new Date().getFullYear();
                    
                    // Get ALL tasks for this goal (regardless of status or year)
                    const allGoalTasks = tasks.filter(task => {
                      const hasGoalIds = task.goalIds && Array.isArray(task.goalIds);
                      const includesGoal = hasGoalIds && task.goalIds.some(id => id === goal._id || id.toString() === goal._id.toString());
                      
                      return includesGoal;
                    });
                    
                    // Get completed tasks for this goal in current year (for display purposes)
                    const completedGoalTasksThisYear = allGoalTasks.filter(task => {
                      const isCompleted = task.status === 'completed';
                      const hasCompletedAt = task.completedAt;
                      const isCurrentYear = hasCompletedAt && new Date(task.completedAt).getFullYear() === currentYear;
                      
                      return isCompleted && isCurrentYear;
                    });
                    
                    // Calculate total hours logged from ALL tasks for this goal
                    const taskHours = allGoalTasks.reduce((sum, task) => {
                      // Use actual duration if available, otherwise fall back to estimated duration
                      const duration = task.actualDuration || task.estimatedDuration || 0;
                      return sum + (duration / 60); // Convert minutes to hours
                    }, 0);

                    // Add completed habits for this goal this year
                    const goalHabits = getHabitsForGoal(goal._id);
                    const habitHours = goalHabits.reduce((sum, habit) => {
                      if (habit.checkins && Array.isArray(habit.checkins)) {
                        const completedThisYear = habit.checkins.filter(checkin => {
                          const checkinDate = new Date(checkin.date);
                          return checkin.completed && checkinDate.getFullYear() === currentYear;
                        });
                        
                        const habitDuration = completedThisYear.reduce((total, checkin) => {
                          return total + (habit.valueMin || 0) / 60; // Convert minutes to hours
                        }, 0);
                        
                        return sum + habitDuration;
                      }
                      return sum;
                    }, 0);

                    const totalHours = taskHours + habitHours;
                    
                    // Get last activity date from all tasks (use createdAt if completedAt is not available)
                    const lastActivity = allGoalTasks.length > 0 
                      ? new Date(Math.max(...allGoalTasks.map(t => {
                          const activityDate = t.completedAt || t.createdAt || t.start;
                          return new Date(activityDate);
                        })))
                      : null;
                    
                    const lastActivityStr = lastActivity ? lastActivity.toLocaleDateString() : 'No activity';
                    
                    // Calculate progress based on hours logged vs annual target hours
                    // Assuming daily target hours * 365 days for annual target
                    const annualTargetHours = goal.targetHours * 365;
                    let progress = 0;
                    
                    if (annualTargetHours > 0) {
                      progress = Math.min(100, Math.round((totalHours / annualTargetHours) * 100));
                    } else if (allGoalTasks.length > 0) {
                      // Fallback: if no target hours set but tasks exist, show some progress
                      progress = Math.min(100, allGoalTasks.length * 10); // 10% per task as fallback
                    }
                    
                    return (
                      <tr key={goal._id || index} className="border-b border-[#2A313A] hover:bg-[#1A1F2E] transition-colors">
                        <td className="py-3 px-4 text-[#E8EEF2] font-medium">{goal.name}</td>
                        <td className="py-3 px-4 text-[#C9D1D9]">
                          <Badge variant={goal.isActive ? "default" : "secondary"} size="sm">
                            {goal.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-[#C9D1D9]">
                          {goal.targetHours > 0 ? `${goal.targetHours}h/day` : 'Not set'}
                        </td>
                        <td className="py-3 px-4 text-[#C9D1D9]">
                          <div className="flex flex-col">
                            <span className="text-sm">{completedGoalTasksThisYear.length} this year</span>
                            <span className="text-xs text-[#94A3B8]">{allGoalTasks.length} total</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#C9D1D9]">{totalHours.toFixed(1)}h</td>
                        <td className="py-3 px-4 text-[#C9D1D9]">
                          <div className="flex items-center gap-2">
                            <span>{progress}%</span>
                            <div className="w-20 bg-[#2A313A] rounded-full h-2">
                              <div 
                                className="bg-[#0EA5E9] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-[#94A3B8]">
                              {annualTargetHours > 0 
                                ? `${totalHours.toFixed(1)}h / ${annualTargetHours.toFixed(1)}h`
                                : `${totalHours.toFixed(1)}h logged`
                              }
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#C9D1D9]">{lastActivityStr}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

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
    </Section>
  );
};

export default GoalAlignedDay;

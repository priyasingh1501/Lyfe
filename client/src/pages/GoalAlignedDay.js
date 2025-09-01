
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
  
  // Debug mindfulness check-ins state changes
  useEffect(() => {
    console.log('🔄 mindfulnessCheckins state updated:', mindfulnessCheckins);
    console.log('🔄 mindfulnessCheckins length:', mindfulnessCheckins.length);
  }, [mindfulnessCheckins]);
  const [showCreateHabitPopup, setShowCreateHabitPopup] = useState(false);
  const [showCreateGoalPopup, setShowCreateGoalPopup] = useState(false);
  const [showCreateTaskPopup, setShowCreateTaskPopup] = useState(false);
  const [selectedGoalForTask, setSelectedGoalForTask] = useState(null);

  const tabs = [
    { id: 'mindfulness', label: 'Mindfulness', icon: '' },
    { id: 'habits', label: 'Habits', icon: '' },
    { id: 'goals', label: 'Goals', icon: '' }
  ];

  const timePeriods = [
    { id: 'day', label: 'Day', icon: '📅' },
    { id: 'month', label: 'Month', icon: '📆' }
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
        console.log('Loaded habits:', data);
        // Show all habits, including completed ones
        setHabits(data || []);
      }
    } catch (error) {
      console.error('Error loading habits:', error);
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
      }
    } catch (error) {
      console.error('Error loading goals:', error);
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
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }, [token]);

  // Load user's mindfulness check-ins
  const loadMindfulnessCheckins = useCallback(async () => {
    console.log('🔄 loadMindfulnessCheckins called...');
    console.log('🔄 Token:', token ? 'Present' : 'Missing');
    console.log('🔄 API URL:', buildApiUrl('/api/mindfulness'));
    
    try {
      const response = await fetch(buildApiUrl('/api/mindfulness'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('🔄 Response status:', response.status);
      console.log('🔄 Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Mindfulness data fetched:', data);
        console.log('📊 Data length:', data?.length || 0);
        console.log('📊 Data type:', typeof data);
        console.log('📊 Is array:', Array.isArray(data));
        
        if (Array.isArray(data)) {
          console.log('📊 First item:', data[0]);
          if (data[0]) {
            console.log('📊 First item date:', data[0].date);
            console.log('📊 First item totalScore:', data[0].totalScore);
          }
        }
        
        setMindfulnessCheckins(data || []);
        console.log('🔄 State updated with:', data || []);
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
    console.log('🔄 handleMindfulnessComplete called - refreshing data...');
    // Reload mindfulness check-ins to update the calendar
    loadMindfulnessCheckins();
    console.log('Mindfulness check-in completed');
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

  // Get tasks for a specific goal (both completed and pending)
  const getTasksForGoal = (goalId) => {
    return tasks.filter(task => 
      task.goalIds && 
      task.goalIds.includes(goalId)
    );
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

  // Get hours logged for a goal on the selected date
  const getHoursForGoalOnDate = (goalId) => {
    const goalTasks = getTasksForGoalOnDate(goalId);
    return goalTasks.reduce((total, task) => {
      const duration = task.estimatedDuration || 0;
      return total + (duration / 60); // Convert minutes to hours
    }, 0);
  };

  // Handle date selection from month grid
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setTimePeriod('day'); // Switch to day view when a date is selected
  };

  // Handle marking habit as complete
  const handleMarkComplete = async (habitId) => {
    try {
      console.log('Marking habit as complete:', habitId);
      
      const response = await fetch(buildApiUrl(`/api/habits/${habitId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isCompleted: true,
          completedDate: new Date().toISOString()
        })
      });

      if (response.ok) {
        const updatedHabit = await response.json();
        console.log('Habit updated successfully:', updatedHabit);
        
        // Update the habit status to completed in the list
        setHabits(prev => {
          const updated = prev.map(habit => 
            habit._id === habitId 
              ? { 
                  ...habit, 
                  isCompleted: true, 
                  completedDate: new Date().toISOString(),
                  // Ensure the habit stays active even when completed
                  isActive: true
                }
              : habit
          );
          console.log('Updated habits list:', updated);
          return updated;
        });
      } else {
        console.error('Error marking habit as complete');
      }
    } catch (error) {
      console.error('Error marking habit as complete:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (user && token) {
      loadHabits();
      loadGoals();
      loadTasks();
      loadMindfulnessCheckins();
    }
  }, [user, token, loadHabits, loadGoals, loadTasks, loadMindfulnessCheckins]);

  // Comic-themed habit card renderer
  const renderHabitCard = (habit, index) => (
    <div 
      key={habit._id || index} 
      className={`group relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:rotate-1 ${
        habit.isCompleted 
          ? 'bg-gradient-to-br from-[#1A1F2E] to-[#2A313A] border-2 border-[#3CCB7F] shadow-[0_0_20px_rgba(60,203,127,0.3)]' 
          : 'bg-gradient-to-br from-[#1E2330] to-[#2A313A] border-2 border-[#2A313A] hover:border-[#3CCB7F] hover:shadow-[0_0_20px_rgba(60,203,127,0.2)]'
      }`}
      style={{ 
        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
        transform: `translateY(${index * 2}px)`
      }}
    >
      {/* Comic Panel Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-2 left-2 w-8 h-8 border-2 border-[#3CCB7F] rounded-full"></div>
        <div className="absolute top-4 right-4 w-4 h-4 border border-[#3CCB7F] rotate-45"></div>
        <div className="absolute bottom-4 left-4 w-6 h-6 border border-[#3CCB7F] rounded-full"></div>
      </div>

      {/* Speech Bubble Effect */}
      <div className="relative p-6">
        {/* Speech Bubble Tail */}
        <div className="absolute -left-2 top-8 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-[#2A313A] border-b-8 border-b-transparent"></div>
        
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Comic Title with Impact Effect */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <h4 className={`text-lg font-bold tracking-wider ${
                  habit.isCompleted ? 'text-[#3CCB7F]' : 'text-[#E8EEF2]'
                }`}>
                  {habit.habit}
                </h4>
                {/* Comic Impact Lines */}
                <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-[#3CCB7F] opacity-60"></div>
                <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-[#3CCB7F] opacity-60"></div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs px-3 py-1 rounded-full border-2">
                  {habit.quality}
                </Badge>
                {habit.isCompleted && (
                  <Badge variant="success" className="text-xs px-3 py-1 rounded-full border-2 animate-pulse">
                    ✨ Completed ✨
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Comic Info Panels */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#11151A]/50 p-3 rounded-lg border border-[#2A313A]">
                <p className="flex items-center gap-2 text-sm text-[#C9D1D9]">
                  <span className="text-[#3CCB7F] text-lg">⏱️</span>
                  <span className="text-[#94A3B8]">Duration:</span>
                  <span className="font-bold text-[#E8EEF2]">{habit.valueMin} min</span>
                </p>
              </div>
              <div className="bg-[#11151A]/50 p-3 rounded-lg border border-[#2A313A]">
                <p className="flex items-center gap-2 text-sm text-[#C9D1D9]">
                  <span className="text-[#3CCB7F] text-lg">📅</span>
                  <span className="text-[#94A3B8]">Started:</span>
                  <span className="font-bold text-[#E8EEF2]">{new Date(habit.date).toLocaleDateString()}</span>
                </p>
              </div>
            </div>
            
            {habit.completedDate && (
              <div className="bg-[#3CCB7F]/10 p-3 rounded-lg border border-[#3CCB7F]/30 mb-3">
                <p className="flex items-center gap-2 text-sm text-[#3CCB7F]">
                  <span className="text-lg">🎉</span>
                  <span>Completed on: {new Date(habit.completedDate).toLocaleDateString()}</span>
                </p>
              </div>
            )}
            
            {habit.endDate && (
              <div className="bg-[#11151A]/50 p-3 rounded-lg border border-[#2A313A] mb-3">
                <p className="flex items-center gap-2 text-sm text-[#C9D1D9]">
                  <span className="text-[#94A3B8] text-lg">🏁</span>
                  <span className="text-[#94A3B8]">End Date:</span>
                  <span className="font-bold text-[#E8EEF2]">{new Date(habit.endDate).toLocaleDateString()}</span>
                </p>
              </div>
            )}
            
            {habit.notes && (
              <div className="bg-[#11151A]/30 p-3 rounded-lg border-l-4 border-l-[#3CCB7F]">
                <p className="text-sm text-[#94A3B8] italic">💭 "{habit.notes}"</p>
              </div>
            )}
          </div>
          
          {/* Action Button with Comic Style */}
          <div className="ml-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            {habit.isCompleted ? (
              <Button 
                variant="outline" 
                size="sm"
                disabled
                className="bg-[#3CCB7F]/20 border-2 border-[#3CCB7F] text-[#3CCB7F] rounded-full px-4 py-2 cursor-not-allowed shadow-lg"
              >
                ✨ Done! ✨
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleMarkComplete(habit._id)}
                className="bg-gradient-to-r from-[#3CCB7F] to-[#4ECDC4] border-2 border-[#3CCB7F] text-white rounded-full px-4 py-2 hover:from-[#3CCB7F]/90 hover:to-[#4ECDC4]/90 hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-[0_0_20px_rgba(60,203,127,0.4)]"
              >
                🚀 Complete!
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

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

  const renderHabitsTab = () => (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Habit Tracking</h3>
          <Button onClick={() => setShowCreateHabitPopup(true)}>
            Create Habit
          </Button>
        </div>
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg mb-2">No habits found</p>
            <p className="text-gray-500 mb-4">Create some habits to start building positive routines</p>
            <Button onClick={() => setShowCreateHabitPopup(true)}>
              Create Habit
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Debug info */}
            <div className="mb-4 p-3 bg-[#11151A] rounded-lg border border-[#2A313A]">
              <p className="text-sm text-[#94A3B8]">
                Debug: Total habits: {habits.length}, 
                Completed: {habits.filter(h => h.isCompleted).length}, 
                Active: {habits.filter(h => h.isActive !== false).length}
              </p>
              <p className="text-sm text-[#94A3B8] mt-2">
                Tasks: {tasks.length}, Goals: {goals.length}
              </p>
              <p className="text-sm text-[#94A3B8] mt-2">
                Tasks with goals: {tasks.filter(t => t.goalIds && t.goalIds.length > 0).length}
              </p>
            </div>
            
            {habits
              .filter(habit => habit.isActive !== false || habit.isCompleted) // Show active habits OR completed habits
              .map((habit, index) => {
                console.log('Rendering habit in habits tab:', habit);
                return renderHabitCard(habit, index);
              })}
          </div>
        )}
      </Card>
    </div>
  );

  const renderGoalsTab = () => (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Goal Progress</h3>
          <Button onClick={() => setShowCreateGoalPopup(true)}>
            Add Goal
          </Button>
        </div>
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No goals found. Create some goals to get started!</p>
            <Button onClick={() => setShowCreateGoalPopup(true)} className="mt-3">
              Add Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal, index) => {
              const goalTasks = getTasksForGoal(goal._id);
              return (
                <div key={goal._id || index} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{goal.name}</h4>
                    <Badge variant={goal.isActive ? "default" : "secondary"}>
                      {goal.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{goal.description}</p>
                  
                  {/* Tasks for this goal */}
                  {goalTasks.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Tasks completed today:</h5>
                      <div className="space-y-2">
                        {goalTasks.map((task, taskIndex) => (
                          <div key={task._id || taskIndex} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{task.title}</p>
                              <p className="text-xs text-gray-600">
                                {task.estimatedDuration} min
                              </p>
                            </div>
                            <Badge variant={task.status === 'completed' ? 'success' : 'secondary'} className="text-xs">
                              {task.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddTaskToGoal(goal)}
                    >
                      Add Task
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );

  // Render unified day view with all three sections
  const renderUnifiedDayView = () => (
    <div className="space-y-8">
      {/* Mindfulness Section */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🧘</span>
          <h3 className="text-xl font-semibold">Mindfulness Check-in</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Take a moment to reflect on your mindfulness practice for today
        </p>
        <MindfulnessCheckin onCheckinComplete={handleMindfulnessComplete} />
      </Card>

      {/* Habits Section */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <h3 className="text-xl font-semibold">Daily Habits</h3>
          </div>
          <Button onClick={() => setShowCreateHabitPopup(true)}>
            Create Habit
          </Button>
        </div>
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg mb-2">No habits found</p>
            <p className="text-gray-500 mb-4">Create some habits to start building positive routines</p>
            <Button onClick={() => setShowCreateHabitPopup(true)}>
              Create Habit
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Debug info */}
            <div className="mb-4 p-3 bg-[#11151A] rounded-lg border border-[#2A313A]">
              <p className="text-sm text-[#94A3B8]">
                Debug: Total habits: {habits.length}, 
                Completed: {habits.filter(h => h.isCompleted).length}, 
                Active: {habits.filter(h => h.isActive !== false).length}
              </p>
              <p className="text-sm text-[#94A3B8] mt-2">
                Tasks: {tasks.length}, Goals: {goals.length}
              </p>
              <p className="text-sm text-[#94A3B8] mt-2">
                Tasks with goals: {tasks.filter(t => t.goalIds && t.goalIds.length > 0).length}
              </p>
            </div>
            
            {habits
              .filter(habit => habit.isActive !== false || habit.isCompleted) // Show active habits OR completed habits
              .map((habit, index) => {
                console.log('Rendering habit in unified view:', habit);
                return renderHabitCard(habit, index);
              })}
          </div>
        )}
      </Card>

      {/* Goals Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <h3 className="text-xl font-semibold">Goal Progress</h3>
          </div>
          <Button onClick={() => setShowCreateGoalPopup(true)}>
            Add Goal
          </Button>
        </div>
        
        {/* Debug info for tasks */}
        <div className="mb-4 p-3 bg-[#11151A]/30 rounded-lg border border-[#2A313A]">
          <p className="text-xs text-[#94A3B8] mb-2">
            <strong>Task Debug:</strong> Total: {tasks.length}, With goals: {tasks.filter(t => t.goalIds && t.goalIds.length > 0).length}
          </p>
          {tasks.filter(t => t.goalIds && t.goalIds.length > 0).map((task, index) => (
            <div key={index} className="text-xs text-[#94A3B8] mb-1">
              • {task.title} → Goals: {task.goalIds.join(', ')} ({task.estimatedDuration}min)
            </div>
          ))}
        </div>
        {goals.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-[#C9D1D9]">No goals found. Create some goals to get started!</p>
            <Button onClick={() => setShowCreateGoalPopup(true)} className="mt-3">
              Add Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal, index) => {
              const goalTasks = getTasksForGoal(goal._id);
              return (
                <div 
                  key={goal._id || index} 
                  className="group relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:rotate-1"
                  style={{ 
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                    transform: `translateY(${index * 2}px)`
                  }}
                >
                  {/* Comic Panel Background */}
                  <div className={`p-6 ${
                    goal.isActive 
                      ? 'bg-gradient-to-br from-[#1E2330] to-[#2A313A] border-2 border-[#3CCB7F] shadow-[0_0_20px_rgba(60,203,127,0.2)]' 
                      : 'bg-gradient-to-br from-[#1E2330] to-[#2A313A] border-2 border-[#2A313A] opacity-75'
                  }`}>
                    
                    {/* Comic Panel Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-2 left-2 w-8 h-8 border-2 border-[#3CCB7F] rounded-full"></div>
                      <div className="absolute top-4 right-4 w-4 h-4 border border-[#3CCB7F] rotate-45"></div>
                      <div className="absolute bottom-4 left-4 w-6 h-6 border border-[#3CCB7F] rounded-full"></div>
                    </div>

                    {/* Speech Bubble Effect */}
                    <div className="relative">
                      {/* Speech Bubble Tail */}
                      <div className="absolute -left-2 top-8 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-[#2A313A] border-b-8 border-b-transparent"></div>
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          {/* Comic Title with Impact Effect */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="relative">
                              <h4 className={`text-lg font-bold tracking-wider ${
                                goal.isActive ? 'text-[#E8EEF2]' : 'text-[#94A3B8]'
                              }`}>
                                🎯 {goal.name}
                              </h4>
                              {/* Comic Impact Lines */}
                              <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-[#3CCB7F] opacity-60"></div>
                              <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-[#3CCB7F] opacity-60"></div>
                            </div>
                            
                            <Badge variant={goal.isActive ? "default" : "secondary"} className="text-xs px-3 py-1 rounded-full border-2 animate-pulse">
                              {goal.isActive ? "🚀 Active" : "⏸️ Inactive"}
                            </Badge>
                          </div>
                          
                          {/* Goal Description */}
                          <div className="bg-[#11151A]/50 p-3 rounded-lg border border-[#2A313A] mb-4">
                            <p className="text-sm text-[#C9D1D9] italic">💭 "{goal.description}"</p>
                          </div>
                          
                          {/* Goal Progress Information - Comic Style */}
                          <div className="mb-4 p-4 bg-[#11151A] border-2 border-[#2A313A] rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-[#E8EEF2] flex items-center gap-2">
                                <span className="text-lg">🎯</span>
                                Daily Target
                              </span>
                              <span className="text-sm text-[#3CCB7F] font-bold text-lg">{goal.targetHours || 0} hours</span>
                            </div>
                            
                            {/* Animated Progress Bar */}
                            <div className="w-full bg-[#2A313A] rounded-full h-3 mb-3 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-[#3CCB7F] to-[#4ECDC4] h-3 rounded-full transition-all duration-1000 ease-out shadow-lg"
                                style={{ 
                                  width: `${Math.min((getTotalHoursForGoal(goal._id) / (goal.targetHours || 1)) * 100, 100)}%` 
                                }}
                              >
                                {/* Progress Bar Shine Effect */}
                                <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                              </div>
                            </div>
                            
                            {/* Progress Details in Comic Panels */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="bg-[#3CCB7F]/10 p-2 rounded-lg border border-[#3CCB7F]/30">
                                <span className="text-xs text-[#3CCB7F] font-bold">
                                  ✅ {Math.round(getTotalHoursForGoal(goal._id) * 10) / 10} hours
                                </span>
                              </div>
                              <div className="bg-[#11151A]/50 p-2 rounded-lg border border-[#2A313A]">
                                <span className="text-xs text-[#94A3B8] font-bold">
                                  ⏳ {Math.max((goal.targetHours || 0) - getTotalHoursForGoal(goal._id), 0)} hours
                                </span>
                              </div>
                            </div>
                            
                            {/* Today's Progress */}
                            <div className="border-t border-[#2A313A] pt-3">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[#94A3B8]">📅 Today's Progress:</span>
                                <span className="text-[#E8EEF2] font-bold">
                                  {Math.round(getHoursForGoalOnDate(goal._id) * 10) / 10} hours
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Tasks for this goal - Comic Style */}
                          {goalTasks.length > 0 && (
                            <div className="mb-4">
                              <h5 className="text-sm font-medium text-[#E8EEF2] mb-3 flex items-center gap-2">
                                <span className="text-lg">📋</span>
                                Tasks for this goal ({goalTasks.length}):
                              </h5>
                              <div className="space-y-2">
                                {goalTasks.map((task, taskIndex) => (
                                  <div key={task._id || taskIndex} className="flex items-center justify-between p-3 border-2 border-[#2A313A] rounded-lg bg-[#11151A] hover:bg-[#1A1F2E] hover:border-[#3CCB7F] transition-all duration-200 group/task">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-[#E8EEF2] group-hover/task:text-[#3CCB7F] transition-colors">
                                        {task.title}
                                      </p>
                                      <p className="text-xs text-[#94A3B8]">
                                        ⏱️ {task.estimatedDuration} min
                                      </p>
                                    </div>
                                    <Badge variant={task.status === 'completed' ? 'success' : 'secondary'} className="text-xs px-2 py-1 rounded-full border-2">
                                      {task.status === 'completed' ? '✨ Done!' : '🔄 In Progress'}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Debug info for tasks */}
                          <div className="mb-4 p-3 bg-[#11151A]/30 rounded-lg border border-[#2A313A]">
                            <p className="text-xs text-[#94A3B8]">
                              Debug: Goal ID: {goal._id}, Total tasks: {goalTasks.length}, 
                              Total hours: {Math.round(getTotalHoursForGoal(goal._id) * 10) / 10}h, 
                              Today: {Math.round(getHoursForGoalOnDate(goal._id) * 10) / 10}h
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons with Comic Style */}
                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddTaskToGoal(goal)}
                          className="bg-gradient-to-r from-[#3CCB7F] to-[#4ECDC4] border-2 border-[#3CCB7F] text-white rounded-full px-4 py-2 hover:from-[#3CCB7F]/90 hover:to-[#4ECDC4]/90 hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-[0_0_20px_rgba(60,203,127,0.4)]"
                        >
                          🚀 Add Task
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-[#11151A] border-2 border-[#2A313A] text-[#E8EEF2] rounded-full px-4 py-2 hover:bg-[#2A313A] hover:border-[#3CCB7F] hover:scale-110 transition-all duration-200"
                        >
                          👁️ View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );

  const dateComponents = formatDateComponents(selectedDate);

  return (
    <Section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Header level={1}>Goal-Aligned Day</Header>
          <p className="text-gray-600 mt-2">
            Track your daily choices and see how they align with your health goals
          </p>
        </div>
        
        {/* Time Period Segmented Buttons */}
        <div className="flex space-x-1 bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-1 shadow-lg">
          {timePeriods.map((period) => (
            <button
              key={period.id}
              onClick={() => handleTimePeriodChange(period.id)}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
                timePeriod === period.id
                  ? 'bg-gradient-to-r from-[#3CCB7F] to-[#4ECDC4] text-white shadow-lg scale-105'
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
              
              {mindfulnessCheckins.length > 0 ? (
                <MonthGrid
                  selectedDate={selectedDate}
                  habits={habits}
                  goals={goals}
                  mindfulnessCheckins={mindfulnessCheckins}
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
              )}
            </div>
          </Card>

          {/* Habits Table */}
          <Card variant="elevated">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-[#E8EEF2]">Annual Habits Progress</h3>
              <p className="text-[#C9D1D9] mt-2">Track your habit completion throughout the year</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2A313A]">
                    <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Habit</th>
                    <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Quality</th>
                    <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Duration</th>
                    <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Days Completed</th>
                    <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Completion Rate</th>
                    <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Last Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {habits.filter(habit => habit.isActive !== false).map((habit, index) => {
                    const currentYear = new Date().getFullYear();
                    const habitStartDate = new Date(habit.date);
                    const daysInYear = Math.min(
                      Math.ceil((new Date() - habitStartDate) / (1000 * 60 * 60 * 24)),
                      new Date(currentYear, 11, 31) - new Date(currentYear, 0, 1)
                    );
                    
                    // Count completed days in the current year
                    const completedDays = habits.filter(h => 
                      h._id === habit._id && 
                      h.isCompleted && 
                      h.completedDate && 
                      new Date(h.completedDate).getFullYear() === currentYear
                    ).length;
                    
                    const completionRate = daysInYear > 0 ? Math.round((completedDays / daysInYear) * 100) : 0;
                    const lastCompleted = habit.completedDate ? new Date(habit.completedDate).toLocaleDateString() : 'Never';
                    
                    return (
                      <tr key={habit._id || index} className="border-b border-[#2A313A] hover:bg-[#1A1F2E] transition-colors">
                        <td className="py-3 px-4 text-[#E8EEF2] font-medium">{habit.habit}</td>
                        <td className="py-3 px-4 text-[#C9D1D9]">
                          <Badge variant="secondary" size="sm">{habit.quality}</Badge>
                        </td>
                        <td className="py-3 px-4 text-[#C9D1D9]">{habit.valueMin} min</td>
                        <td className="py-3 px-4 text-[#C9D1D9]">{completedDays}</td>
                        <td className="py-3 px-4 text-[#C9D1D9]">
                          <div className="flex items-center gap-2">
                            <span>{completionRate}%</span>
                            <div className="w-20 bg-[#2A313A] rounded-full h-2">
                              <div 
                                className="bg-[#3CCB7F] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${completionRate}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#C9D1D9]">{lastCompleted}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Goals Table */}
          <Card variant="elevated">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-[#E8EEF2]">Annual Goals Progress</h3>
              <p className="text-[#C9D1D9] mt-2">Track your goal progress and task completion</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2A313A]">
                    <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Goal</th>
                    <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Tasks Completed</th>
                    <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Hours Logged</th>
                    <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Progress</th>
                    <th className="text-left py-3 px-4 text-[#94A3B8] font-medium">Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {goals.filter(goal => goal.isActive !== false).map((goal, index) => {
                    const currentYear = new Date().getFullYear();
                    
                    // Get tasks for this goal completed in the current year
                    const goalTasks = tasks.filter(task => 
                      task.goalIds && 
                      task.goalIds.includes(goal._id) && 
                      task.status === 'completed' &&
                      task.completedAt &&
                      new Date(task.completedAt).getFullYear() === currentYear
                    );
                    
                    // Calculate total hours logged
                    const totalHours = goalTasks.reduce((sum, task) => {
                      const duration = task.estimatedDuration || 0;
                      return sum + (duration / 60); // Convert minutes to hours
                    }, 0);
                    
                    // Get last activity date
                    const lastActivity = goalTasks.length > 0 
                      ? new Date(Math.max(...goalTasks.map(t => new Date(t.completedAt))))
                      : null;
                    
                    const lastActivityStr = lastActivity ? lastActivity.toLocaleDateString() : 'No activity';
                    
                    // Calculate progress based on tasks completed vs total tasks (if available)
                    const progress = goal.targetTasks ? Math.round((goalTasks.length / goal.targetTasks) * 100) : 0;
                    
                    return (
                      <tr key={goal._id || index} className="border-b border-[#2A313A] hover:bg-[#1A1F2E] transition-colors">
                        <td className="py-3 px-4 text-[#E8EEF2] font-medium">{goal.name}</td>
                        <td className="py-3 px-4 text-[#C9D1D9]">
                          <Badge variant={goal.isActive ? "default" : "secondary"} size="sm">
                            {goal.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-[#C9D1D9]">{goalTasks.length}</td>
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
        onClose={() => setShowCreateHabitPopup(false)}
        onHabitCreated={handleHabitCreated}
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

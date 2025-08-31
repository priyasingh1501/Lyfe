
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

  const tabs = [
    { id: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
    { id: 'habits', label: 'Habits', icon: '✅' },
    { id: 'goals', label: 'Goals', icon: '🎯' }
  ];

  const timePeriods = [
    { id: 'day', label: 'Day', icon: '📅' },
    { id: 'month', label: 'Month', icon: '📆' },
    { id: 'year', label: 'Year', icon: '🗓️' }
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
      case 'year':
        return `${dateComponents.year}`;
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
      case 'year':
        return 'Annual goals and reflection';
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
    try {
      const response = await fetch(buildApiUrl('/api/mindfulness'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMindfulnessCheckins(data || []);
      }
    } catch (error) {
      console.error('Error loading mindfulness check-ins:', error);
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

  // Get tasks for a specific goal completed on the selected date
  const getTasksForGoal = (goalId) => {
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    return tasks.filter(task => 
      task.goalIds && 
      task.goalIds.includes(goalId) && 
      task.completedAt && 
      task.completedAt.split('T')[0] === selectedDateStr
    );
  };

  // Handle date selection from month grid
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setTimePeriod('day'); // Switch to day view when a date is selected
  };

  // Handle marking habit as complete
  const handleMarkComplete = async (habitId) => {
    try {
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
        // Update the habit status to completed in the list
        setHabits(prev => prev.map(habit => 
          habit._id === habitId 
            ? { ...habit, isCompleted: true, completedDate: new Date().toISOString() }
            : habit
        ));
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

  // Consistent habit card renderer
  const renderHabitCard = (habit, index) => (
    <div key={habit._id || index} className={`group relative rounded-lg p-4 transition-all duration-200 ${
      habit.isCompleted 
        ? 'bg-[#1A1F2E] border border-[#3CCB7F] opacity-75' 
        : 'bg-[#1E2330] border border-[#2A313A] hover:bg-[#2A313A] hover:border-[#3CCB7F]'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className={`text-base font-semibold truncate ${
              habit.isCompleted ? 'text-[#3CCB7F]' : 'text-[#E8EEF2]'
            }`}>
              {habit.habit}
            </h4>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs px-2 py-1">
                {habit.quality}
              </Badge>
              {habit.isCompleted && (
                <Badge variant="success" className="text-xs px-2 py-1">
                  ✓ Completed
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-1 text-sm text-[#C9D1D9]">
            <p className="flex items-center gap-1">
              <span className="text-[#94A3B8]">⏱️</span>
              {habit.valueMin} minutes
            </p>
            <p className="flex items-center gap-1">
              <span className="text-[#94A3B8]">📅</span>
              Started: {new Date(habit.date).toLocaleDateString()}
            </p>
            {habit.completedDate && (
              <p className="flex items-center gap-1">
                <span className="text-[#3CCB7F]">✅</span>
                Completed: {new Date(habit.completedDate).toLocaleDateString()}
              </p>
            )}
            {habit.endDate && (
              <p className="flex items-center gap-1">
                <span className="text-[#94A3B8]">🎯</span>
                End Date: {new Date(habit.endDate).toLocaleDateString()}
              </p>
            )}
          </div>
          
          {habit.notes && (
            <p className="text-sm text-[#94A3B8] mt-2 italic">"{habit.notes}"</p>
          )}
        </div>
        
        {/* Action buttons - different for completed vs active habits */}
        <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {habit.isCompleted ? (
            <Button 
              variant="outline" 
              size="sm"
              disabled
              className="bg-[#3CCB7F]/10 border-[#3CCB7F]/30 text-[#3CCB7F]/50 cursor-not-allowed"
            >
              ✓ Completed
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleMarkComplete(habit._id)}
              className="bg-[#3CCB7F]/20 border-[#3CCB7F] text-[#3CCB7F] hover:bg-[#3CCB7F]/30 hover:border-[#3CCB7F]"
            >
              ✓ Complete
            </Button>
          )}
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
            {habits.map((habit, index) => renderHabitCard(habit, index))}
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
            {habits.map((habit, index) => renderHabitCard(habit, index))}
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
        {goals.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-600">No goals found. Create some goals to get started!</p>
            <Button onClick={() => setShowCreateGoalPopup(true)} className="mt-3">
              Add Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal, index) => {
              const goalTasks = getTasksForGoal(goal._id);
              return (
                <div key={goal._id || index} className="p-3 border rounded-lg bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{goal.name}</h4>
                    <Badge variant={goal.isActive ? "default" : "secondary"}>
                      {goal.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                  
                  {/* Tasks for this goal */}
                  {goalTasks.length > 0 && (
                    <div className="mb-3">
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

  const dateComponents = formatDateComponents(selectedDate);

  return (
    <Section>
      <Header level={1}>Goal-Aligned Day</Header>
      <p className="text-gray-600 mb-6">
        Track your daily choices and see how they align with your health goals
      </p>

      {/* Prominent Date Display */}
      <div className="text-center mb-8">
        <div className="bg-white rounded-lg shadow-sm p-8 border">
          <div className="text-6xl font-bold text-blue-600 mb-2">
            {timePeriod === 'day' ? dateComponents.day : 
             timePeriod === 'month' ? dateComponents.month : 
             dateComponents.year}
          </div>
          <div className="text-2xl font-semibold text-gray-800 mb-1">
            {getTimePeriodTitle()}
          </div>
          <div className="text-sm text-gray-500">
            {getTimePeriodSubtitle()}
          </div>
        </div>
      </div>

      {/* Time Period Tabs */}
      <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm mb-8">
        {timePeriods.map((period) => (
          <button
            key={period.id}
            onClick={() => handleTimePeriodChange(period.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-colors ${
              timePeriod === period.id
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>{period.icon}</span>
            <span>{period.label}</span>
          </button>
        ))}
      </div>

      {/* Content based on time period */}
      {timePeriod === 'day' ? (
        // Show unified day view
        renderUnifiedDayView()
      ) : timePeriod === 'month' ? (
        // Show month view with calendar grid
        <div className="space-y-8">
          {/* Month Grid Calendar */}
          <Card>
            <div className="mb-6">
              <h3 className="text-xl font-semibold">Monthly Overview</h3>
            </div>
            <MonthGrid
              selectedDate={selectedDate}
              habits={habits}
              goals={goals}
              mindfulnessCheckins={mindfulnessCheckins}
              onDateSelect={handleDateSelect}
              onMonthChange={setSelectedDate}
            />
          </Card>

          {/* Tabbed view for additional month details */}
          <>
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm mb-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'mindfulness' && renderMindfulnessTab()}
            {activeTab === 'habits' && renderHabitsTab()}
            {activeTab === 'goals' && renderGoalsTab()}
          </>
        </div>
      ) : (
        // Show year view (tabbed)
        <>
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'mindfulness' && renderMindfulnessTab()}
          {activeTab === 'habits' && renderHabitsTab()}
          {activeTab === 'goals' && renderGoalsTab()}
        </>
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

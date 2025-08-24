import React, { useState, useEffect } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { 
  Utensils, 
  Target, 
  Edit3,
  Trash2,
  Zap,
  Heart,
  Shield,
  Dumbbell,
  XCircle
} from 'lucide-react';
import axios from 'axios';

const Food = () => {

  const [foodEntries, setFoodEntries] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [healthGoals, setHealthGoals] = useState({});
  const [loading, setLoading] = useState(true);
  const [showMealModal, setShowMealModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [mealFormData, setMealFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mealType: 'breakfast',
    time: '',
    location: '',
    energy: 3,
    hunger: 3,
    plateTemplate: '50% veggies, 25% protein, 25% carbs',
    proteinAnchor: false,
    plantColors: 0,
    carbQuality: 'whole',
    friedOrUPF: false,
    addedSugar: false,
    mindfulPractice: 'none',
    satiety: 3,
    postMealCravings: 0,
    notes: '',
    healthGoals: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [entriesRes, summaryRes, goalsRes] = await Promise.all([
        axios.get('/api/food', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/food/weekly-summary', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/food/health-goals', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setFoodEntries(entriesRes.data);
      setWeeklySummary(summaryRes.data);
      setHealthGoals(goalsRes.data);
    } catch (error) {
      console.error('Error fetching food data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMealSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Debug: Log the form data and token
      console.log('Submitting meal with data:', mealFormData);
      console.log('Token:', token ? 'Present' : 'Missing');
      
      if (editingEntry) {
        await axios.put(`/api/food/${editingEntry._id}`, mealFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/food', mealFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      // Refresh data and close modal
      await fetchData();
      setShowMealModal(false);
      setEditingEntry(null);
      resetMealForm();
    } catch (error) {
      console.error('Error saving meal:', error);
      console.error('Error details:', error.response?.data);
      alert(`Error saving meal: ${error.response?.data?.message || error.message}`);
    }
  };

  const resetMealForm = () => {
    setMealFormData({
      date: new Date().toISOString().split('T')[0],
      mealType: 'breakfast',
      time: '',
      location: '',
      energy: 3,
      hunger: 3,
      plateTemplate: '50% veggies, 25% protein, 25% carbs',
      proteinAnchor: false,
      plantColors: 0,
      carbQuality: 'whole',
      friedOrUPF: false,
      addedSugar: false,
      mindfulPractice: 'none',
      satiety: 3,
      postMealCravings: 0,
      notes: '',
      healthGoals: []
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0C0F]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FFD200]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C0F] text-[#E8EEF2] p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#FFD200] font-oswald tracking-wide mb-2">
          NUTRITION MISSION CONTROL
        </h1>
        <p className="text-[#C9D1D9] font-inter">
          Track your meals, analyze nutrition, and achieve your health goals
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-1 mb-6">
        {['overview', 'meals'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium font-oswald tracking-wide transition-all ${
              activeTab === tab
                ? 'bg-[#FFD200] text-[#0A0C0F]'
                : 'text-[#C9D1D9] hover:text-[#E8EEF2]'
            }`}
          >
            {tab === 'overview' ? 'Dashboard' : 'Meals'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            {weeklySummary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#FFD200] font-oswald tracking-wide">{weeklySummary.totalMeals}</div>
                  <div className="text-sm text-[#C9D1D9] font-inter">Total Meals</div>
                </div>
                <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#3CCB7F] font-oswald tracking-wide">{weeklySummary.mindfulMeals}</div>
                  <div className="text-sm text-[#C9D1D9] font-inter">Mindful Meals</div>
                </div>
                <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#4ECDC4] font-oswald tracking-wide">{weeklySummary.fiberRich}</div>
                  <div className="text-sm text-[#C9D1D9] font-inter">Fiber Rich</div>
                </div>
                <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#FFD200] font-oswald tracking-wide">{weeklySummary.proteinHeavy}</div>
                  <div className="text-sm text-[#C9D1D9] font-inter">Protein Heavy</div>
                </div>
              </div>
            )}

            {/* Health Goals Progress */}
            {Object.keys(healthGoals).length > 0 && (
              <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6">
                <h3 className="text-xl font-semibold text-[#E8EEF2] font-oswald tracking-wide mb-4">HEALTH GOALS PROGRESS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(healthGoals).map(([goal, data]) => (
                    <div key={goal} className="bg-[#0A0C0F] border border-[#2A313A] rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        {goal === 'steady_energy' && <Zap size={20} className="text-[#FFD200]" />}
                        {goal === 'muscle_building' && <Dumbbell size={20} className="text-[#3CCB7F]" />}
                        {goal === 'gut_comfort' && <Heart size={20} className="text-[#FF6B6B]" />}
                        {goal === 'immunity_building' && <Shield size={20} className="text-[#4ECDC4]" />}
                        
                        <h4 className="text-lg font-semibold text-[#E8EEF2] font-oswald tracking-wide">
                          {goal.replace('_', ' ').toUpperCase()}
                        </h4>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-[#C9D1D9]">Progress</span>
                          <span className="text-[#E8EEF2]">{data.count}/{data.total} meals</span>
                        </div>
                        <div className="w-full bg-[#2A313A] rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-[#FFD200] to-[#3CCB7F] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${data.total > 0 ? (data.count / data.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-[#C9D1D9]">
                        {data.total > 0 ? (
                          <span>{(data.count / data.total * 100).toFixed(1)}% of meals aligned with this goal</span>
                        ) : (
                          <span>No meals tracked yet</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly Nutrition Analytics */}
            {weeklySummary && (
              <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6">
                <h3 className="text-xl font-semibold text-[#E8EEF2] font-oswald tracking-wide mb-4">WEEKLY NUTRITION ANALYTICS</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Nutrition Quality Metrics */}
                  <div className="bg-[#0A0C0F] border border-[#2A313A] rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-[#E8EEF2] font-oswald tracking-wide mb-3">NUTRITION QUALITY</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#C9D1D9]">Fiber Rich</span>
                        <span className="text-[#3CCB7F] font-semibold">{weeklySummary.fiberRich}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#C9D1D9]">Protein Heavy</span>
                        <span className="text-[#FFD200] font-semibold">{weeklySummary.proteinHeavy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#C9D1D9]">Iron Rich</span>
                        <span className="text-[#FF6B6B] font-semibold">{weeklySummary.ironRich}</span>
                      </div>
                    </div>
                  </div>

                  {/* Meal Patterns */}
                  <div className="bg-[#0A0C0F] border border-[#2A313A] rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-[#E8EEF2] font-oswald tracking-wide mb-3">MEAL PATTERNS</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#C9D1D9]">Total Meals</span>
                        <span className="text-[#E8EEF2] font-semibold">{weeklySummary.totalMeals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#C9D1D9]">Mindful Meals</span>
                        <span className="text-[#4ECDC4] font-semibold">{weeklySummary.mindfulMeals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#C9D1D9]">Processed Foods</span>
                        <span className="text-[#FF6B6B] font-semibold">{weeklySummary.processed}</span>
                      </div>
                    </div>
                  </div>

                  {/* Satisfaction Metrics */}
                  <div className="bg-[#0A0C0F] border border-[#2A313A] rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-[#E8EEF2] font-oswald tracking-wide mb-3">SATISFACTION</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#C9D1D9]">Avg Satiety</span>
                        <span className="text-[#3CCB7F] font-semibold">{weeklySummary.averageSatiety}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#C9D1D9]">Avg Cravings</span>
                        <span className="text-[#FFD200] font-semibold">{weeklySummary.averageCravings}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#C9D1D9]">High Sugar</span>
                        <span className="text-[#FF6B6B] font-semibold">{weeklySummary.highSugar}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Add Meal */}
            <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
              <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD200] to-[#3CCB7F]"></div>
              
              <div className="text-center">
                <h3 className="text-xl font-semibold text-[#E8EEF2] font-oswald tracking-wide mb-4">
                  TRACK YOUR NEXT MEAL
                </h3>
                <button
                  onClick={() => setShowMealModal(true)}
                  className="bg-[#FFD200] text-[#0A0C0F] px-6 py-3 rounded-lg hover:bg-[#FFD200]/90 transition-colors font-medium font-oswald tracking-wide"
                >
                  ADD MEAL ENTRY
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'meals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#E8EEF2] font-oswald tracking-wide">MEAL TRACKING</h3>
              <button
                onClick={() => setShowMealModal(true)}
                className="bg-[#FFD200] text-[#0A0C0F] px-4 py-2 rounded-lg hover:bg-[#FFD200]/90 transition-colors font-medium font-oswald tracking-wide"
              >
                ADD MEAL
              </button>
            </div>
            
            {/* Meal Entries */}
            <div className="space-y-4">
              {foodEntries.length === 0 ? (
                <div className="text-center py-8 text-[#C9D1D9]">
                  <Utensils size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No meals tracked yet. Start by adding your first meal!</p>
                </div>
              ) : (
                foodEntries.map((entry) => (
                  <div key={entry._id} className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-[#FFD200] bg-[#2A313A] px-2 py-1 rounded-full font-oswald tracking-wide">
                          {entry.mealType.toUpperCase()}
                        </span>
                        <span className="font-medium text-[#E8EEF2] font-oswald tracking-wide">{entry.time}</span>
                        <span className="text-[#C9D1D9] font-inter">at {entry.location}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingEntry(entry);
                            setMealFormData({
                              ...entry,
                              date: new Date(entry.date).toISOString().split('T')[0]
                            });
                            setShowMealModal(true);
                          }}
                          className="text-[#FFD200] hover:text-[#FFD200]/80 transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm('Delete this meal entry?')) {
                              try {
                                const token = localStorage.getItem('token');
                                await axios.delete(`/api/food/${entry._id}`, {
                                  headers: { Authorization: `Bearer ${token}` }
                                });
                                await fetchData();
                              } catch (error) {
                                console.error('Error deleting meal:', error);
                              }
                            }
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-[#C9D1D9]">Energy:</span>
                        <span className="ml-2 text-[#E8EEF2]">{entry.energy}/5</span>
                      </div>
                      <div>
                        <span className="text-[#C9D1D9]">Hunger:</span>
                        <span className="ml-2 text-[#E8EEF2]">{entry.hunger}/5</span>
                      </div>
                      <div>
                        <span className="text-[#C9D1D9]">Satiety:</span>
                        <span className="ml-2 text-[#E8EEF2]">{entry.satiety}/5</span>
                      </div>
                      <div>
                        <span className="text-[#C9D1D9]">Cravings:</span>
                        <span className="ml-2 text-[#E8EEF2]">{entry.postMealCravings}/5</span>
                      </div>
                    </div>
                    {entry.notes && (
                      <div className="mt-3 pt-3 border-t border-[#2A313A]">
                        <p className="text-[#C9D1D9] text-sm">{entry.notes}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}




          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-[#E8EEF2] font-oswald tracking-wide">WEEKLY NUTRITION ANALYTICS</h3>
            
            {weeklySummary ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Nutrition Quality Metrics */}
                <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-[#E8EEF2] font-oswald tracking-wide mb-4">NUTRITION QUALITY</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#C9D1D9]">Fiber Rich</span>
                      <span className="text-[#3CCB7F] font-semibold">{weeklySummary.fiberRich}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#C9D1D9]">Protein Heavy</span>
                      <span className="text-[#FFD200] font-semibold">{weeklySummary.proteinHeavy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#C9D1D9]">Iron Rich</span>
                      <span className="text-[#FF6B6B] font-semibold">{weeklySummary.ironRich}</span>
                    </div>
                  </div>
                </div>

                {/* Meal Patterns */}
                <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-[#E8EEF2] font-oswald tracking-wide mb-4">MEAL PATTERNS</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#C9D1D9]">Total Meals</span>
                      <span className="text-[#E8EEF2] font-semibold">{weeklySummary.totalMeals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#C9D1D9]">Mindful Meals</span>
                      <span className="text-[#4ECDC4] font-semibold">{weeklySummary.mindfulMeals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#C9D1D9]">Processed Foods</span>
                      <span className="text-[#FF6B6B] font-semibold">{weeklySummary.processed}</span>
                    </div>
                  </div>
                </div>

                {/* Satisfaction Metrics */}
                <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-[#E8EEF2] font-oswald tracking-wide mb-4">SATISFACTION</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#C9D1D9]">Avg Satiety</span>
                      <span className="text-[#3CCB7F] font-semibold">{weeklySummary.averageSatiety}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#C9D1D9]">Avg Cravings</span>
                      <span className="text-[#FFD200] font-semibold">{weeklySummary.averageCravings}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#C9D1D9]">High Sugar</span>
                      <span className="text-[#FF6B6B] font-semibold">{weeklySummary.highSugar}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-[#C9D1D9]">
                <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
                <p>No weekly data available. Track meals throughout the week to see analytics!</p>
              </div>
            )}
          </div>
      </div>

      {/* Meal Entry Modal */}
      {showMealModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
            <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD200] to-[#3CCB7F]"></div>
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-[#E8EEF2] font-oswald tracking-wide">
                {editingEntry ? 'EDIT MEAL ENTRY' : 'ADD MEAL ENTRY'}
              </h3>
              <button
                onClick={() => {
                  setShowMealModal(false);
                  setEditingEntry(null);
                  resetMealForm();
                }}
                className="text-[#C9D1D9] hover:text-[#E8EEF2] transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleMealSubmit} className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Date</label>
                <input
                  type="date"
                  value={mealFormData.date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setMealFormData({...mealFormData, date: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                  required
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Time</label>
                <input
                  type="time"
                  value={mealFormData.time || ''}
                  onChange={(e) => setMealFormData({...mealFormData, time: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Location</label>
                <input
                  type="text"
                  value={mealFormData.location || ''}
                  onChange={(e) => setMealFormData({...mealFormData, location: e.target.value})}
                  placeholder="e.g., Home, Office, Restaurant"
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                />
              </div>

              {/* Meal Type */}
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Meal Type</label>
                <div className="flex space-x-1 bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-1">
                  {['breakfast', 'lunch', 'snack', 'dinner'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMealFormData({...mealFormData, mealType: type})}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium font-oswald tracking-wide transition-all ${
                        mealFormData.mealType === type
                          ? 'bg-[#FFD200] text-[#0A0C0F]'
                          : 'text-[#C9D1D9] hover:text-[#E8EEF2]'
                      }`}
                                          >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
              </div>

              {/* Energy Level */}
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Energy Level</label>
                <div className="flex space-x-1 bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMealFormData({...mealFormData, energy: num})}
                      className={`flex-1 py-2 px-2 rounded-md text-sm font-medium font-oswald tracking-wide transition-all ${
                        mealFormData.energy === num
                          ? 'bg-[#FFD200] text-[#0A0C0F]'
                          : 'text-[#C9D1D9] hover:text-[#E8EEF2]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-[#C9D1D9] mt-1">
                  {mealFormData.energy === 1 ? 'Very Low' : mealFormData.energy === 2 ? 'Low' : mealFormData.energy === 3 ? 'Medium' : mealFormData.energy === 4 ? 'High' : 'Very High'}
                </div>
              </div>

              {/* Hunger Level */}
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Hunger Level</label>
                <div className="flex space-x-1 bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMealFormData({...mealFormData, hunger: num})}
                      className={`flex-1 py-2 px-2 rounded-md text-sm font-medium font-oswald tracking-wide transition-all ${
                        mealFormData.hunger === num
                          ? 'bg-[#FFD200] text-[#0A0C0F]'
                          : 'text-[#C9D1D9] hover:text-[#E8EEF2]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-[#C9D1D9] mt-1">
                  {mealFormData.hunger === 1 ? 'Not Hungry' : mealFormData.hunger === 2 ? 'Slightly Hungry' : mealFormData.hunger === 3 ? 'Moderately Hungry' : mealFormData.hunger === 4 ? 'Hungry' : 'Very Hungry'}
                </div>
              </div>

              {/* Plate Template */}
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Plate Template</label>
                <input
                  type="text"
                  value={mealFormData.plateTemplate}
                  onChange={(e) => setMealFormData({...mealFormData, plateTemplate: e.target.value})}
                  placeholder="e.g., 50% veggies, 25% protein, 25% carbs"
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                />
              </div>





              {/* Carb Quality */}
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Carb Quality</label>
                <div className="flex space-x-1 bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-1">
                  {['whole', 'fermented', 'refined'].map((quality) => (
                    <button
                      key={quality}
                      type="button"
                      onClick={() => setMealFormData({...mealFormData, carbQuality: quality})}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium font-oswald tracking-wide transition-all ${
                        mealFormData.carbQuality === quality
                          ? 'bg-[#FFD200] text-[#0A0C0F]'
                          : 'text-[#C9D1D9] hover:text-[#E8EEF2]'
                      }`}
                    >
                      {quality === 'whole' ? 'Whole' : quality === 'fermented' ? 'Fermented' : 'Refined'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fried/UPF */}
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Fried/UPF</label>
                <div className="flex space-x-1 bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-1">
                  {[false, true].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMealFormData({...mealFormData, friedOrUPF: value})}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium font-oswald tracking-wide transition-all ${
                        mealFormData.friedOrUPF === value
                          ? 'bg-[#FFD200] text-[#0A0C0F]'
                          : 'text-[#C9D1D9] hover:text-[#E8EEF2]'
                      }`}
                    >
                      {value ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Protein Anchor */}
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Protein Anchor</label>
                <div className="flex space-x-1 bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-1">
                  {[false, true].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMealFormData({...mealFormData, proteinAnchor: value})}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium font-oswald tracking-wide transition-all ${
                        mealFormData.proteinAnchor === value
                          ? 'bg-[#FFD200] text-[#0A0C0F]'
                          : 'text-[#C9D1D9] hover:text-[#E8EEF2]'
                      }`}
                    >
                      {value ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-[#C9D1D9] mt-1">
                  Did you include a good protein source?
                </div>
              </div>

              {/* Plant Colors */}
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Plant Colors (0-5)</label>
                <div className="flex space-x-1 bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-1">
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMealFormData({...mealFormData, plantColors: num})}
                      className={`flex-1 py-2 px-2 rounded-md text-sm font-medium font-oswald tracking-wide transition-all ${
                        mealFormData.plantColors === num
                          ? 'bg-[#FFD200] text-[#0A0C0F]'
                          : 'text-[#C9D1D9] hover:text-[#E8EEF2]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-[#C9D1D9] mt-1">
                  Number of different colored plant foods on your plate
                </div>
              </div>

              {/* Added Sugar */}
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Added Sugar</label>
                <div className="flex space-x-1 bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-1">
                  {[false, true].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMealFormData({...mealFormData, addedSugar: value})}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium font-oswald tracking-wide transition-all ${
                        mealFormData.addedSugar === value
                          ? 'bg-[#FFD200] text-[#0A0C0F]'
                          : 'text-[#C9D1D9] hover:text-[#E8EEF2]'
                      }`}
                    >
                      {value ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mindful Practice */}
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Mindful Practice</label>
                <div className="flex space-x-1 bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-1">
                  {['none', 'breath', 'no_screens', 'slow'].map((practice) => (
                    <button
                      key={practice}
                      type="button"
                      onClick={() => setMealFormData({...mealFormData, mindfulPractice: practice})}
                      className={`flex-1 py-2 px-2 rounded-md text-sm font-medium font-oswald tracking-wide transition-all ${
                        mealFormData.mindfulPractice === practice
                          ? 'bg-[#FFD200] text-[#0A0C0F]'
                          : 'text-[#C9D1D9] hover:text-[#E8EEF2]'
                      }`}
                    >
                      {practice === 'none' ? 'None' : practice === 'breath' ? 'Breath' : practice === 'no_screens' ? 'No Screens' : 'Slow'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Satiety */}
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Satiety</label>
                <div className="flex space-x-1 bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMealFormData({...mealFormData, satiety: num})}
                      className={`flex-1 py-2 px-2 rounded-md text-sm font-medium font-oswald tracking-wide transition-all ${
                        mealFormData.satiety === num
                          ? 'bg-[#FFD200] text-[#0A0C0F]'
                          : 'text-[#C9D1D9] hover:text-[#E8EEF2]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-[#C9D1D9] mt-1">
                  {mealFormData.satiety === 1 ? 'Not Satisfied' : mealFormData.satiety === 2 ? 'Slightly Satisfied' : mealFormData.satiety === 3 ? 'Moderately Satisfied' : mealFormData.satiety === 4 ? 'Satisfied' : 'Very Satisfied'}
                </div>
              </div>

              {/* Post-Meal Cravings */}
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Post-Meal Cravings</label>
                <div className="flex space-x-1 bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-1">
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMealFormData({...mealFormData, postMealCravings: num})}
                      className={`flex-1 py-2 px-2 rounded-md text-sm font-medium font-oswald tracking-wide transition-all ${
                        mealFormData.postMealCravings === num
                          ? 'bg-[#FFD200] text-[#0A0C0F]'
                          : 'text-[#C9D1D9] hover:text-[#E8EEF2]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-[#C9D1D9] mt-1">
                  {mealFormData.postMealCravings === 0 ? 'No Cravings' : mealFormData.postMealCravings === 1 ? 'Very Low' : mealFormData.postMealCravings === 2 ? 'Low' : mealFormData.postMealCravings === 3 ? 'Moderate' : mealFormData.postMealCravings === 4 ? 'High' : 'Very High'}
                </div>
              </div>



              {/* Health Goals */}
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Health Goals</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'steady_energy', label: 'Steady Energy', icon: <Zap size={16} /> },
                    { key: 'muscle_building', label: 'Muscle Building', icon: <Dumbbell size={16} /> },
                    { key: 'gut_comfort', label: 'Gut Comfort', icon: <Heart size={16} /> },
                    { key: 'immunity_building', label: 'Immunity Building', icon: <Shield size={16} /> }
                  ].map((goal) => (
                    <button
                      key={goal.key}
                      type="button"
                      onClick={() => {
                        const currentGoals = mealFormData.healthGoals || [];
                        const newGoals = currentGoals.includes(goal.key)
                          ? currentGoals.filter(g => g !== goal.key)
                          : [...currentGoals, goal.key];
                        setMealFormData({...mealFormData, healthGoals: newGoals});
                      }}
                      className={`flex items-center space-x-2 p-2 rounded-lg border-2 transition-all ${
                        mealFormData.healthGoals?.includes(goal.key)
                          ? 'border-[#FFD200] bg-[#FFD200]/10 text-[#FFD200]'
                          : 'border-[#2A313A] text-[#C9D1D9] hover:border-[#FFD200]/50'
                      }`}
                    >
                      {goal.icon}
                      <span className="text-sm font-medium">{goal.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] font-inter mb-1">Notes</label>
                <textarea
                  value={mealFormData.notes}
                  onChange={(e) => setMealFormData({...mealFormData, notes: e.target.value})}
                  placeholder="Any additional notes about this meal..."
                  rows="3"
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#FFD200] text-[#0A0C0F] px-4 py-2 rounded-lg hover:bg-[#FFD200]/90 transition-colors font-medium font-oswald tracking-wide"
                >
                  {editingEntry ? 'Update Meal' : 'Save Meal'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMealModal(false);
                    setEditingEntry(null);
                    resetMealForm();
                  }}
                  className="flex-1 bg-[#2A313A] text-[#C9D1D9] px-4 py-2 rounded-lg hover:bg-[#2A313A]/80 transition-colors font-medium font-oswald tracking-wide"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Food;

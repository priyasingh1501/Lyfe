import React, { useState, useEffect } from 'react';
import { Button, Input } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import { ConsistentPopup } from '../Layout/Layout';

const CreateHabitPopup = ({ isOpen, onClose, onHabitCreated, goals = [], selectedGoal = null }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Debug logging
  console.log('🎯 CreateHabitPopup - goals:', goals);
  console.log('🎯 CreateHabitPopup - goals.length:', goals?.length);
  console.log('🎯 CreateHabitPopup - goals type:', typeof goals);
  console.log('🎯 CreateHabitPopup - goals is array:', Array.isArray(goals));
  
  const [formData, setFormData] = useState({
    habit: '',
    valueMin: '',
    notes: '',
    endDate: '',
    goalId: ''
  });

  // Update formData when selectedGoal changes
  useEffect(() => {
    if (selectedGoal) {
      setFormData(prev => ({
        ...prev,
        goalId: selectedGoal._id
      }));
    }
  }, [selectedGoal]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🎯 Attempting to create habit:', formData);
      
      // Validate required fields
      if (!formData.habit.trim()) {
        alert('Habit name is required');
        return;
      }
      
      if (!formData.endDate) {
        alert('End date is required');
        return;
      }
      
      const requestBody = {
        habit: formData.habit.trim(),
        valueMin: parseInt(formData.valueMin) || 0,
        notes: formData.notes.trim(),
        endDate: formData.endDate,
        quality: 'good',
        goalId: formData.goalId || null
      };
      
      console.log('🎯 Request body:', requestBody);
      
      const response = await fetch(buildApiUrl('/api/habits'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('🎯 Response status:', response.status);

      if (response.ok) {
        const newHabit = await response.json();
        console.log('✅ Habit created successfully:', newHabit);
        onHabitCreated(newHabit);
        onClose();
        // Reset form
        setFormData({
          habit: '',
          valueMin: '',
          notes: '',
          endDate: '',
          goalId: ''
        });
      } else {
        const error = await response.json();
        console.error('❌ Habit creation failed:', error);
        alert(`Error creating habit: ${error.message}`);
      }
    } catch (error) {
      console.error('❌ Error creating habit:', error);
      alert('Error creating habit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Habit - TEST</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Test div to see if component is rendering */}
          <div className="p-2 bg-green-100 border border-green-200 rounded text-sm">
            <p>✅ CreateHabitPopup component is rendering</p>
            <p>Goals: {JSON.stringify(goals)}</p>
          </div>
          
          {/* Goal Selection Test */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Goal Selection TEST
            </label>
            <select className="w-full p-2 border border-gray-300 rounded">
              <option value="">Select a goal</option>
              <option value="test">Test Goal</option>
            </select>
          </div>
        
          {/* Habit Name */}
          <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Habit Name *
          </label>
          <Input
            type="text"
            value={formData.habit}
            onChange={(e) => handleInputChange('habit', e.target.value)}
            placeholder="e.g., Morning Exercise"
            required
          />
        </div>

        {/* Goal Selection - Simplified */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Associated Goal (Optional)
          </label>
          
          <div className="mb-2 p-2 bg-yellow-100 border border-yellow-200 rounded text-sm">
            <p>🎯 Goal Selection Field</p>
            <p>Goals count: {goals?.length || 0}</p>
          </div>
          
          <select
            value={formData.goalId}
            onChange={(e) => handleInputChange('goalId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select a goal (optional)</option>
            <option value="test">Test Goal</option>
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Duration (minutes) *
          </label>
          <Input
            type="number"
            value={formData.valueMin}
            onChange={(e) => handleInputChange('valueMin', e.target.value)}
            placeholder="30"
            min="0"
            required
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            End Date (Optional)
          </label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => handleInputChange('endDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Describe your habit goal..."
            className="w-full px-3 py-2 bg-background-secondary border border-border-primary rounded-lg text-text-primary focus:ring-2 focus:ring-accent-green focus:border-accent-green placeholder:text-text-secondary"
            rows={3}
          />
        </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.habit || !formData.valueMin}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              {loading ? 'Creating...' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHabitPopup;

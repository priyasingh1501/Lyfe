import React, { useState, useEffect } from 'react';
import { Button, Input } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import { ConsistentPopup } from '../Layout/Layout';

const CreateHabitPopup = ({ isOpen, onClose, onHabitCreated, goals = [], selectedGoal = null }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Debug logging
  if (isOpen) {
    console.log('🎯 CreateHabitPopup - isOpen:', isOpen);
  }
  
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
      
      // Set default end date to 30 days from now if not provided
      const endDate = formData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const requestBody = {
        habit: formData.habit.trim(),
        valueMin: parseInt(formData.valueMin) || 0,
        notes: formData.notes.trim(),
        endDate: endDate,
        quality: 'good',
        goalId: formData.goalId || null
      };
      
      console.log('🎯 Request body:', requestBody);
      console.log('🎯 Selected goal ID:', formData.goalId);
      console.log('🎯 Available goals:', goals);
      
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

  return (
    <ConsistentPopup
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Habit"
      maxWidth="md"
      showReasonStrip={true}
      reasonStripColor="from-accent-purple to-accent-blue"
    >
      {selectedGoal && (
        <p className="text-sm text-text-secondary mb-4">for goal: {selectedGoal.name}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
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

        {/* Goal Selection */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Associated Goal (Optional)
          </label>
          
          <select
            value={formData.goalId}
            onChange={(e) => handleInputChange('goalId', e.target.value)}
            className="w-full px-3 py-2 bg-background-secondary border border-border-primary rounded-lg text-text-primary focus:ring-2 focus:ring-accent-green focus:border-accent-green"
          >
            <option value="">Select a goal (optional)</option>
            {goals && goals.map((goal) => (
              <option key={goal._id} value={goal._id}>
                {goal.name}
              </option>
            ))}
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
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !formData.habit || !formData.valueMin}
            loading={loading}
            className="flex-1"
          >
            {loading ? 'Creating...' : 'Create Habit'}
          </Button>
        </div>
      </form>
    </ConsistentPopup>
  );
};

export default CreateHabitPopup;

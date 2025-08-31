import React, { useState } from 'react';
import { Button, Input } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';

const CreateGoalPopup = ({ isOpen, onClose, onGoalCreated }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'other',
    targetHours: '1',
    priority: 'medium',
    color: '#10B981'
  });

  const categoryOptions = [
    { value: 'sleep', label: 'Sleep' },
    { value: 'partner', label: 'Partner' },
    { value: 'reading', label: 'Reading' },
    { value: 'deep-work', label: 'Deep Work' },
    { value: 'health', label: 'Health' },
    { value: 'mindfulness', label: 'Mindfulness' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'learning', label: 'Learning' },
    { value: 'social', label: 'Social' },
    { value: 'other', label: 'Other' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  const colorOptions = [
    { value: '#10B981', label: 'Emerald' },
    { value: '#3B82F6', label: 'Blue' },
    { value: '#8B5CF6', label: 'Purple' },
    { value: '#F59E0B', label: 'Amber' },
    { value: '#EF4444', label: 'Red' },
    { value: '#06B6D4', label: 'Cyan' }
  ];

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
      const response = await fetch(buildApiUrl('/api/goals'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          targetHours: parseInt(formData.targetHours) || 1
        })
      });

      if (response.ok) {
        const newGoal = await response.json();
        onGoalCreated(newGoal);
        onClose();
        // Reset form
        setFormData({
          name: '',
          description: '',
          category: 'other',
          targetHours: '1',
          priority: 'medium',
          color: '#10B981'
        });
      } else {
        const error = await response.json();
        alert(`Error creating goal: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Error creating goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create New Goal</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Goal Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your goal name..."
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your goal..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Target (hours)
              </label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.targetHours}
                onChange={(e) => handleInputChange('targetHours', e.target.value)}
                placeholder="1"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="grid grid-cols-6 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleInputChange('color', color.value)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color.value ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
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
                disabled={loading || !formData.name}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Goal'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGoalPopup;

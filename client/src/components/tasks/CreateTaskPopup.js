import React, { useState } from 'react';
import { Button, Input } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import { ConsistentPopup } from '../Layout/Layout';

const CreateTaskPopup = ({ isOpen, onClose, onTaskCreated, goalId, goalName }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    estimatedDuration: '30'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const taskData = {
      ...formData,
      goalIds: goalId ? [goalId] : [],
      estimatedDuration: parseInt(formData.estimatedDuration) || 30
    };

    console.log('Creating task with data:', taskData);

    try {
      const response = await fetch(buildApiUrl('/api/tasks'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });

      console.log('Task creation response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Task created successfully:', data);
        onTaskCreated(data.task);
        onClose();
        // Reset form
        setFormData({
          title: '',
          estimatedDuration: '30'
        });
      } else {
        const error = await response.json();
        console.error('Task creation failed:', error);
        alert(`Error creating task: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConsistentPopup
      isOpen={isOpen}
      onClose={onClose}
      title="Add Task"
      maxWidth="md"
      showReasonStrip={true}
      reasonStripColor="from-accent-blue to-accent-green"
    >
      {goalName && (
        <p className="text-sm text-text-secondary mb-4">for goal: {goalName}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Title */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Task Title *
          </label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter task title..."
            required
          />
        </div>

        {/* Estimated Duration */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Duration (minutes)
          </label>
          <Input
            type="number"
            min="5"
            step="5"
            value={formData.estimatedDuration}
            onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
            placeholder="30"
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
            disabled={loading || !formData.title}
            className="flex-1"
          >
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </ConsistentPopup>
  );
};

export default CreateTaskPopup;

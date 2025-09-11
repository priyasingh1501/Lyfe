import React, { useState } from 'react';
import { Button, Input } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import { componentStyles } from '../../styles/designTokens';
import { motion } from 'framer-motion';

const CreateTaskPopup = ({ isOpen, onClose, onTaskCreated, goalId, goalName }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    estimatedDuration: '30'
  });

  // Debug logging
  console.log('CreateTaskPopup props:', { isOpen, goalId, goalName, token: !!token });

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
      <motion.div 
        className="bg-[rgba(0,0,0,0.8)] border border-[rgba(255,255,255,0.2)] rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl backdrop-blur-[32px]"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-text-primary font-jakarta tracking-wide">
            ADD TASK
          </h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {goalName && (
          <p className="text-sm text-text-secondary mb-4 font-jakarta">for goal: {goalName}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 font-jakarta tracking-wider">
              TASK TITLE *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title..."
              required
              className={componentStyles.input.base}
            />
          </div>

          {/* Estimated Duration */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2 font-jakarta tracking-wider">
              DURATION (MINUTES)
            </label>
            <input
              type="number"
              min="5"
              step="5"
              value={formData.estimatedDuration}
              onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
              placeholder="30"
              className={componentStyles.input.base}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={componentStyles.button.outline + " flex-1"}
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading || !formData.title}
              className={componentStyles.button.primary + " flex-1"}
            >
              {loading ? 'CREATING...' : 'ADD TASK'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateTaskPopup;

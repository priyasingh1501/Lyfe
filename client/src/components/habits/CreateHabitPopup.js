import React, { useState } from 'react';
import { Button, Input } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';

const CreateHabitPopup = ({ isOpen, onClose, onHabitCreated }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    habit: '',
    valueMin: '',
    notes: '',
    endDate: ''
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

    try {
      const response = await fetch(buildApiUrl('/api/habits'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          date: new Date().toISOString(),
          valueMin: parseInt(formData.valueMin) || 0,
          endDate: formData.endDate || null,
          quality: 'good' // Default quality
        })
      });

      if (response.ok) {
        const newHabit = await response.json();
        onHabitCreated(newHabit);
        onClose();
        // Reset form
        setFormData({
          habit: '',
          valueMin: '',
          notes: '',
          endDate: ''
        });
      } else {
        const error = await response.json();
        alert(`Error creating habit: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating habit:', error);
      alert('Error creating habit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative overflow-hidden" 
           style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
        
        {/* Film grain overlay */}
        <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
        
        {/* Reason Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD200] to-[#3CCB7F]"></div>
        
        <div className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-[#E8EEF2] font-oswald tracking-wide">Create New Habit</h3>
            <button
              onClick={onClose}
              className="text-[#94A3B8] hover:text-[#E8EEF2] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Habit Name */}
            <div>
              <label className="block text-sm font-medium text-[#C9D1D9] mb-2 font-inter">
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

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-[#C9D1D9] mb-2 font-inter">
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
              <label className="block text-sm font-medium text-[#C9D1D9] mb-2 font-inter">
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
              <label className="block text-sm font-medium text-[#C9D1D9] mb-2 font-inter">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Describe your habit goal..."
                className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:ring-2 focus:ring-[#3CCB7F] focus:border-[#3CCB7F] placeholder:text-[#64748B]"
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
                disabled={loading || !formData.habit || !formData.valueMin}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Habit'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateHabitPopup;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, CheckCircle, Clock, Sparkles } from 'lucide-react';
import MoonPhaseSlider from '../ui/MoonPhaseSlider';
import MindfulnessGlass from '../ui/MindfulnessGlass';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import axios from 'axios';
import toast from 'react-hot-toast';

const MindfulnessCheckin = ({ onCheckinComplete }) => {
  const { token } = useAuth();

  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [todayCheckin, setTodayCheckin] = useState(null);

  // Mindfulness dimensions state
  const [dimensions, setDimensions] = useState({
    presence: { rating: 0 },
    emotionAwareness: { rating: 0 },
    intentionality: { rating: 0 },
    attentionQuality: { rating: 0 },
    compassion: { rating: 0 }
  });

  const [dayReflection, setDayReflection] = useState('');

  const [dailyNotes, setDailyNotes] = useState('');

  // Auto-save state
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const autoSaveTimeoutRef = useRef(null);

  // Calculate total score
  const totalScore = Object.values(dimensions).reduce((sum, dim) => sum + dim.rating, 0);

  // Check if user has already checked in today
  useEffect(() => {
    const checkTodayCheckin = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await axios.get(`${buildApiUrl()}/api/mindfulness/date/${today}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
          setHasCheckedInToday(true);
          setTodayCheckin(response.data);
          // Load existing data
          setDimensions(response.data.dimensions);
          setDailyNotes(response.data.dailyNotes || '');
          setDayReflection(response.data.dayReflection || '');
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error('Error checking today\'s check-in:', error);
        }
      }
    };
    
    checkTodayCheckin();
  }, [token]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Auto-save function
  const autoSave = useCallback(async (data) => {
    if (!data || Object.values(data.dimensions).every(dim => dim.rating === 0)) {
      return; // Don't save if no dimensions are rated
    }

    setAutoSaving(true);
    try {
      const checkinData = {
        dimensions: data.dimensions,
        dailyNotes: data.dailyNotes,
        dayReflection: data.dayReflection
      };

      if (hasCheckedInToday && todayCheckin) {
        // Update existing check-in
        await axios.put(`${buildApiUrl()}/api/mindfulness/${todayCheckin._id}`, checkinData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new check-in
        const response = await axios.post(`${buildApiUrl()}/api/mindfulness`, checkinData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setHasCheckedInToday(true);
        setTodayCheckin(response.data.checkin);
      }

      setLastSaved(new Date());
      
      if (onCheckinComplete) {
        onCheckinComplete();
      }
    } catch (error) {
      console.error('Error auto-saving mindfulness check-in:', error);
      // Don't show error toast for auto-save to avoid spam
    } finally {
      setAutoSaving(false);
    }
  }, [hasCheckedInToday, todayCheckin, token, onCheckinComplete]);

  // Debounced auto-save
  const debouncedAutoSave = useCallback((data) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave(data);
    }, 1500); // 1.5 second delay
  }, [autoSave]);

  const handleDimensionChange = (dimension, rating) => {
    const newDimensions = {
      ...dimensions,
      [dimension]: {
        ...dimensions[dimension],
        rating
      }
    };
    
    setDimensions(newDimensions);
    
    // Trigger auto-save with new data
    debouncedAutoSave({
      dimensions: newDimensions,
      dailyNotes,
      dayReflection
    });
  };





  const isFormComplete = Object.values(dimensions).every(dim => dim.rating > 0);



  return (
    <div className="space-y-4">
      {/* Status Message */}
      {hasCheckedInToday && (
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-[#3CCB7F]/20 border border-[#3CCB7F] rounded-full px-3 py-1">
            <CheckCircle className="text-[#3CCB7F]" size={14} />
            <span className="text-[#3CCB7F] text-xs font-medium">Already checked in today</span>
          </div>
        </div>
      )}

      {/* Mindfulness Level and Dimensions Section */}
      <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Mindfulness Glass */}
          <div className="lg:col-span-1">
            <MindfulnessGlass totalScore={totalScore} />
          </div>

          {/* Right Column - Dimension Sliders */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {/* Presence */}
              <MoonPhaseSlider
                value={dimensions.presence.rating}
                onChange={(rating) => handleDimensionChange('presence', rating)}
                dimension="presence"
              />

              {/* Emotion Awareness */}
              <MoonPhaseSlider
                value={dimensions.emotionAwareness.rating}
                onChange={(rating) => handleDimensionChange('emotionAwareness', rating)}
                dimension="emotionAwareness"
              />

              {/* Intentionality */}
              <MoonPhaseSlider
                value={dimensions.intentionality.rating}
                onChange={(rating) => handleDimensionChange('intentionality', rating)}
                dimension="intentionality"
              />

              {/* Attention Quality */}
              <MoonPhaseSlider
                value={dimensions.attentionQuality.rating}
                onChange={(rating) => handleDimensionChange('attentionQuality', rating)}
                dimension="attentionQuality"
              />

              {/* Compassion */}
              <MoonPhaseSlider
                value={dimensions.compassion.rating}
                onChange={(rating) => handleDimensionChange('compassion', rating)}
                dimension="compassion"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Day Reflection Section */}
      <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6">
        <label className="block text-sm font-medium text-[#E8EEF2] mb-3 font-oswald tracking-wide">
          Day Reflection
        </label>
        <textarea
          value={dayReflection}
          onChange={(e) => {
            const newValue = e.target.value;
            setDayReflection(newValue);
            
            // Trigger auto-save with updated reflection
            debouncedAutoSave({
              dimensions,
              dailyNotes,
              dayReflection: newValue
            });
          }}
          placeholder="Reflect on your day... What moments stood out? How did you feel? What did you learn?"
          className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-md text-[#E8EEF2] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3CCB7F] focus:border-transparent resize-none"
          rows="4"
        />
        <p className="text-xs text-[#6B7280] mt-2">
          This reflection will be added to your journal and displayed in the Content tab.
        </p>
      </div>

      {/* Auto-save Status */}
      <div className="flex justify-center mt-6">
        <div className="flex items-center gap-3 text-sm">
          {autoSaving ? (
            <div className="flex items-center gap-2 text-[#3CCB7F]">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#3CCB7F]"></div>
              <span>Auto-saving...</span>
            </div>
          ) : lastSaved ? (
            <div className="flex items-center gap-2 text-[#6B7280]">
              <CheckCircle size={16} />
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#6B7280]">
              <Clock size={16} />
              <span>Changes will be saved automatically</span>
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {hasCheckedInToday && (
        <div className="text-center text-[#3CCB7F] text-sm">
          <Sparkles className="inline-block mr-2" size={16} />
          Check-in recorded
        </div>
      )}
    </div>
  );
};

export default MindfulnessCheckin;

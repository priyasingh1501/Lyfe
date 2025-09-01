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

  // Manual save state
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Calculate total score
  const totalScore = Object.values(dimensions).reduce((sum, dim) => sum + dim.rating, 0);

  // Check if user has already checked in today
  useEffect(() => {
    const checkTodayCheckin = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        console.log('Checking for existing check-in on date:', today);
        console.log('Current date object:', new Date());
        const response = await axios.get(`${buildApiUrl('/api/mindfulness/date')}/${today}`, {
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



  // Manual save function
  const saveCheckin = useCallback(async () => {
    console.log('Manual save triggered');
    console.log('=== VALIDATION DEBUG ===');
    console.log('Current dimensions state:', dimensions);
    console.log('Individual ratings:');
    Object.entries(dimensions).forEach(([key, value]) => {
      console.log(`  ${key}: ${value.rating} (type: ${typeof value.rating})`);
    });
    
    // Check if all dimensions are rated (model requirement)
    const unratedDimensions = Object.values(dimensions).filter(dim => dim.rating === 0);
    console.log('Unrated dimensions count:', unratedDimensions.length);
    console.log('Unrated dimensions:', unratedDimensions);
    
    if (unratedDimensions.length > 0) {
      const unratedNames = Object.keys(dimensions).filter(key => dimensions[key].rating === 0);
      console.log('Validation failed - unrated dimensions found:', unratedNames);
      alert(`Please rate ALL mindfulness dimensions before saving:\n\nMissing ratings for: ${unratedNames.join(', ')}\n\nEach dimension must have a rating from 1-5.`);
      return;
    }
    
    console.log('Validation passed - all dimensions rated');
    
    // Validate that all ratings are between 1-5
    const invalidRatings = Object.values(dimensions).filter(dim => dim.rating < 1 || dim.rating > 5);
    console.log('Invalid ratings:', invalidRatings);
    
    if (invalidRatings.length > 0) {
      alert('All mindfulness ratings must be between 1 and 5.');
      return;
    }
    
    // Calculate total score and overall assessment (server expects these)
    const ratings = [
      parseInt(dimensions.presence.rating),
      parseInt(dimensions.emotionAwareness.rating),
      parseInt(dimensions.intentionality.rating),
      parseInt(dimensions.attentionQuality.rating),
      parseInt(dimensions.compassion.rating)
    ];
    
    const totalScore = ratings.reduce((sum, rating) => sum + rating, 0);
    
    let overallAssessment;
    if (totalScore >= 20) {
      overallAssessment = 'master';
    } else if (totalScore >= 17) {
      overallAssessment = 'advanced';
    } else if (totalScore >= 14) {
      overallAssessment = 'intermediate';
    } else if (totalScore >= 11) {
      overallAssessment = 'developing';
    } else {
      overallAssessment = 'beginner';
    }
    
    // Create validated data with all required fields
    const validatedData = {
      dimensions: {
        presence: { rating: parseInt(dimensions.presence.rating) },
        emotionAwareness: { rating: parseInt(dimensions.emotionAwareness.rating) },
        intentionality: { rating: parseInt(dimensions.intentionality.rating) },
        attentionQuality: { rating: parseInt(dimensions.attentionQuality.rating) },
        compassion: { rating: parseInt(dimensions.compassion.rating) }
      },
      totalScore,
      overallAssessment,
      dailyNotes: dailyNotes || '',
      dayReflection: dayReflection || ''
    };
    
    console.log('Validated data for save:', validatedData);
    console.log('Raw dimensions state:', dimensions);
    console.log('Data being sent to server:', JSON.stringify(validatedData, null, 2));
    console.log('About to make API call...');

    setSaving(true);
    console.log('Starting save...');
    
    try {
      console.log('Has checked in today:', hasCheckedInToday);
      console.log('Today checkin:', todayCheckin);

      if (hasCheckedInToday && todayCheckin) {
        // Update existing check-in
        console.log('Updating existing check-in:', todayCheckin._id);
        const response = await axios.put(`${buildApiUrl('/api/mindfulness')}/${todayCheckin._id}`, validatedData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Update response:', response.data);
      } else {
        // Create new check-in
        console.log('Creating new check-in');
        console.log('Sending data to server:', validatedData);
        
        try {
          const response = await axios.post(`${buildApiUrl('/api/mindfulness')}`, validatedData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('Create response:', response.data);
          setHasCheckedInToday(true);
          setTodayCheckin(response.data.checkin);
        } catch (postError) {
          console.error('POST request failed:', postError);
          console.error('POST error response:', postError.response?.data);
          throw postError; // Re-throw to be caught by outer catch
        }
      }

      setLastSaved(new Date());
      console.log('Save completed successfully');
      
      if (onCheckinComplete) {
        onCheckinComplete();
      }
    } catch (error) {
      console.error('Error saving mindfulness check-in:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      // Show more detailed error info for debugging
      if (error.response?.status === 500) {
        console.error('Server error - check server logs for details');
      } else if (error.response?.status === 404) {
        console.error('Endpoint not found - check API route');
      }
      
      // Don't show error toast for auto-save to avoid spam
    } finally {
      setSaving(false);
      console.log('Save finished');
    }
  }, [hasCheckedInToday, todayCheckin, token, onCheckinComplete, dimensions, dailyNotes, dayReflection]);



  const handleDimensionChange = (dimension, rating) => {
    console.log('Dimension change:', dimension, 'rating:', rating);
    
    const newDimensions = {
      ...dimensions,
      [dimension]: {
        ...dimensions[dimension],
        rating
      }
    };
    
    console.log('New dimensions:', newDimensions);
    setDimensions(newDimensions);
  };





  const isFormComplete = Object.values(dimensions).every(dim => dim.rating > 0);
  
  // Get count of rated dimensions
  const ratedDimensionsCount = Object.values(dimensions).filter(dim => dim.rating > 0).length;
  const totalDimensions = Object.keys(dimensions).length;



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
          }}
          placeholder="Reflect on your day... What moments stood out? How did you feel? What did you learn?"
          className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-md text-[#E8EEF2] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#3CCB7F] focus:border-transparent resize-none"
          rows="4"
        />
        <p className="text-xs text-[#6B7280] mt-2">
          This reflection will be added to your journal and displayed in the Content tab.
        </p>
      </div>

      {/* Save Status */}
      <div className="flex justify-center mt-6">
        <div className="flex items-center gap-3 text-sm">
          {saving ? (
            <div className="flex items-center gap-2 text-[#3CCB7F]">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#3CCB7F]"></div>
              <span>Saving...</span>
            </div>
          ) : lastSaved ? (
            <div className="flex items-center gap-2 text-[#6B7280]">
              <CheckCircle size={16} />
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#6B7280]">
              <Clock size={16} />
              <span>Click Save to record your mindfulness check-in</span>
            </div>
          )}
        </div>
      </div>
      

      
      {/* Progress Indicator */}
      <div className="text-center mt-4 mb-2">
        <div className="text-sm text-[#94A3B8] mb-2">
          {ratedDimensionsCount === totalDimensions ? (
            <span className="text-[#3CCB7F]">✅ All dimensions rated! Ready to save.</span>
          ) : (
            <span>📊 {ratedDimensionsCount} of {totalDimensions} dimensions rated</span>
          )}
        </div>
        <div className="w-full bg-[#2A313A] rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-[#3CCB7F] to-[#4ECDC4] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(ratedDimensionsCount / totalDimensions) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Manual Save Button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={saveCheckin}
          disabled={saving || ratedDimensionsCount < totalDimensions}
          className="px-6 py-3 bg-gradient-to-r from-[#3CCB7F] to-[#4ECDC4] text-white rounded-lg hover:from-[#3CCB7F]/90 hover:to-[#4ECDC4]/90 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-[#6B7280] disabled:to-[#6B7280]"
        >
          {saving ? '💾 Saving...' : ratedDimensionsCount < totalDimensions ? '⚠️ Rate All Dimensions First' : '💾 Save Mindfulness Check-in'}
        </button>
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

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Heart, Zap, Moon, Sun, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import axios from 'axios';

const MindfulnessScore = () => {
  const { token } = useAuth();
  const [mindfulnessData, setMindfulnessData] = useState({
    todayScore: 0,
    weeklyAverage: 0,
    recentCheckins: [],
    trends: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMindfulnessData();
  }, []);

  const fetchMindfulnessData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await axios.get(
        buildApiUrl(`/api/mindfulness/checkins?startDate=${weekAgo}&endDate=${today}`),
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const checkins = response.data || [];
      const todayCheckin = checkins.find(c => c.date === today);
      const weeklyScores = checkins.map(c => c.overallScore || 0);
      const weeklyAverage = weeklyScores.length > 0 
        ? weeklyScores.reduce((a, b) => a + b, 0) / weeklyScores.length 
        : 0;

      setMindfulnessData({
        todayScore: todayCheckin?.overallScore || 0,
        weeklyAverage: Math.round(weeklyAverage),
        recentCheckins: checkins.slice(-3),
        trends: {
          improving: weeklyAverage > 6,
          stable: weeklyAverage >= 4 && weeklyAverage <= 6,
          declining: weeklyAverage < 4
        }
      });
    } catch (error) {
      console.error('Error fetching mindfulness data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-[#3CCB7F]';
    if (score >= 6) return 'text-[#3EA6FF]';
    if (score >= 4) return 'text-[#FFD200]';
    return 'text-[#D64545]';
  };

  const getScoreBgColor = (score) => {
    if (score >= 8) return 'bg-[#3CCB7F]';
    if (score >= 6) return 'bg-[#3EA6FF]';
    if (score >= 4) return 'bg-[#FFD200]';
    return 'bg-[#D64545]';
  };

  const getScoreLabel = (score) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Needs Attention';
  };

  const getTrendIcon = () => {
    if (mindfulnessData.trends.improving) return TrendingUp;
    return Brain;
  };

  const getTrendColor = () => {
    if (mindfulnessData.trends.improving) return 'text-[#3CCB7F]';
    if (mindfulnessData.trends.stable) return 'text-[#3EA6FF]';
    return 'text-[#D64545]';
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-4 lg:p-6 relative overflow-hidden"
        style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-[#2A313A] rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-[#2A313A] rounded"></div>
            <div className="h-4 bg-[#2A313A] rounded w-2/3"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  const TrendIcon = getTrendIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-4 lg:p-6 relative overflow-hidden"
      style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
    >
      {/* Film grain overlay */}
      <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
      
      {/* Reason Strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#9B59B6] via-[#3EA6FF] to-[#3CCB7F]"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#9B59B6] bg-opacity-20 rounded-lg">
            <Brain className="h-5 w-5 text-[#9B59B6]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#E8EEF2] font-oswald tracking-wide">MINDFULNESS</h3>
            <p className="text-sm text-[#C9D1D9] font-inter">Today's mental state</p>
          </div>
        </div>
        <a 
          href="/goal-aligned-day" 
          className="text-sm text-[#FFD200] hover:text-[#FFD200]/80 font-medium flex items-center font-oswald tracking-wide"
        >
          CHECK IN
        </a>
      </div>

      <div className="space-y-4 relative z-10">
        {/* Today's Score */}
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getScoreBgColor(mindfulnessData.todayScore)} bg-opacity-20 border-2 ${getScoreBgColor(mindfulnessData.todayScore)} border-opacity-30 mb-3`}>
            <span className={`text-2xl font-bold ${getScoreColor(mindfulnessData.todayScore)}`}>
              {mindfulnessData.todayScore}
            </span>
          </div>
          <div className="space-y-1">
            <div className={`text-lg font-semibold ${getScoreColor(mindfulnessData.todayScore)}`}>
              {getScoreLabel(mindfulnessData.todayScore)}
            </div>
            <div className="text-sm text-[#C9D1D9]">
              Today's Score
            </div>
          </div>
        </div>

        {/* Weekly Average */}
        <div className="bg-[#0A0C0F] border border-[#2A313A] rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendIcon className={`h-4 w-4 ${getTrendColor()}`} />
              <span className="text-sm font-medium text-[#E8EEF2]">Weekly Average</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-lg font-bold ${getScoreColor(mindfulnessData.weeklyAverage)}`}>
                {mindfulnessData.weeklyAverage}
              </span>
              <span className="text-xs text-[#C9D1D9]">/10</span>
            </div>
          </div>
          <div className="mt-2 w-full bg-[#2A313A] rounded-full h-1">
            <div 
              className={`h-1 rounded-full transition-all duration-500 ${getScoreBgColor(mindfulnessData.weeklyAverage)}`}
              style={{ width: `${(mindfulnessData.weeklyAverage / 10) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Recent Check-ins */}
        {mindfulnessData.recentCheckins.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-[#E8EEF2] font-oswald tracking-wide">Recent Check-ins</h4>
            <div className="space-y-2">
              {mindfulnessData.recentCheckins.map((checkin, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-[#0A0C0F] rounded border border-[#2A313A]">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getScoreBgColor(checkin.overallScore || 0)}`}></div>
                    <span className="text-sm text-[#E8EEF2]">
                      {new Date(checkin.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${getScoreColor(checkin.overallScore || 0)}`}>
                      {checkin.overallScore || 0}
                    </span>
                    <span className="text-xs text-[#C9D1D9]">/10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {mindfulnessData.todayScore === 0 && mindfulnessData.recentCheckins.length === 0 && (
          <div className="text-center py-4">
            <Brain className="h-8 w-8 text-[#C9D1D9] mx-auto mb-2" />
            <p className="text-sm text-[#C9D1D9] mb-3">No mindfulness data yet</p>
            <a 
              href="/goal-aligned-day" 
              className="text-xs text-[#FFD200] hover:text-[#FFD200]/80 font-oswald tracking-wide"
            >
              START CHECKING IN
            </a>
          </div>
        )}
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-6 h-6 bg-[#9B59B6]"></div>
      <div className="absolute bottom-0 left-0 w-6 h-6 bg-[#3EA6FF]"></div>
    </motion.div>
  );
};

export default MindfulnessScore;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import axios from 'axios';
import Card from '../ui/Card';

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
    if (score >= 8) return 'text-[#1E49C9]';
    if (score >= 6) return 'text-[#1E49C9]';
    if (score >= 4) return 'text-[#1E49C9]';
    return 'text-[#1E49C9]';
  };

  const getScoreBgColor = (score) => {
    if (score >= 8) return 'bg-[#1E49C9]';
    if (score >= 6) return 'bg-[#1E49C9]';
    if (score >= 4) return 'bg-[#1E49C9]';
    return 'bg-[#1E49C9]';
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
    if (mindfulnessData.trends.improving) return 'text-[#1E49C9]';
    if (mindfulnessData.trends.stable) return 'text-[#1E49C9]';
    return 'text-[#1E49C9]';
  };

  if (loading) {
    return (
      <Card
        title="MINDFULNESS"
        subtitle="Today's mental state"
        icon={<Brain className="h-5 w-5 text-[#1E49C9]" />}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-[#2A313A] rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-[#2A313A] rounded"></div>
            <div className="h-4 bg-[#2A313A] rounded w-2/3"></div>
          </div>
        </div>
      </Card>
    );
  }

  const TrendIcon = getTrendIcon();

  return (
    <Card
      title="MINDFULNESS"
      subtitle="Today's mental state"
      icon={<Brain className="h-5 w-5 text-[#1E49C9]" />}
    >
      {/* Header Action */}
      <div className="flex justify-end mb-4">
        <a 
          href="/goal-aligned-day" 
          className="font-jakarta text-sm leading-relaxed tracking-wider text-[#1E49C9] hover:text-[#1E49C9]/80 font-medium flex items-center"
        >
          CHECK IN
        </a>
      </div>

      <div className="space-y-6">
        {/* Today's Score */}
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getScoreBgColor(mindfulnessData.todayScore)} bg-opacity-20 border-2 ${getScoreBgColor(mindfulnessData.todayScore)} border-opacity-30 mb-3`}>
            <span className={`text-2xl font-bold ${getScoreColor(mindfulnessData.todayScore)}`}>
              {mindfulnessData.todayScore}
            </span>
          </div>
            <div className="space-y-1">
              <div className={`font-jakarta text-2xl leading-normal font-bold ${getScoreColor(mindfulnessData.todayScore)}`}>
                {getScoreLabel(mindfulnessData.todayScore)}
              </div>
              <div className="font-jakarta text-sm leading-relaxed text-text-secondary">
                Today's Score
              </div>
            </div>
        </div>

        {/* Weekly Average */}
        <div className="bg-[#0A0C0F] border border-[#2A313A] rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendIcon className={`h-4 w-4 ${getTrendColor()}`} />
              <span className="font-jakarta text-sm leading-relaxed text-text-primary font-medium">Weekly Average</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`font-jakarta text-lg font-bold ${getScoreColor(mindfulnessData.weeklyAverage)}`}>
                {mindfulnessData.weeklyAverage}
              </span>
              <span className="font-jakarta text-xs text-text-secondary">/10</span>
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
            <h4 className="font-jakarta text-2xl leading-normal text-text-primary font-bold tracking-wide">Recent Check-ins</h4>
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
            <p className="font-jakarta text-sm text-text-secondary mb-3">No mindfulness data yet</p>
            <a 
              href="/goal-aligned-day" 
              className="font-jakarta text-xs text-[#1E49C9] hover:text-[#1E49C9]/80 leading-relaxed tracking-wider"
            >
              START CHECKING IN
            </a>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MindfulnessScore;

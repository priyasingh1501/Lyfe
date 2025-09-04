import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  Heart, 
  Lightbulb,
  Brain,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import toast from 'react-hot-toast';

const JournalTrends = () => {
  const { token } = useAuth();
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(buildApiUrl('/api/journal/trends?limit=20'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrends(data.trendAnalysis);
      } else {
        toast.error('Failed to fetch trends');
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
      toast.error('Failed to fetch trends');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchTrends();
    }
  }, [token, fetchTrends]);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return TrendingUp;
      case 'declining': return TrendingDown;
      case 'volatile': return BarChart3;
      default: return Minus;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving': return 'text-green-400';
      case 'declining': return 'text-red-400';
      case 'volatile': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendBgColor = (trend) => {
    switch (trend) {
      case 'improving': return 'bg-green-500';
      case 'declining': return 'bg-red-500';
      case 'volatile': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (!trends) {
    return (
      <div className="bg-gray-900 border-2 border-gray-600 rounded-lg p-6 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2 font-oswald tracking-wide">Journal Trends</h3>
            <p className="text-gray-400 font-inter mb-4">Analyze patterns in your journal entries</p>
            <button
              onClick={fetchTrends}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors duration-200 disabled:opacity-50 font-oswald tracking-wide"
            >
              {loading ? 'Loading...' : 'Load Trends'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 border-2 border-gray-600 rounded-lg p-6 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
    >
      {/* Film grain overlay */}
      <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
      
      {/* Reason Strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500 bg-opacity-20 rounded-lg">
            <Brain className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white font-oswald tracking-wide">Alfred's Trend Analysis</h3>
            <p className="text-sm text-gray-400 font-inter">Insights from your journal patterns</p>
          </div>
        </div>
        <button
          onClick={fetchTrends}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-6 relative z-10">
        {/* Sentiment Trend */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white font-oswald tracking-wide flex items-center">
              <BarChart3 className="h-4 w-4 mr-2 text-green-400" />
              Sentiment Trend
            </h4>
            <div className="flex items-center space-x-2">
              {React.createElement(getTrendIcon(trends.sentimentTrend), { 
                className: `h-4 w-4 ${getTrendColor(trends.sentimentTrend)}` 
              })}
              <span className={`text-sm font-medium capitalize ${getTrendColor(trends.sentimentTrend)}`}>
                {trends.sentimentTrend}
              </span>
            </div>
          </div>
          <div className={`w-full h-2 rounded-full ${getTrendBgColor(trends.sentimentTrend)} bg-opacity-20`}>
            <div 
              className={`h-2 rounded-full ${getTrendBgColor(trends.sentimentTrend)} transition-all duration-1000`}
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>

        {/* Common Topics */}
        {trends.commonTopics && trends.commonTopics.length > 0 && (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3 font-oswald tracking-wide flex items-center">
              <Lightbulb className="h-4 w-4 mr-2 text-yellow-400" />
              Common Topics
            </h4>
            <div className="flex flex-wrap gap-2">
              {trends.commonTopics.map((topic, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-yellow-500 bg-opacity-20 text-yellow-300 text-sm rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Evolving Beliefs */}
        {trends.evolvingBeliefs && trends.evolvingBeliefs.length > 0 && (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-white mb-3 font-oswald tracking-wide flex items-center">
              <Heart className="h-4 w-4 mr-2 text-pink-400" />
              Evolving Beliefs
            </h4>
            <div className="space-y-2">
              {trends.evolvingBeliefs.map((belief, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 bg-pink-500 bg-opacity-10 rounded-lg">
                  <Heart className="h-4 w-4 mt-0.5 text-pink-400" />
                  <p className="text-sm text-gray-300 font-inter">{belief}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-3 font-oswald tracking-wide flex items-center">
            <Brain className="h-4 w-4 mr-2 text-blue-400" />
            Overall Summary
          </h4>
          <p className="text-sm text-gray-300 font-inter leading-relaxed">{trends.summary}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default JournalTrends;

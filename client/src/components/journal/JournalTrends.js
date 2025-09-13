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
import Card from '../ui/Card';

const JournalTrends = () => {
  const { token } = useAuth();
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  const fetchTrends = useCallback(async (forceRefresh = false) => {
    if (!token || loading) return;
    
    setLoading(true);
    setError(null);
    try {
      const url = forceRefresh 
        ? buildApiUrl('/api/journal/trends/refresh')
        : buildApiUrl('/api/journal/trends?limit=20');
      
      const method = forceRefresh ? 'POST' : 'GET';
      const body = forceRefresh ? JSON.stringify({ timeRange: 'month', limit: 20 }) : undefined;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrends(data.trendAnalysis);
        setError(null);
        
        // Show success message for refresh
        if (forceRefresh) {
          toast.success('Trends refreshed successfully');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Failed to fetch trends';
        setError(errorMessage);
        // Only show toast error once
        if (!hasAttemptedFetch) {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
      setError('Network error');
      // Only show toast error once
      if (!hasAttemptedFetch) {
        toast.error('Failed to fetch trends');
      }
    } finally {
      setLoading(false);
      setHasAttemptedFetch(true);
    }
  }, [token, loading, hasAttemptedFetch]);

  useEffect(() => {
    if (token && !hasAttemptedFetch) {
      fetchTrends();
    }
  }, [token, fetchTrends, hasAttemptedFetch]);

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

  if (!trends && !error) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Brain className="h-12 w-12 text-text-secondary mx-auto mb-4" />
            <button
              onClick={fetchTrends}
              disabled={loading}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-500/90 transition-colors duration-200 disabled:opacity-50 font-jakarta leading-relaxed tracking-wider"
            >
              {loading ? 'Loading...' : 'Load Trends'}
            </button>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Brain className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchTrends}
              disabled={loading}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-500/90 transition-colors duration-200 disabled:opacity-50 font-jakarta leading-relaxed tracking-wider"
            >
              {loading ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
    >
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary-500 bg-opacity-20 rounded-lg">
            <Brain className="h-5 w-5 text-primary-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary font-jakarta tracking-wide">Journal Trends</h3>
            <p className="text-sm text-text-secondary">Your emotional patterns and insights</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fetchTrends(true)}
            disabled={loading}
            className="px-3 py-1.5 text-xs bg-primary-500 text-white rounded-lg hover:bg-primary-500/90 transition-colors duration-200 disabled:opacity-50 font-jakarta leading-relaxed tracking-wider"
            title="Refresh trends"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => fetchTrends(false)}
            disabled={loading}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
            title="Reload trends"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        {/* Emotion Trend */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-text-primary font-jakarta tracking-wide flex items-center">
              <BarChart3 className="h-4 w-4 mr-2 text-green-400" />
              Emotion Trend
            </h4>
            <div className="flex items-center space-x-2">
              {React.createElement(getTrendIcon(trends.emotionTrend || trends.sentimentTrend), { 
                className: `h-4 w-4 ${getTrendColor(trends.emotionTrend || trends.sentimentTrend)}` 
              })}
              <span className={`text-sm font-medium capitalize ${getTrendColor(trends.emotionTrend || trends.sentimentTrend)}`}>
                {trends.emotionTrend || trends.sentimentTrend}
              </span>
            </div>
          </div>
          <div className={`w-full h-2 rounded-full ${getTrendBgColor(trends.emotionTrend || trends.sentimentTrend)} bg-opacity-20`}>
            <div 
              className={`h-2 rounded-full ${getTrendBgColor(trends.emotionTrend || trends.sentimentTrend)} transition-all duration-1000`}
              style={{ width: '100%' }}
            ></div>
          </div>
        </Card>

        {/* Common Topics */}
        {trends.commonTopics && trends.commonTopics.length > 0 && (
          <Card className="p-4">
            <h4 className="text-sm font-semibold text-text-primary mb-3 font-jakarta tracking-wide flex items-center">
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
          </Card>
        )}

        {/* Evolving Beliefs */}
        {trends.evolvingBeliefs && trends.evolvingBeliefs.length > 0 && (
          <Card className="p-4">
            <h4 className="text-sm font-semibold text-text-primary mb-3 font-jakarta tracking-wide flex items-center">
              <Heart className="h-4 w-4 mr-2 text-pink-400" />
              Evolving Beliefs
            </h4>
            <div className="space-y-2">
              {trends.evolvingBeliefs.map((belief, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 bg-pink-500 bg-opacity-10 rounded-lg">
                  <Heart className="h-4 w-4 mt-0.5 text-pink-400" />
                  <p className="text-sm text-text-secondary font-jakarta">{belief}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

      </div>
    </Card>
  );
};

export default JournalTrends;

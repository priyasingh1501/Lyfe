import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  Heart, 
  Lightbulb,
  Brain,
  RefreshCw,
  Calendar,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Users,
  Sun,
  Moon,
  ChevronRight,
  ChevronDown,
  Download,
  Filter
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import toast from 'react-hot-toast';
import Card from '../ui/Card';

const EnhancedJournalTrends = () => {
  const { token } = useAuth();
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('month');
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    emotions: true,
    topics: true,
    beliefs: true,
    insights: true
  });

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(buildApiUrl(`/api/journal/trends?limit=50&timeRange=${timeRange}`), {
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
  }, [token, timeRange]);

  useEffect(() => {
    if (token) {
      fetchTrends();
    }
  }, [token, fetchTrends]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      joy: 'text-yellow-400',
      sadness: 'text-blue-400',
      anger: 'text-red-400',
      fear: 'text-purple-400',
      love: 'text-pink-400',
      anxiety: 'text-red-300',
      excitement: 'text-orange-400',
      contentment: 'text-green-400',
      gratitude: 'text-yellow-500',
      hope: 'text-blue-300',
      peace: 'text-indigo-400',
      overwhelmed: 'text-red-500',
      confident: 'text-green-500',
      motivated: 'text-orange-500',
      calm: 'text-blue-300',
      stressed: 'text-red-400',
      curious: 'text-purple-400',
      nostalgic: 'text-indigo-500'
    };
    return colors[emotion] || 'text-gray-400';
  };

  const getEmotionBgColor = (emotion) => {
    const colors = {
      joy: 'bg-yellow-500',
      sadness: 'bg-blue-500',
      anger: 'bg-red-500',
      fear: 'bg-purple-500',
      love: 'bg-pink-500',
      anxiety: 'bg-red-400',
      excitement: 'bg-orange-500',
      contentment: 'bg-green-500',
      gratitude: 'bg-yellow-600',
      hope: 'bg-blue-400',
      peace: 'bg-indigo-500',
      overwhelmed: 'bg-red-600',
      confident: 'bg-green-600',
      motivated: 'bg-orange-600',
      calm: 'bg-blue-400',
      stressed: 'bg-red-500',
      curious: 'bg-purple-500',
      nostalgic: 'bg-indigo-600'
    };
    return colors[emotion] || 'bg-gray-500';
  };

  const getGrowthIndicator = (trend) => {
    switch (trend) {
      case 'improving': return { icon: CheckCircle, color: 'text-green-400', text: 'Positive Growth' };
      case 'declining': return { icon: AlertTriangle, color: 'text-red-400', text: 'Needs Attention' };
      case 'volatile': return { icon: Zap, color: 'text-yellow-400', text: 'High Variability' };
      default: return { icon: Minus, color: 'text-gray-400', text: 'Stable' };
    }
  };

  if (!trends) {
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

  return (
    <Card>
      {/* Header with Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-500 bg-opacity-20 rounded-lg">
            <Brain className="h-5 w-5 text-primary-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary font-jakarta tracking-wide">Personal Insights</h3>
            <p className="text-sm text-text-secondary">Your emotional journey and growth patterns</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 bg-background-primary border border-border-primary rounded-lg text-text-primary text-sm focus:border-primary-500 focus:outline-none"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          
          <button
            onClick={fetchTrends}
            disabled={loading}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
            title="Refresh Analysis"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Growth Overview */}
        <Card className="p-4 bg-gradient-to-r from-primary-500/10 to-purple-500/10 border-primary-500/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-text-primary font-jakarta tracking-wide flex items-center">
              <Target className="h-4 w-4 mr-2 text-primary-400" />
              Growth Overview
            </h4>
            <div className="flex items-center space-x-2">
              {(() => {
                const indicator = getGrowthIndicator(trends.sentimentTrend);
                return (
                  <>
                    <indicator.icon className={`h-4 w-4 ${indicator.color}`} />
                    <span className={`text-sm font-medium ${indicator.color}`}>
                      {indicator.text}
                    </span>
                  </>
                );
              })()}
            </div>
          </div>
          <p className="text-sm text-text-secondary font-jakarta">
            {trends.summary || 'Your emotional patterns show interesting trends that reflect your personal growth journey.'}
          </p>
        </Card>

        {/* Emotion Analysis */}
        <Card className="p-4">
          <div 
            className="flex items-center justify-between cursor-pointer hover:bg-gray-700/50 transition-colors duration-200 rounded-lg p-2 -m-2"
            onClick={() => toggleSection('emotions')}
          >
            <h4 className="text-sm font-semibold text-text-primary font-jakarta tracking-wide flex items-center">
              <Heart className="h-4 w-4 mr-2 text-pink-400" />
              Emotional Patterns
            </h4>
            {expandedSections.emotions ? (
              <ChevronDown className="h-4 w-4 text-text-tertiary" />
            ) : (
              <ChevronRight className="h-4 w-4 text-text-tertiary" />
            )}
          </div>
          
          <AnimatePresence>
            {expandedSections.emotions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-3"
              >
                {/* Emotion Frequency */}
                {trends.emotionFrequency && (
                  <div>
                    <h5 className="text-xs font-medium text-text-tertiary mb-2 font-jakarta">Most Common Emotions</h5>
                    <div className="space-y-2">
                      {trends.emotionFrequency.slice(0, 5).map((emotion, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${getEmotionBgColor(emotion.name)}`}></div>
                            <span className={`text-sm font-medium ${getEmotionColor(emotion.name)}`}>
                              {emotion.name.charAt(0).toUpperCase() + emotion.name.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${getEmotionBgColor(emotion.name)}`}
                                style={{ width: `${(emotion.frequency / trends.emotionFrequency[0].frequency) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-text-tertiary">{emotion.frequency}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emotional Stability */}
                {trends.emotionalStability && (
                  <div>
                    <h5 className="text-xs font-medium text-text-tertiary mb-2 font-jakarta">Emotional Stability</h5>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${trends.emotionalStability.score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-text-primary">
                        {trends.emotionalStability.score}/100
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">
                      {trends.emotionalStability.description}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Topic Analysis */}
        <Card className="p-4">
          <div 
            className="flex items-center justify-between cursor-pointer hover:bg-gray-700/50 transition-colors duration-200 rounded-lg p-2 -m-2"
            onClick={() => toggleSection('topics')}
          >
            <h4 className="text-sm font-semibold text-text-primary font-jakarta tracking-wide flex items-center">
              <Lightbulb className="h-4 w-4 mr-2 text-yellow-400" />
              Recurring Themes
            </h4>
            {expandedSections.topics ? (
              <ChevronDown className="h-4 w-4 text-text-tertiary" />
            ) : (
              <ChevronRight className="h-4 w-4 text-text-tertiary" />
            )}
          </div>
          
          <AnimatePresence>
            {expandedSections.topics && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                {trends.commonTopics && trends.commonTopics.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {trends.commonTopics.map((topic, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-yellow-500 bg-opacity-20 text-yellow-300 text-sm rounded-full hover:bg-opacity-30 transition-colors duration-200 cursor-pointer"
                        onClick={() => setSelectedEmotion(topic)}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary font-jakarta">No recurring themes identified yet.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Belief Evolution */}
        <Card className="p-4">
          <div 
            className="flex items-center justify-between cursor-pointer hover:bg-gray-700/50 transition-colors duration-200 rounded-lg p-2 -m-2"
            onClick={() => toggleSection('beliefs')}
          >
            <h4 className="text-sm font-semibold text-text-primary font-jakarta tracking-wide flex items-center">
              <Heart className="h-4 w-4 mr-2 text-pink-400" />
              Evolving Beliefs
            </h4>
            {expandedSections.beliefs ? (
              <ChevronDown className="h-4 w-4 text-text-tertiary" />
            ) : (
              <ChevronRight className="h-4 w-4 text-text-tertiary" />
            )}
          </div>
          
          <AnimatePresence>
            {expandedSections.beliefs && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-2"
              >
                {trends.evolvingBeliefs && trends.evolvingBeliefs.length > 0 ? (
                  trends.evolvingBeliefs.map((belief, index) => (
                    <div key={index} className="flex items-start space-x-2 p-3 bg-pink-500 bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-colors duration-200">
                      <Heart className="h-4 w-4 mt-0.5 text-pink-400 flex-shrink-0" />
                      <p className="text-sm text-text-secondary font-jakarta">{belief}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-text-secondary font-jakarta">No evolving beliefs identified yet.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Actionable Insights */}
        <Card className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
          <div 
            className="flex items-center justify-between cursor-pointer hover:bg-gray-700/50 transition-colors duration-200 rounded-lg p-2 -m-2"
            onClick={() => toggleSection('insights')}
          >
            <h4 className="text-sm font-semibold text-text-primary font-jakarta tracking-wide flex items-center">
              <Zap className="h-4 w-4 mr-2 text-green-400" />
              Actionable Insights
            </h4>
            {expandedSections.insights ? (
              <ChevronDown className="h-4 w-4 text-text-tertiary" />
            ) : (
              <ChevronRight className="h-4 w-4 text-text-tertiary" />
            )}
          </div>
          
          <AnimatePresence>
            {expandedSections.insights && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-3"
              >
                {/* Growth Areas */}
                {trends.growthAreas && (
                  <div>
                    <h5 className="text-xs font-medium text-text-tertiary mb-2 font-jakarta">Areas of Growth</h5>
                    <div className="space-y-2">
                      {trends.growthAreas.map((area, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-green-500 bg-opacity-10 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-sm text-text-secondary font-jakarta">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {trends.recommendations && (
                  <div>
                    <h5 className="text-xs font-medium text-text-tertiary mb-2 font-jakarta">Recommendations</h5>
                    <div className="space-y-2">
                      {trends.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 bg-blue-500 bg-opacity-10 rounded-lg">
                          <Lightbulb className="h-4 w-4 text-blue-400 mt-0.5" />
                          <span className="text-sm text-text-secondary font-jakarta">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </Card>
  );
};

export default EnhancedJournalTrends;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Heart, 
  Lightbulb, 
  Target, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  BarChart3,
  MessageSquare
} from 'lucide-react';

const AlfredAnalysis = ({ analysis, entryId, onAnalyze }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  console.log('AlfredAnalysis received entryId:', entryId);

  // Safety check for malformed analysis data
  if (!analysis || typeof analysis !== 'object') {
    return (
      <div className="mt-4 p-4 bg-gray-800 border border-gray-600 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Alfred Analysis</span>
          </div>
          <button
            onClick={async () => {
              console.log('Analyze button clicked with entryId:', entryId);
              setIsAnalyzing(true);
              try {
                await onAnalyze(entryId);
              } finally {
                setIsAnalyzing(false);
              }
            }}
            disabled={isAnalyzing}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-400 transition-colors duration-200 disabled:opacity-50"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>
    );
  }

  const getSentimentColor = (label) => {
    if (!label) return 'text-gray-300';
    switch (label) {
      case 'very_positive': return 'text-green-400';
      case 'positive': return 'text-green-300';
      case 'neutral': return 'text-gray-300';
      case 'negative': return 'text-yellow-300';
      case 'very_negative': return 'text-red-400';
      default: return 'text-gray-300';
    }
  };

  const getSentimentBgColor = (label) => {
    if (!label) return 'bg-gray-500';
    switch (label) {
      case 'very_positive': return 'bg-green-500';
      case 'positive': return 'bg-green-400';
      case 'neutral': return 'bg-gray-500';
      case 'negative': return 'bg-yellow-500';
      case 'very_negative': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSentimentLabel = (label) => {
    if (!label) return 'Unknown';
    switch (label) {
      case 'very_positive': return 'Very Positive';
      case 'positive': return 'Positive';
      case 'neutral': return 'Neutral';
      case 'negative': return 'Negative';
      case 'very_negative': return 'Very Negative';
      default: return 'Unknown';
    }
  };

  const getBeliefCategoryIcon = (category) => {
    switch (category) {
      case 'personal_values': return Heart;
      case 'life_philosophy': return Lightbulb;
      case 'relationships': return MessageSquare;
      case 'work_ethics': return Target;
      case 'spirituality': return Sparkles;
      case 'health_wellness': return TrendingUp;
      default: return Brain;
    }
  };

  const getBeliefCategoryColor = (category) => {
    switch (category) {
      case 'personal_values': return 'text-pink-400';
      case 'life_philosophy': return 'text-yellow-400';
      case 'relationships': return 'text-blue-400';
      case 'work_ethics': return 'text-green-400';
      case 'spirituality': return 'text-purple-400';
      case 'health_wellness': return 'text-emerald-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 bg-gray-800 border border-gray-600 rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 bg-opacity-20 rounded-lg">
              <Brain className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white font-oswald tracking-wide">Alfred's Analysis</h4>
              <p className="text-xs text-gray-400 font-inter">
                Analyzed on {analysis?.analyzedAt ? new Date(analysis.analyzedAt).toLocaleDateString() : 'Unknown date'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getSentimentBgColor(analysis?.sentiment?.label)}`}></div>
            <span className={`text-sm font-medium ${getSentimentColor(analysis?.sentiment?.label)}`}>
              {getSentimentLabel(analysis?.sentiment?.label)}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-600"
          >
            <div className="p-4 space-y-4">
              {/* Summary */}
              <div>
                <h5 className="text-sm font-semibold text-white mb-2 font-oswald tracking-wide flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-blue-400" />
                  Summary
                </h5>
                <p className="text-sm text-gray-300 font-inter">{analysis?.summary || 'No summary available'}</p>
              </div>

              {/* Sentiment Analysis */}
              <div>
                <h5 className="text-sm font-semibold text-white mb-2 font-oswald tracking-wide flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2 text-green-400" />
                  Sentiment Analysis
                </h5>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Score:</span>
                    <span className={`text-sm font-medium ${getSentimentColor(analysis?.sentiment?.label)}`}>
                      {analysis?.sentiment?.score?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Confidence:</span>
                    <span className="text-sm text-gray-300">
                      {((analysis?.sentiment?.confidence || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Topics */}
              {analysis?.topics && analysis.topics.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-white mb-2 font-oswald tracking-wide flex items-center">
                    <Target className="h-4 w-4 mr-2 text-purple-400" />
                    Main Topics
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {analysis.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-purple-500 bg-opacity-20 text-purple-300 text-xs rounded-full"
                      >
                        {topic.name}
                        <span className="ml-1 text-purple-400">
                          ({(topic.confidence * 100).toFixed(0)}%)
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Beliefs and Values */}
              {analysis?.beliefs && analysis.beliefs.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-white mb-2 font-oswald tracking-wide flex items-center">
                    <Heart className="h-4 w-4 mr-2 text-pink-400" />
                    Beliefs & Values
                  </h5>
                  <div className="space-y-2">
                    {analysis.beliefs.map((belief, index) => {
                      const IconComponent = getBeliefCategoryIcon(belief.category);
                      return (
                        <div key={index} className="flex items-start space-x-2 p-2 bg-gray-700 rounded-lg">
                          <IconComponent className={`h-4 w-4 mt-0.5 ${getBeliefCategoryColor(belief.category)}`} />
                          <div className="flex-1">
                            <p className="text-sm text-gray-300 font-inter">{belief.belief}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-400 capitalize">
                                {belief.category.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({(belief.confidence * 100).toFixed(0)}% confidence)
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Insights */}
              {analysis?.insights && analysis.insights.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-white mb-2 font-oswald tracking-wide flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2 text-yellow-400" />
                    Insights
                  </h5>
                  <div className="space-y-2">
                    {analysis.insights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-2 p-2 bg-yellow-500 bg-opacity-10 rounded-lg">
                        <Sparkles className="h-4 w-4 mt-0.5 text-yellow-400" />
                        <p className="text-sm text-gray-300 font-inter">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AlfredAnalysis;

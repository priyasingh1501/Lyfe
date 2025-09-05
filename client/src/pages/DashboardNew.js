import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ArrowRight,
  RefreshCw,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { buildApiUrl } from '../config';
import toast from 'react-hot-toast';
import DailyMealKPIs from '../components/meal/DailyMealKPIs';
import JournalTrends from '../components/journal/JournalTrends';
import {
  FinancialOverview,
  QuickActions,
  GoalProgress,
  MindfulnessScore,
  RecentActivity,
  UpcomingReminders
} from '../components/dashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [welcomeImage, setWelcomeImage] = useState('/welcome.png');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [dashboardQuotes, setDashboardQuotes] = useState([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  
  // Debug: Log state changes
  useEffect(() => {
    console.log('Dashboard showImageUpload changed to:', showImageUpload);
  }, [showImageUpload]);

  useEffect(() => {
    fetchData();
    fetchDashboardQuotes();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(buildApiUrl('/api/tasks'), {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          date: new Date().toISOString().split('T')[0],
          status: 'completed'
        }
      });

      setTodayTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardQuotes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(buildApiUrl('/api/book-documents/quotes/all'), {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Dashboard quotes response:', response.data);
      setDashboardQuotes(response.data || []);
    } catch (error) {
      console.error('Error fetching dashboard quotes:', error);
    } finally {
      setQuotesLoading(false);
    }
  };

  // Quote of the Day functions
  const quotes = [
    // Osho quotes
    "Be realistic: Plan for a miracle.",
    "Life is not a problem to be solved, but a reality to be experienced.",
    "The moment you accept yourself, you become beautiful.",
    "Truth is not something outside to be discovered, it is something inside to be realized.",
    "Drop the idea of becoming someone, because you are already a masterpiece.",
    
    // Jiddu Krishnamurti quotes
    "The highest form of intelligence is the ability to observe without evaluating.",
    "Freedom is not a reaction; freedom is not a choice. Freedom is found in the choiceless awareness of our daily existence and activity.",
    "Truth is a pathless land, and you cannot approach it by any path whatsoever, by any religion, by any sect.",
    "It is no measure of health to be well adjusted to a profoundly sick society.",
    "The ability to observe without evaluating is the highest form of intelligence.",
    
    // Mahatma Gandhi quotes
    "Be the change you wish to see in the world.",
    "The future depends on what you do today.",
    "Happiness is when what you think, what you say, and what you do are in harmony.",
    "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    "The weak can never forgive. Forgiveness is the attribute of the strong.",
    
    // Swami Vivekananda quotes
    "Arise, awake, and stop not until the goal is reached.",
    "You cannot believe in God until you believe in yourself.",
    "The greatest sin is to think yourself weak.",
    "Take up one idea. Make that one idea your life - think of it, dream of it, live on that idea.",
    "Strength is life, weakness is death."
  ];

  const authors = [
    "Osho",
    "Osho", 
    "Osho",
    "Osho",
    "Osho",
    "Jiddu Krishnamurti",
    "Jiddu Krishnamurti",
    "Jiddu Krishnamurti", 
    "Jiddu Krishnamurti",
    "Jiddu Krishnamurti",
    "Mahatma Gandhi",
    "Mahatma Gandhi",
    "Mahatma Gandhi",
    "Mahatma Gandhi", 
    "Mahatma Gandhi",
    "Swami Vivekananda",
    "Swami Vivekananda",
    "Swami Vivekananda",
    "Swami Vivekananda",
    "Swami Vivekananda"
  ];

  const getQuoteOfTheDay = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    
    if (dashboardQuotes.length === 0) {
      // Fallback to hardcoded quotes if no dashboard quotes
      const dailyIndex = dayOfYear % quotes.length;
      return quotes[(dailyIndex + quoteIndex) % quotes.length];
    }
    
    const dailyIndex = dayOfYear % dashboardQuotes.length;
    return dashboardQuotes[(dailyIndex + quoteIndex) % dashboardQuotes.length]?.content || "No quotes available";
  };

  const getQuoteAuthor = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    
    if (dashboardQuotes.length === 0) {
      // Fallback to hardcoded quotes if no dashboard quotes
      const dailyIndex = dayOfYear % quotes.length;
      return authors[(dailyIndex + quoteIndex) % quotes.length];
    }
    
    const dailyIndex = dayOfYear % dashboardQuotes.length;
    return dashboardQuotes[(dailyIndex + quoteIndex) % dashboardQuotes.length]?.bookAuthor || "Unknown";
  };

  const refreshQuote = () => {
    if (dashboardQuotes.length === 0) {
      setQuoteIndex(prev => (prev + 1) % quotes.length);
    } else {
      setQuoteIndex(prev => (prev + 1) % dashboardQuotes.length);
    }
  };

  const getCurrentQuoteNumber = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    
    if (dashboardQuotes.length === 0) {
      const dailyIndex = dayOfYear % quotes.length;
      return ((dailyIndex + quoteIndex) % quotes.length) + 1;
    }
    
    const dailyIndex = dayOfYear % dashboardQuotes.length;
    return ((dailyIndex + quoteIndex) % dashboardQuotes.length) + 1;
  };

  const getQuoteSource = () => {
    if (dashboardQuotes.length === 0) return "";
    
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const dailyIndex = dayOfYear % dashboardQuotes.length;
    const currentQuote = dashboardQuotes[(dailyIndex + quoteIndex) % dashboardQuotes.length];
    return currentQuote?.bookTitle || "";
  };

  const handleImageUpload = (e) => {
    console.log('Dashboard image upload triggered:', e.target.files);
    const file = e.target.files[0];
    if (file) {
      console.log('Dashboard file selected:', file.name, file.type, file.size);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          console.log('Dashboard file read successfully, updating image');
          setWelcomeImage(event.target.result);
          setShowImageUpload(false);
          toast.success('Welcome image updated successfully!');
        };
        reader.readAsDataURL(file);
      } else {
        console.log('Dashboard invalid file type:', file.type);
        toast.error('Please select a valid image file');
      }
    } else {
      console.log('Dashboard no file selected');
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-0">
      {/* Welcome Header - Alfred Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-[#0A0C0F] to-[#11151A] border-2 border-[#2A313A] rounded-lg p-4 lg:p-6 relative overflow-hidden"
        style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
      >
        {/* Film grain overlay */}
        <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
        
        {/* Scan line effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FFD200]/10 to-transparent animate-pulse"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center">
          {/* Left side image */}
          <div className="flex-shrink-0 mb-4 lg:mb-0 lg:mr-6 relative group self-center lg:self-start">
            <img 
              src={welcomeImage} 
              alt="Welcome illustration" 
              className="w-20 h-20 lg:w-24 lg:h-24 object-cover rounded-lg border-2 border-[#2A313A] shadow-lg cursor-pointer transition-all duration-200 group-hover:border-[#FFD200] group-hover:shadow-[#FFD200]/20"
              onClick={() => {
                console.log('Dashboard image clicked, setting showImageUpload to true');
                setShowImageUpload(true);
              }}
              title="Click to change image"
            />
            
            {/* Upload overlay with button text */}
            <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center">
              <Upload className="h-5 w-5 text-white mb-2" />
              <span className="text-white text-xs font-medium font-oswald tracking-wide">Change Image</span>
            </div>
            
            {/* Upload button overlay - always visible on hover */}
            <div className="absolute -bottom-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-[#FFD200] text-[#0A0C0F] p-2 rounded-full shadow-lg border-2 border-[#0A0C0F]">
                <Upload className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          {/* Heading content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-xl lg:text-2xl font-bold mb-2 text-[#E8EEF2] font-oswald tracking-wide">
              Welcome back, {user?.firstName || 'User'}! 👋
            </h1>
            <p className="text-[#C9D1D9] font-inter">
              Here's your day at a glance
            </p>
          </div>
        </div>
        
        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-6 h-6 bg-[#FFD200]"></div>
      </motion.div>

      {/* Image Upload Modal */}
      {console.log('Dashboard showImageUpload state:', showImageUpload)}
      <AnimatePresence>
        {showImageUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-[#E8EEF2] mb-4 font-oswald tracking-wide">
                Update Welcome Image
              </h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <label 
                    htmlFor="welcome-image-upload-dashboard"
                    className="inline-flex items-center px-4 py-2 bg-[#FFD200] text-[#0A0C0F] rounded-lg hover:bg-[#FFB800] transition-colors duration-200 border border-[#FFD200] cursor-pointer font-oswald tracking-wide"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Choose Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="welcome-image-upload-dashboard"
                  />
                </div>
                
                <p className="text-sm text-[#C9D1D9] text-center">
                  Click the button above to select a new image. The image will be displayed in the welcome banner.
                </p>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowImageUpload(false)}
                  className="px-4 py-2 text-[#C9D1D9] bg-[#2A313A] rounded-lg hover:bg-[#3A414A] transition-colors duration-200 border border-[#2A313A]"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote of the Day - Mission Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-4 lg:p-6 relative overflow-hidden"
        style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
      >
        {/* Film grain overlay */}
        <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
        
        {/* Reason Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD200] via-[#3EA6FF] to-[#3CCB7F]"></div>
        
        <div className="text-center relative">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-medium text-[#FFD200] bg-[#0A0C0F] border border-[#2A313A] px-3 py-1 rounded font-oswald tracking-wide">
              MISSION BRIEFING
            </span>
            <button
              onClick={refreshQuote}
              className="p-1 text-[#FFD200] hover:text-[#FFD200]/80 hover:bg-[#2A313A] rounded transition-all duration-200 group"
              title="Get a new quote"
            >
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <button
              onClick={fetchDashboardQuotes}
              className="p-1 text-[#3EA6FF] hover:text-[#3EA6FF]/80 hover:bg-[#2A313A] rounded transition-all duration-200 group"
              title="Refresh quotes from API"
            >
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <span className="text-xs text-[#C9D1D9] font-mono">
              {getCurrentQuoteNumber()}/{dashboardQuotes.length > 0 ? dashboardQuotes.length : quotes.length}
            </span>
          </div>
          {quotesLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FFD200]"></div>
            </div>
          ) : (
            <>
              <blockquote className="text-base lg:text-lg font-medium text-[#E8EEF2] mb-3 italic leading-relaxed font-inter">
                "{getQuoteOfTheDay()}"
              </blockquote>
              <cite className="text-sm text-[#FFD200] font-medium font-oswald tracking-wide">
                — {getQuoteAuthor()}
              </cite>
              {dashboardQuotes.length > 0 && getQuoteSource() && (
                <p className="text-xs text-[#C9D1D9] font-inter mt-2">
                  from <span className="text-[#3EA6FF] font-medium">{getQuoteSource()}</span>
                </p>
              )}
              {dashboardQuotes.length === 0 && !quotesLoading && (
                <p className="text-xs text-[#C9D1D9] font-inter mt-2">
                  <span className="text-[#FFD200]">💡</span> Add quotes in Content tab to see them here
                </p>
              )}
              {/* Debug info - remove in production */}
              <div className="text-xs text-[#C9D1D9] font-inter mt-2 opacity-60">
                Debug: {dashboardQuotes.length} quotes loaded, {quotesLoading ? 'loading' : 'ready'}
              </div>
            </>
          )}
          
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 bg-[#FFD200]"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#3EA6FF]"></div>
        </div>
      </motion.div>

      {/* New Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Mission Status - Left Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-4 lg:p-6 relative overflow-hidden"
          style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
        >
          {/* Film grain overlay */}
          <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
          
          {/* Reason Strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3CCB7F] via-[#3EA6FF] to-[#FFD200]"></div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
            <div className="text-center lg:text-left">
              <h2 className="text-lg font-semibold text-[#E8EEF2] font-oswald tracking-wide">MISSION STATUS</h2>
              <p className="text-sm text-[#C9D1D9] font-inter">24-hour breakdown of your daily activities</p>
            </div>
            <a href="/goal-aligned-day" className="text-sm text-[#FFD200] hover:text-[#FFD200]/80 font-medium flex items-center justify-center font-oswald tracking-wide border border-[#2A313A] px-3 py-2 rounded hover:bg-[#2A313A] transition-all duration-200">
              VIEW DETAILS <ArrowRight size={16} className="ml-1" />
            </a>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : todayTasks.length > 0 ? (
            <div className="space-y-4">
              {/* Day Summary Stats - Chore Chips */}
              <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6">
                <div className="text-center p-3 bg-[#0A0C0F] border-2 border-[#3CCB7F] rounded-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#3CCB7F]"></div>
                  <p className="text-base lg:text-lg font-bold text-[#3CCB7F] font-mono">
                    {todayTasks.filter(task => {
                      if (!task.completedAt) return false;
                      const taskTime = new Date(task.completedAt);
                      const hour = taskTime.getHours();
                      return hour >= 0 && hour < 24;
                    }).filter(task => task.goalIds && task.goalIds.length > 0 && task.mindfulRating >= 4).length}
                  </p>
                  <p className="text-xs text-[#3CCB7F]/80 font-oswald tracking-wide">GOAL + MINDFUL</p>
                </div>
                <div className="text-center p-3 bg-[#0A0C0F] border-2 border-[#3EA6FF] rounded-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#3EA6FF]"></div>
                  <p className="text-base lg:text-lg font-bold text-[#3EA6FF] font-mono">
                    {todayTasks.filter(task => {
                      if (!task.completedAt) return false;
                      const taskTime = new Date(task.completedAt);
                      const hour = taskTime.getHours();
                      return hour >= 0 && hour < 24;
                    }).filter(task => task.goalIds && task.goalIds.length > 0 && task.mindfulRating < 4).length}
                  </p>
                  <p className="text-xs text-[#3EA6FF]/80 font-oswald tracking-wide">GOAL-ALIGNED</p>
                </div>
                <div className="text-center p-3 bg-[#0A0C0F] border-2 border-[#FFD200] rounded-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#FFD200]"></div>
                  <p className="text-base lg:text-lg font-bold text-[#FFD200] font-mono">
                    {todayTasks.filter(task => {
                      if (!task.completedAt) return false;
                      const taskTime = new Date(task.completedAt);
                      const hour = taskTime.getHours();
                      return hour >= 0 && hour < 24;
                    }).filter(task => (!task.goalIds || task.goalIds.length === 0) && task.mindfulRating >= 4).length}
                  </p>
                  <p className="text-xs text-[#FFD200]/80 font-oswald tracking-wide">MINDFUL</p>
                </div>
                <div className="text-center p-3 bg-[#0A0C0F] border-2 border-[#D64545] rounded-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#D64545]"></div>
                  <p className="text-base lg:text-lg font-bold text-[#D64545] font-mono">
                    {todayTasks.filter(task => {
                      if (!task.completedAt) return false;
                      const taskTime = new Date(task.completedAt);
                      const hour = taskTime.getHours();
                      return hour >= 0 && hour < 24;
                    }).filter(task => (!task.goalIds || task.goalIds.length === 0) && task.mindfulRating < 4).length}
                  </p>
                  <p className="text-xs text-[#D64545]/80 font-oswald tracking-wide">NOT MINDFUL, NOT GOAL-ORIENTED</p>
                </div>
              </div>
              
              {/* 24-Hour Strip - Progress Rings */}
              <div className="flex flex-wrap justify-center gap-1 max-w-full lg:max-w-4xl mx-auto overflow-x-auto">
                {Array.from({ length: 24 }, (_, hour) => {
                  const hourStart = new Date();
                  hourStart.setHours(hour, 0, 0, 0);
                  const hourEnd = new Date(hourStart);
                  hourEnd.setHours(hour + 1, 0, 0, 0);
                  
                  // Check if this hour has any activity
                  const hasActivity = todayTasks.some(task => {
                    if (!task.completedAt) return false;
                    const taskTime = new Date(task.completedAt);
                    return taskTime >= hourStart && taskTime < hourEnd;
                  });
                  
                  // Check if this hour has goal-aligned activity
                  const hasGoalAligned = todayTasks.some(task => {
                    if (!task.completedAt || !task.goalIds || task.goalIds.length === 0) return false;
                    const taskTime = new Date(task.completedAt);
                    return taskTime >= hourStart && taskTime < hourEnd;
                  });
                  
                  // Check if this hour has mindful activity
                  const hasMindful = todayTasks.some(task => {
                    if (!task.completedAt || !task.mindfulRating || task.mindfulRating < 4) return false;
                    const taskTime = new Date(task.completedAt);
                    return taskTime >= hourStart && taskTime < hourEnd;
                  });
                  
                  let color = 'bg-[#2A313A]'; // No activity
                  let borderColor = 'border-[#2A313A]';
                  let status = 'No activity';
                  
                  if (hasActivity) {
                    if (hasGoalAligned && hasMindful) {
                      color = 'bg-[#3CCB7F]'; // Goal-aligned + Mindful
                      borderColor = 'border-[#3CCB7F]';
                      status = 'Goal-aligned + Mindful';
                    } else if (hasGoalAligned) {
                      color = 'bg-[#3EA6FF]'; // Only Goal-aligned
                      borderColor = 'border-[#3EA6FF]';
                      status = 'Goal-aligned';
                    } else if (hasMindful) {
                      color = 'bg-[#FFD200]'; // Only Mindful
                      borderColor = 'border-[#FFD200]';
                      status = 'Mindful';
                    } else {
                      color = 'bg-[#D64545]'; // Not mindful, not goal-oriented
                      borderColor = 'border-[#D64545]';
                      status = 'Not Mindful, Not Goal-Oriented';
                    }
                  }
                  
                  // Format hour for display
                  const displayHour = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
                  
                  return (
                    <div key={hour} className="flex flex-col items-center group">
                      <div 
                        className={`w-3 h-4 lg:w-4 lg:h-5 xl:w-5 xl:h-6 rounded-sm ${color} border-2 ${borderColor} transition-all duration-300 hover:scale-125 cursor-pointer shadow-lg hover:shadow-[#FFD200]/20`}
                        title={`${displayHour}\n${status}`}
                      />
                      <span className="text-xs text-[#C9D1D9] mt-1 group-hover:text-[#FFD200] transition-colors font-mono">
                        {hour === 0 ? '12' : hour > 12 ? hour - 12 : hour}
                      </span>
                    </div>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 lg:gap-3 text-sm max-w-4xl mx-auto">
                <div className="flex items-center space-x-2 justify-center">
                  <div className="w-3 h-3 rounded-sm bg-[#3CCB7F]"></div>
                  <span className="text-[#C9D1D9] text-xs">Goal + Mindful</span>
                </div>
                <div className="flex items-center space-x-2 justify-center">
                  <div className="w-3 h-3 rounded-sm bg-[#3EA6FF]"></div>
                  <span className="text-[#C9D1D9] text-xs">Goal-aligned</span>
                </div>
                <div className="flex items-center space-x-2 justify-center">
                  <div className="w-3 h-3 rounded-sm bg-[#FFD200]"></div>
                  <span className="text-[#C9D1D9] text-xs">Mindful</span>
                </div>
                <div className="flex items-center space-x-2 justify-center">
                  <div className="w-3 h-3 rounded-sm bg-[#D64545]"></div>
                  <span className="text-[#C9D1D9] text-xs">Not Mindful, Not Goal-Oriented</span>
                </div>
                <div className="flex items-center space-x-2 justify-center">
                  <div className="w-3 h-3 rounded-sm bg-[#2A313A]"></div>
                  <span className="text-[#C9D1D9] text-xs">No activity</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#2A313A] rounded-full mx-auto mb-4 flex items-center justify-center">
                <Clock className="text-[#C9D1D9]" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-[#E8EEF2] mb-2">No Tasks Today</h3>
              <p className="text-[#C9D1D9] mb-4">Complete some tasks to see your day breakdown</p>
              <a 
                href="/goal-aligned-day" 
                className="inline-flex items-center px-4 py-2 bg-[#FFD200] text-[#0A0C0F] rounded-lg hover:bg-[#FFD200]/90 transition-colors font-oswald tracking-wide min-h-[44px]"
              >
                ADD YOUR FIRST TASK
              </a>
            </div>
          )}
        </motion.div>

        {/* Financial Overview - Right Column */}
        <FinancialOverview />
      </div>

      {/* Second Row - Three Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Daily Meal KPIs */}
        <DailyMealKPIs />
        
        {/* Journal Trends */}
        <JournalTrends />
        
        {/* Quick Actions */}
        <QuickActions />
      </div>

      {/* Third Row - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Goal Progress */}
        <GoalProgress />
        
        {/* Mindfulness Score */}
        <MindfulnessScore />
      </div>

      {/* Fourth Row - Full Width */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Recent Activity */}
        <RecentActivity />
        
        {/* Upcoming & Reminders */}
        <UpcomingReminders />
      </div>
    </div>
  );
};

export default Dashboard;

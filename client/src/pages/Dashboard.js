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
  MindfulnessScore,
  RecentActivity
} from '../components/dashboard';
import { Button, Card } from '../components/ui';

const Dashboard = () => {
  const { user } = useAuth();
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [welcomeImage, setWelcomeImage] = useState('/welcome.png');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [dashboardQuotes, setDashboardQuotes] = useState([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [musicLink, setMusicLink] = useState('');
  const [showMusicInput, setShowMusicInput] = useState(false);
  const [musicPlatform, setMusicPlatform] = useState('spotify');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
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

  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const extractSpotifyId = (url) => {
    const match = url.match(/spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
    return match ? { type: match[1], id: match[2] } : null;
  };

  const extractAppleMusicId = (url) => {
    const match = url.match(/music\.apple\.com\/.*\/(album|song)\/.*\/(\d+)/);
    return match ? { type: match[1], id: match[2] } : null;
  };

  const getEmbedUrl = () => {
    if (!musicLink) return null;
    
    const link = musicLink.trim();
    
    if (link.includes('youtube.com') || link.includes('youtu.be')) {
      const videoId = extractYouTubeId(link);
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&showinfo=0&rel=0`;
      }
    } else if (link.includes('spotify.com')) {
      const spotifyData = extractSpotifyId(link);
      if (spotifyData) {
        return `https://open.spotify.com/embed/${spotifyData.type}/${spotifyData.id}`;
      }
    } else if (link.includes('music.apple.com')) {
      const appleData = extractAppleMusicId(link);
      if (appleData) {
        return `https://embed.music.apple.com/us/album/${appleData.id}`;
      }
    }
    
    return null;
  };

  const handleMusicLinkSubmit = () => {
    if (musicLink.trim()) {
      // Validate and process the music link
      const link = musicLink.trim();
      if (link.includes('youtube.com') || link.includes('youtu.be')) {
        setMusicPlatform('youtube');
        toast.success('YouTube link added!');
      } else if (link.includes('spotify.com')) {
        setMusicPlatform('spotify');
        toast.success('Spotify link added!');
      } else if (link.includes('music.apple.com')) {
        setMusicPlatform('apple');
        toast.success('Apple Music link added!');
      } else {
        toast.error('Please enter a valid YouTube, Spotify, or Apple Music link');
        return;
      }
      setShowMusicInput(false);
      toast.success('Music link updated successfully!');
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const getPlatformIcon = () => {
    switch (musicPlatform) {
      case 'youtube':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case 'spotify':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        );
      case 'apple':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
          </svg>
        );
    }
  };

  return (
    <div className="space-y-8 p-6 lg:p-6">
      {/* Welcome Header - Alfred Bar */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          {/* Left side - Image first, then greetings */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6">
            {/* Image */}
            <div className="flex-shrink-0 mb-4 lg:mb-0 relative group self-center">
              <img 
                src={welcomeImage} 
                alt="Welcome illustration" 
                className="w-20 h-20 lg:w-24 lg:h-24 object-cover rounded-lg border-2 border-[#2A313A] shadow-lg cursor-pointer transition-all duration-200 group-hover:border-[#1E49C9] group-hover:shadow-[#1E49C9]/20"
                onClick={() => {
                  console.log('Dashboard image clicked, setting showImageUpload to true');
                  setShowImageUpload(true);
                }}
                title="Click to change image"
              />
              
              {/* Upload overlay with button text */}
              <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center">
                <Upload className="h-5 w-5 text-white mb-2" />
                <span className="text-white text-xs font-medium font-jakarta leading-relaxed tracking-wider">Change Image</span>
              </div>
              
              {/* Upload button overlay - always visible on hover */}
              <div className="absolute -bottom-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-[#1E49C9] text-white p-2 rounded-full shadow-lg border-2 border-[#0A0C0F]">
                  <Upload className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Greetings */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#1E49C9] bg-opacity-20 rounded-lg">
                <Upload className="h-5 w-5 text-[#1E49C9]" />
              </div>
              <div>
                <h3 className="font-jakarta text-2xl leading-normal text-text-primary font-bold tracking-wide">
                  Welcome back, {user?.firstName || 'User'}!
                </h3>
                <p className="font-jakarta text-lg leading-loose text-text-secondary">
                  Here's your day at a glance
                </p>
              </div>
            </div>
          </div>

          {/* Right side music player */}
          <div className="flex-1 lg:ml-6 flex justify-center lg:justify-end">
            <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.15)] rounded-xl p-4 backdrop-blur-[28px] backdrop-saturate-[140%] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_6px_-1px_rgba(0,0,0,0.1)] w-full max-w-2xl">
              {/* Music Link Input */}
              {showMusicInput ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-[#1E49C9] bg-opacity-20 rounded-lg">
                      {getPlatformIcon()}
                    </div>
                    <h4 className="font-jakarta text-sm font-semibold text-text-primary">Add Music Link</h4>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Paste YouTube, Spotify, or Apple Music link..."
                      value={musicLink}
                      onChange={(e) => setMusicLink(e.target.value)}
                      className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.15)] rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-secondary focus:border-[#1E49C9] focus:outline-none"
                    />
                    <button
                      onClick={handleMusicLinkSubmit}
                      className="px-4 py-2 bg-[#1E49C9] text-white rounded-lg hover:bg-[#1E49C9]/80 transition-colors text-sm font-medium"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowMusicInput(false)}
                      className="px-4 py-2 bg-[rgba(255,255,255,0.1)] text-text-secondary rounded-lg hover:bg-[rgba(255,255,255,0.2)] transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Embedded Player */}
                  {musicLink && getEmbedUrl() && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="p-1 bg-[#1E49C9] bg-opacity-20 rounded">
                          {getPlatformIcon()}
                        </div>
                        <h4 className="font-jakarta text-sm font-semibold text-text-primary">
                          Now Playing
                        </h4>
                      </div>
                      <div className="relative">
                        {musicPlatform === 'youtube' ? (
                          <iframe
                            src={getEmbedUrl()}
                            className="w-full h-20 rounded-lg"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ) : musicPlatform === 'spotify' ? (
                          <iframe
                            src={getEmbedUrl()}
                            className="w-full h-20 rounded-lg"
                            frameBorder="0"
                            allowtransparency="true"
                            allow="encrypted-media"
                          ></iframe>
                        ) : musicPlatform === 'apple' ? (
                          <iframe
                            src={getEmbedUrl()}
                            className="w-full h-20 rounded-lg"
                            frameBorder="0"
                            allow="autoplay"
                          ></iframe>
                        ) : null}
                      </div>
                    </div>
                  )}
                  
                  {/* Music Player Controls */}
                  <div className="flex items-center space-x-4">
                    {/* Album Art */}
                    <div className="relative group flex-shrink-0">
                      <img 
                        src="/welcome.png" 
                        alt="Album cover" 
                        className="w-16 h-16 object-cover rounded-lg border-2 border-[#2A313A] shadow-lg cursor-pointer transition-all duration-200 group-hover:border-[#1E49C9] group-hover:shadow-[#1E49C9]/20"
                      />
                      {/* Play button overlay */}
                      <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <div className="w-6 h-6 bg-[#1E49C9] rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-l-[4px] border-l-white border-y-[3px] border-y-transparent ml-0.5"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="p-1 bg-[#1E49C9] bg-opacity-20 rounded">
                          {getPlatformIcon()}
                        </div>
                        <h4 className="font-jakarta text-sm font-semibold text-text-primary truncate">
                          {musicLink ? 'Custom Track' : 'Welcome Track'}
                        </h4>
                      </div>
                      <p className="font-jakarta text-xs text-text-secondary mb-2">
                        {musicPlatform === 'youtube' ? 'YouTube Music' : 
                         musicPlatform === 'spotify' ? 'Spotify' : 
                         musicPlatform === 'apple' ? 'Apple Music' : 'Ambient Focus'}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="mb-2">
                        <div className="w-full bg-[rgba(255,255,255,0.1)] rounded-full h-1">
                          <div className="bg-[#1E49C9] h-1 rounded-full w-1/3"></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="font-jakarta text-xs text-text-secondary">1:23</span>
                          <span className="font-jakarta text-xs text-text-secondary">4:12</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center space-x-2">
                      <button className="text-text-secondary hover:text-text-primary transition-colors p-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"/>
                        </svg>
                      </button>
                      <button 
                        onClick={handlePlayPause}
                        className="w-8 h-8 bg-[#1E49C9] rounded-full flex items-center justify-center text-white hover:bg-[#1E49C9]/80 transition-colors"
                      >
                        {isPlaying ? (
                          <div className="flex space-x-0.5">
                            <div className="w-1 h-3 bg-white rounded"></div>
                            <div className="w-1 h-3 bg-white rounded"></div>
                          </div>
                        ) : (
                          <div className="w-0 h-0 border-l-[4px] border-l-white border-y-[3px] border-y-transparent ml-0.5"></div>
                        )}
                      </button>
                      <button className="text-text-secondary hover:text-text-primary transition-colors p-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => setShowMusicInput(true)}
                        className="text-text-secondary hover:text-text-primary transition-colors p-1"
                        title="Add music link"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

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
              <h3 className="font-jakarta text-lg font-semibold text-text-primary mb-4 leading-relaxed tracking-wider">
                Update Welcome Image
              </h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <label 
                    htmlFor="welcome-image-upload-dashboard"
                    className="inline-flex items-center cursor-pointer"
                  >
                    <Button
                      variant="primary"
                      className="inline-flex items-center"
                    >
                      <Upload className="h-5 w-5 mr-2" />
                      Choose Image
                    </Button>
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
                <Button
                  onClick={() => setShowImageUpload(false)}
                  variant="ghost"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote of the Day - Mission Card */}
      <Card
        title="MISSION BRIEFING"
        subtitle="Daily inspiration and motivation"
        icon={<RefreshCw className="h-5 w-5 text-[#1E49C9]" />}
      >
        <div className="text-center relative">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={refreshQuote}
              className="p-1 text-[#1E49C9] hover:text-[#1E49C9]/80 hover:bg-[#2A313A] rounded transition-all duration-200 group"
              title="Get a new quote"
            >
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <button
              onClick={fetchDashboardQuotes}
              className="p-1 text-[#1E49C9] hover:text-[#1E49C9]/80 hover:bg-[#2A313A] rounded transition-all duration-200 group"
              title="Refresh quotes from API"
            >
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
            <span className="font-jakarta text-xs text-text-secondary">
              {getCurrentQuoteNumber()}/{dashboardQuotes.length > 0 ? dashboardQuotes.length : quotes.length}
            </span>
          </div>
          {quotesLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E49C9]"></div>
            </div>
          ) : (
            <>
              <blockquote className="font-jakarta text-base lg:text-lg font-medium text-text-primary mb-3 italic leading-relaxed">
                "{getQuoteOfTheDay()}"
              </blockquote>
              <cite className="font-jakarta text-sm text-[#1E49C9] font-medium leading-relaxed tracking-wider">
                — {getQuoteAuthor()}
              </cite>
              {dashboardQuotes.length > 0 && getQuoteSource() && (
                <p className="font-jakarta text-xs text-text-secondary mt-2">
                  from <span className="text-[#1E49C9] font-medium">{getQuoteSource()}</span>
                </p>
              )}
              {dashboardQuotes.length === 0 && !quotesLoading && (
                <p className="font-jakarta text-xs text-text-secondary mt-2">
                  Add quotes in Content tab to see them here
                </p>
              )}
              {/* Debug info - remove in production */}
              <div className="font-jakarta text-xs text-text-secondary mt-2 opacity-60">
                Debug: {dashboardQuotes.length} quotes loaded, {quotesLoading ? 'loading' : 'ready'}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* New Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mission Status - Left Column */}
        <Card
          title="MISSION STATUS"
          subtitle="24-hour breakdown of your daily activities"
          icon={<ArrowRight className="h-5 w-5 text-[#1E49C9]" />}
        >
          <div className="flex justify-end mb-6">
            <a href="/goal-aligned-day" className="font-jakarta text-sm text-[#1E49C9] hover:text-[#1E49C9]/80 font-medium flex items-center justify-center leading-relaxed tracking-wider border border-[#2A313A] px-3 py-2 rounded hover:bg-[#2A313A] transition-all duration-200">
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
                  <p className="font-jakarta text-xs text-[#1E49C9]/80 leading-relaxed tracking-wider">GOAL + MINDFUL</p>
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
                  <p className="font-jakarta text-xs text-[#1E49C9]/80 leading-relaxed tracking-wider">GOAL-ALIGNED</p>
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
                  <p className="font-jakarta text-xs text-[#1E49C9]/80 leading-relaxed tracking-wider">MINDFUL</p>
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
                  <p className="font-jakarta text-xs text-[#1E49C9]/80 leading-relaxed tracking-wider">NOT MINDFUL, NOT GOAL-ORIENTED</p>
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
              <h3 className="font-jakarta text-lg font-semibold text-text-primary mb-2">No Tasks Today</h3>
              <p className="font-jakarta text-text-secondary mb-4">Complete some tasks to see your day breakdown</p>
              <Button
                onClick={() => window.location.href = '/goal-aligned-day'}
                variant="primary"
                className="inline-flex items-center"
              >
                ADD YOUR FIRST TASK
              </Button>
            </div>
          )}
        </Card>

        {/* Financial Overview - Right Column */}
        <FinancialOverview />
      </div>

      {/* Second Row - Three Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Meal KPIs */}
        <DailyMealKPIs />
        
        {/* Journal Trends */}
        <JournalTrends />
        
        {/* Quick Actions */}
        <QuickActions />
      </div>

      {/* Third Row - Single Column */}
      <div className="grid grid-cols-1 gap-6">
        {/* Mindfulness Score */}
        <MindfulnessScore />
      </div>

      {/* Fourth Row - Single Column */}
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Activity */}
        <RecentActivity />
      </div>
    </div>
  );
};

export default Dashboard;

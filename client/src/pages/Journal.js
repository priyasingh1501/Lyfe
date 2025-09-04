import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  BookOpen, 
  Heart, 
  Target, 
  Moon, 
  Star, 
  Calendar, 
  Tag, 
  MapPin, 
  Cloud,
  Edit3,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import AlfredAnalysis from '../components/journal/AlfredAnalysis';
import JournalTrends from '../components/journal/JournalTrends';
import { buildApiUrl } from '../config';

const Journal = () => {
  const { token } = useAuth();
  const [entries, setEntries] = useState([]);
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    mood: '',
    tags: []
  });

  // New entry form state
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    type: 'daily',
    mood: 'neutral',
    tags: [],
    isPrivate: false
  });

  const [tagInput, setTagInput] = useState('');

  const entryTypes = [
    { value: 'daily', label: 'Daily', icon: Calendar, color: 'bg-blue-500' },
    { value: 'gratitude', label: 'Gratitude', icon: Heart, color: 'bg-pink-500' },
    { value: 'reflection', label: 'Reflection', icon: BookOpen, color: 'bg-purple-500' },
    { value: 'goal', label: 'Goal', icon: Target, color: 'bg-green-500' },
    { value: 'dream', label: 'Dream', icon: Moon, color: 'bg-indigo-500' },
    { value: 'memory', label: 'Memory', icon: Star, color: 'bg-yellow-500' },
    { value: 'creative', label: 'Creative', icon: BookOpen, color: 'bg-orange-500' }
  ];

  const moods = [
    { value: 'excellent', label: 'Excellent', color: 'bg-green-500' },
    { value: 'good', label: 'Good', color: 'bg-blue-500' },
    { value: 'neutral', label: 'Neutral', color: 'bg-gray-500' },
    { value: 'bad', label: 'Bad', color: 'bg-yellow-500' },
    { value: 'terrible', label: 'Terrible', color: 'bg-red-500' }
  ];

  const fetchJournal = useCallback(async () => {
    try {
      const response = await fetch(buildApiUrl('/api/journal'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('Fetched journal data:', data);
      console.log('Entries:', data.entries);
      setEntries(data.entries || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching journal:', error);
      toast.error('Failed to load journal');
      setLoading(false);
    }
  }, [token]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(buildApiUrl('/api/journal/stats'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchJournal();
      fetchStats();
    }
  }, [token, fetchJournal, fetchStats]);

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(buildApiUrl('/api/journal/entries'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newEntry)
      });

      if (response.ok) {
        const data = await response.json();
        setEntries([data.entry, ...entries]);
        setShowNewEntryForm(false);
        setNewEntry({
          title: '',
          content: '',
          type: 'daily',
          mood: 'neutral',
          tags: [],
          isPrivate: false
        });
        toast.success('Journal entry created successfully!');
        fetchStats();
      } else {
        const errorData = await response.json();
        console.error('Failed to create entry:', errorData);
        toast.error(errorData.message || 'Failed to create entry');
      }
    } catch (error) {
      console.error('Error creating entry:', error);
      toast.error('Failed to create entry');
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      const response = await fetch(buildApiUrl(`/api/journal/entries/${entryId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setEntries(entries.filter(entry => entry._id !== entryId));
        toast.success('Entry deleted successfully');
        fetchStats();
      } else {
        toast.error('Failed to delete entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  const handleAnalyzeEntry = async (entryId) => {
    console.log('Analyzing entry with ID:', entryId);
    if (!entryId) {
      toast.error('Entry ID is missing');
      return;
    }
    
    try {
      const response = await fetch(buildApiUrl(`/api/journal/entries/${entryId}/analyze`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Update the entry in the local state
        setEntries(entries.map(entry => 
          entry._id === entryId 
            ? { ...entry, alfredAnalysis: data.analysis }
            : entry
        ));
        toast.success('Entry analyzed successfully!');
      } else {
        toast.error('Failed to analyze entry');
      }
    } catch (error) {
      console.error('Error analyzing entry:', error);
      toast.error('Failed to analyze entry');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !newEntry.tags.includes(tagInput.trim())) {
      setNewEntry({
        ...newEntry,
        tags: [...newEntry.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setNewEntry({
      ...newEntry,
      tags: newEntry.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const filteredEntries = entries.filter(entry => {
    if (filters.type && entry.type !== filters.type) return false;
    if (filters.mood && entry.mood !== filters.mood) return false;
    if (filters.tags.length > 0 && !filters.tags.some(tag => entry.tags.includes(tag))) return false;
    return true;
  });

  const getTypeIcon = (type) => {
    const typeConfig = entryTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : BookOpen;
  };

  const getMoodColor = (mood) => {
    const moodConfig = moods.find(m => m.value === mood);
    return moodConfig ? moodConfig.color : 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Header - Mission Card */}
        <div className="bg-gray-900 border-2 border-gray-600 rounded-lg p-4 lg:p-6 relative overflow-hidden mb-4 lg:mb-8" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
          {/* Film grain overlay */}
          <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
          
          {/* Reason Strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-blue-500 to-green-500"></div>
          
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 font-oswald tracking-wide text-center lg:text-left">JOURNAL MISSION</h1>
          <p className="text-gray-300 font-inter text-center lg:text-left">Capture your thoughts, memories, and reflections</p>
        </div>

        {/* Alfred's Trend Analysis */}
        <div className="mb-4 lg:mb-8">
          <JournalTrends />
        </div>

        {/* Stats Overview - Mission Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 border-2 border-gray-600 rounded-lg relative overflow-hidden p-6" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
              <div className="flex items-center">
                <div className="p-2 bg-gray-800 border border-gray-600 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300 font-oswald tracking-wide">TOTAL ENTRIES</p>
                  <p className="text-2xl font-bold text-white font-mono">{stats.totalEntries}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900 border-2 border-gray-600 rounded-lg relative overflow-hidden p-6" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-green-500"></div>
              <div className="flex items-center">
                <div className="p-2 bg-gray-800 border border-gray-600 rounded-lg">
                  <Star className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 font-oswald tracking-wide">CURRENT STREAK</p>
                  <p className="text-2xl font-bold text-white font-mono">{stats.currentStreak} days</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900 border-2 border-gray-600 rounded-lg relative overflow-hidden p-6" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500"></div>
              <div className="flex items-center">
                <div className="p-2 bg-gray-800 border border-gray-600 rounded-lg">
                  <Star className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 font-oswald tracking-wide">LONGEST STREAK</p>
                  <p className="text-2xl font-bold text-white font-mono">{stats.longestStreak} days</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900 border-2 border-gray-600 rounded-lg relative overflow-hidden p-6" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
              <div className="flex items-center">
                <div className="p-2 bg-gray-800 border border-gray-600 rounded-lg">
                  <Calendar className="h-6 w-6 text-amber-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300 font-oswald tracking-wide">LAST ENTRY</p>
                  <p className="text-lg font-bold text-white font-mono">
                    {stats.lastEntryDate ? new Date(stats.lastEntryDate).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <button
            onClick={() => setShowNewEntryForm(true)}
            className="inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors duration-200 border border-amber-400 hover:shadow-lg hover:shadow-amber-500/20 font-oswald tracking-wide"
          >
            <Plus className="h-5 w-5 mr-2" />
            NEW ENTRY
          </button>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Types</option>
              {entryTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <select
              value={filters.mood}
              onChange={(e) => setFilters({ ...filters, mood: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Moods</option>
              {moods.map(mood => (
                <option key={mood.value} value={mood.value}>{mood.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* New Entry Form */}
        <AnimatePresence>
          {showNewEntryForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg shadow-lg p-6 mb-8 relative overflow-hidden"
              style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
            >
              {/* Film grain overlay */}
              <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
              
              {/* Reason Strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD200] to-[#3CCB7F]"></div>
              
              <h3 className="text-lg font-semibold text-[#E8EEF2] mb-4 font-oswald tracking-wide">Create New Entry</h3>
              
              <form onSubmit={handleCreateEntry} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#C9D1D9] mb-2 font-inter">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newEntry.title}
                      onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                      placeholder="What's on your mind?"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#C9D1D9] mb-2 font-inter">
                      Entry Type
                    </label>
                    <select
                      value={newEntry.type}
                      onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                    >
                      {entryTypes.map(type => (
                        <option key={type.value} value={type.value} className="bg-[#0A0C0F] text-[#E8EEF2]">{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#C9D1D9] mb-2 font-inter">
                    Content *
                  </label>
                  <textarea
                    value={newEntry.content}
                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                    placeholder="Write your thoughts, feelings, or experiences..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#C9D1D9] mb-2 font-inter">
                      Mood
                    </label>
                    <select
                      value={newEntry.mood}
                      onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                    >
                      {moods.map(mood => (
                        <option key={mood.value} value={mood.value} className="bg-[#0A0C0F] text-[#E8EEF2]">{mood.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#C9D1D9] mb-2 font-inter">
                      Tags
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="flex-1 px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                        placeholder="Add a tag"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-3 py-2 bg-[#2A313A] border border-l-0 border-[#2A313A] rounded-r-lg hover:bg-[#3A414A] text-[#E8EEF2]"
                      >
                        Add
                      </button>
                    </div>
                    {newEntry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newEntry.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 text-primary-600 hover:text-primary-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newEntry.isPrivate}
                        onChange={(e) => setNewEntry({ ...newEntry, isPrivate: e.target.checked })}
                        className="mr-2 rounded border-[#2A313A] text-[#3CCB7F] focus:ring-[#3CCB7F] bg-[#0A0C0F]"
                      />
                      <span className="text-sm text-[#C9D1D9] font-inter">Private entry</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowNewEntryForm(false)}
                    className="px-4 py-2 text-[#E8EEF2] bg-[#2A313A] rounded-lg hover:bg-[#3A414A] transition-colors duration-200 font-oswald tracking-wide"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#3CCB7F] text-[#0A0C0F] rounded-lg hover:bg-[#2FB86B] transition-colors duration-200 font-oswald tracking-wide"
                  >
                    Create Entry
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Journal Entries */}
        <div className="space-y-6">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-[#C9D1D9]" />
              <h3 className="mt-2 text-sm font-medium text-[#E8EEF2] font-oswald tracking-wide">No entries yet</h3>
              <p className="mt-1 text-sm text-[#C9D1D9] font-inter">
                {filters.type || filters.mood ? 'Try adjusting your filters' : 'Get started by creating your first journal entry'}
              </p>
            </div>
          ) : (
            filteredEntries.map((entry, index) => (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg shadow-lg overflow-hidden relative"
                style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
              >
                {/* Film grain overlay */}
                <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
                
                <div className="p-6 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getTypeIcon(entry.type).color} bg-opacity-20`}>
                        {React.createElement(getTypeIcon(entry.type), { className: "h-5 w-5 text-[#E8EEF2]" })}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#E8EEF2] font-oswald tracking-wide">{entry.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-[#C9D1D9] font-inter">
                          <span className="capitalize">{entry.type}</span>
                          <span>•</span>
                          <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                          {entry.isPrivate && (
                            <>
                              <span>•</span>
                              <EyeOff className="h-4 w-4 inline" />
                              <span>Private</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getMoodColor(entry.mood)}`}></div>
                      <span className="text-sm text-[#C9D1D9] capitalize font-inter">{entry.mood}</span>
                    </div>
                  </div>

                  <div className="prose max-w-none mb-4">
                    <p className="text-[#C9D1D9] whitespace-pre-wrap font-inter">{entry.content}</p>
                  </div>

                  {/* Alfred Analysis */}
                  {entry._id ? (
                    <AlfredAnalysis 
                      analysis={entry.alfredAnalysis} 
                      entryId={entry._id}
                      onAnalyze={handleAnalyzeEntry}
                    />
                  ) : (
                    <div className="mt-4 p-4 bg-red-800 border border-red-600 rounded-lg">
                      <p className="text-red-300 text-sm">Error: Entry ID is missing. Cannot analyze this entry.</p>
                    </div>
                  )}
                  {console.log('Rendering AlfredAnalysis for entry:', entry._id, entry.title)}

                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {entry.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 bg-[#2A313A] text-[#E8EEF2] text-xs rounded-full"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-[#C9D1D9] font-inter">
                      {entry.location?.city && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {entry.location.city}
                        </div>
                      )}
                      {entry.weather?.condition && (
                        <div className="flex items-center">
                          <Cloud className="h-4 w-4 mr-1" />
                          {entry.weather.condition}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDeleteEntry(entry._id)}
                        className="p-2 text-[#C9D1D9] hover:text-red-400 transition-colors duration-200"
                        title="Delete entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;

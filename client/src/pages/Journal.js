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
import { Button, Input, Card, Section, Header } from '../components/ui';

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

  // Show all entries since filters are removed
  const filteredEntries = entries;

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
      <Section>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading your journal entries...</p>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Header level={1} className="tracking-tight">Journal</Header>
          <p className="text-text-secondary mt-2">Capture your thoughts, memories, and reflections</p>
        </div>
      </div>

      {/* Alfred's Trend Analysis */}
      <div className="mb-8">
        <JournalTrends />
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary font-jakarta tracking-wide">TOTAL ENTRIES</p>
                <p className="text-2xl font-bold text-text-primary font-mono">{stats.totalEntries}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary font-jakarta tracking-wide">CURRENT STREAK</p>
                <p className="text-2xl font-bold text-text-primary font-mono">{stats.currentStreak} days</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary font-jakarta tracking-wide">LONGEST STREAK</p>
                <p className="text-2xl font-bold text-text-primary font-mono">{stats.longestStreak} days</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary font-jakarta tracking-wide">LAST ENTRY</p>
                <p className="text-lg font-bold text-text-primary font-mono">
                  {stats.lastEntryDate ? new Date(stats.lastEntryDate).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex justify-start mb-6">
        <Button
          onClick={() => setShowNewEntryForm(true)}
          variant="primary"
          className="inline-flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          NEW ENTRY
        </Button>
      </div>

      {/* New Entry Form */}
      <AnimatePresence>
          {showNewEntryForm && (
            <Card className="mb-8">
              <h3 className="text-lg font-semibold text-text-primary mb-4 font-jakarta tracking-wide">Create New Entry</h3>
              
              <form onSubmit={handleCreateEntry} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Title *"
                    type="text"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    placeholder="What's on your mind?"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2 font-jakarta">
                      Entry Type
                    </label>
                    <select
                      value={newEntry.type}
                      onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })}
                      className="input w-full"
                    >
                      {entryTypes.map(type => (
                        <option key={type.value} value={type.value} className="bg-background-primary text-text-primary">{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Content *"
                  type="textarea"
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  rows={6}
                  placeholder="Write your thoughts, feelings, or experiences..."
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2 font-jakarta">
                      Mood
                    </label>
                    <select
                      value={newEntry.mood}
                      onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
                      className="w-full px-3 py-2 bg-background-primary border border-border-primary rounded-lg text-text-primary focus:border-primary-500 focus:outline-none"
                    >
                      {moods.map(mood => (
                        <option key={mood.value} value={mood.value} className="bg-background-primary text-text-primary">{mood.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2 font-jakarta">
                      Tags
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="flex-1 px-3 py-2 bg-background-primary border border-border-primary rounded-lg text-text-primary focus:border-primary-500 focus:outline-none"
                        placeholder="Add a tag"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-3 py-2 bg-border-primary border border-l-0 border-border-primary rounded-r-lg hover:bg-border-secondary text-text-primary"
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
                        className="mr-2 rounded border-border-primary text-primary-500 focus:ring-primary-500 bg-background-primary"
                      />
                      <span className="text-sm text-text-secondary font-jakarta">Private entry</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    onClick={() => setShowNewEntryForm(false)}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                  >
                    Create Entry
                  </Button>
                </div>
              </form>
            </Card>
          )}
      </AnimatePresence>

      {/* Journal Entries */}
      <div className="space-y-6">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-text-tertiary" />
              <h3 className="mt-2 text-sm font-medium text-text-primary font-jakarta tracking-wide">No entries yet</h3>
              <p className="mt-1 text-sm text-text-secondary font-jakarta">
                {filters.type || filters.mood ? 'Try adjusting your filters' : 'Get started by creating your first journal entry'}
              </p>
            </div>
          ) : (
            filteredEntries.map((entry, index) => (
              <Card key={entry._id} className="overflow-hidden">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getTypeIcon(entry.type).color} bg-opacity-20`}>
                        {React.createElement(getTypeIcon(entry.type), { className: "h-5 w-5 text-text-primary" })}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary font-jakarta tracking-wide">{entry.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-text-secondary font-jakarta">
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
                      <span className="text-sm text-text-secondary capitalize font-jakarta">{entry.mood}</span>
                    </div>
                  </div>

                  <div className="prose max-w-none mb-4">
                    <p className="text-text-secondary whitespace-pre-wrap font-jakarta">{entry.content}</p>
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
                          className="inline-flex items-center px-2 py-1 bg-border-primary text-text-primary text-xs rounded-full"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-text-secondary font-jakarta">
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
                        className="p-2 text-text-secondary hover:text-red-400 transition-colors duration-200"
                        title="Delete entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
              </Card>
            ))
          )}
      </div>
    </Section>
  );
};

export default Journal;

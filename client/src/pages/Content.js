import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  BookOpen, 
  Film, 
  Tv, 
  Play, 
  Headphones, 
  FileText, 
  GraduationCap, 
  Search,
  Filter,
  Star,
  Clock,
  Tag,
  ExternalLink,
  Edit3,
  Trash2,
  Eye,
  CheckCircle,
  PlayCircle,
  Bookmark,
  TrendingUp,
  BarChart3,
  Quote,
  Book,
  PenTool,
  Calendar,
  MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Content = () => {
  const { token } = useAuth();
  const [collections, setCollections] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false);
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  
  // Book Documents state
  const [bookDocuments, setBookDocuments] = useState([]);
  const [showNewBookForm, setShowNewBookForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [activeTab, setActiveTab] = useState('collections');
  
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    status: '',
    difficulty: '',
    timeInvestment: ''
  });

  // Form states
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    type: 'wishlist',
    isPublic: false
  });

  const [newItem, setNewItem] = useState({
    title: '',
    type: 'book',
    category: 'self_help',
    description: '',
    author: '',
    director: '',
    year: '',
    duration: '',
    language: 'English',
    tags: [],
    coverImage: '',
    difficulty: 'intermediate',
    timeInvestment: 'moderate'
  });

  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    category: 'other',
    tags: [],
    totalPages: '',
    difficulty: 'intermediate',
    language: 'English',
    publicationYear: '',
    publisher: ''
  });

  const [newNote, setNewNote] = useState({
    content: '',
    location: '',
    tags: [],
    isImportant: false,
    isQuote: false
  });

  const [tagInput, setTagInput] = useState('');
  const [bookTagInput, setBookTagInput] = useState('');
  const [noteTagInput, setNoteTagInput] = useState('');

  const contentTypes = [
    { value: 'book', label: 'Book', icon: BookOpen, color: 'bg-blue-500' },
    { value: 'movie', label: 'Movie', icon: Film, color: 'bg-red-500' },
    { value: 'tv_show', label: 'TV Show', icon: Tv, color: 'bg-purple-500' },
    { value: 'video', label: 'Video', icon: Play, color: 'bg-green-500' },
    { value: 'podcast', label: 'Podcast', icon: Headphones, color: 'bg-orange-500' },
    { value: 'article', label: 'Article', icon: FileText, color: 'bg-indigo-500' },
    { value: 'course', label: 'Course', icon: GraduationCap, color: 'bg-yellow-500' },
    { value: 'documentary', label: 'Documentary', icon: Film, color: 'bg-teal-500' }
  ];

  const categories = [
    'self_help', 'fiction', 'non_fiction', 'business', 'health', 'technology', 
    'science', 'history', 'philosophy', 'art', 'travel', 'cooking', 'fitness', 
    'education', 'entertainment'
  ];

  const bookCategories = [
    'fiction', 'non_fiction', 'self_help', 'business', 'health', 'technology', 
    'science', 'history', 'philosophy', 'art', 'travel', 'cooking', 'fitness', 
    'education', 'biography', 'memoir', 'poetry', 'other'
  ];

  const difficulties = ['beginner', 'intermediate', 'advanced'];
  const timeInvestments = ['quick', 'moderate', 'extensive'];
  const statuses = ['want_to_consume', 'currently_consuming', 'completed', 'abandoned'];

  useEffect(() => {
    if (token) {
      fetchCollections();
      fetchRecommendations();
      fetchStats();
      fetchBookDocuments();
    }
  }, [token]);

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/content/collections', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setCollections(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast.error('Failed to load content collections');
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/content/recommendations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/content/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    
    if (!newCollection.name.trim()) {
      toast.error('Please enter a collection name');
      return;
    }

    try {
      const response = await fetch('/api/content/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCollection)
      });

      if (response.ok) {
        const data = await response.json();
        setCollections([...collections, data.collection]);
        setShowNewCollectionForm(false);
        setNewCollection({
          name: '',
          description: '',
          type: 'wishlist',
          isPublic: false
        });
        toast.success('Collection created successfully!');
      } else {
        toast.error('Failed to create collection');
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error('Failed to create collection');
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    
    if (!newItem.title.trim() || !newItem.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!selectedCollection) {
      toast.error('Please select a collection');
      return;
    }

    try {
      const response = await fetch(`/api/content/collections/${selectedCollection._id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newItem)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update the collection with the new item
        setCollections(collections.map(col => 
          col._id === selectedCollection._id 
            ? { ...col, items: [...col.items, data.item] }
            : col
        ));
        
        setShowNewItemForm(false);
        setNewItem({
          title: '',
          type: 'book',
          category: 'self_help',
          description: '',
          author: '',
          director: '',
          year: '',
          duration: '',
          language: 'English',
          tags: [],
          coverImage: '',
          difficulty: 'intermediate',
          timeInvestment: 'moderate'
        });
        toast.success('Content item added successfully!');
        fetchStats();
      } else {
        toast.error('Failed to add content item');
      }
    } catch (error) {
      console.error('Error adding content item:', error);
      toast.error('Failed to add content item');
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    if (!window.confirm('Are you sure you want to delete this collection? All items will be lost.')) return;

    try {
      const response = await fetch(`/api/content/collections/${collectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setCollections(collections.filter(col => col._id !== collectionId));
        toast.success('Collection deleted successfully');
        fetchStats();
      } else {
        toast.error('Failed to delete collection');
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error('Failed to delete collection');
    }
  };

  const handleDeleteItem = async (collectionId, itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/content/collections/${collectionId}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setCollections(collections.map(col => 
          col._id === collectionId 
            ? { ...col, items: col.items.filter(item => item._id !== itemId) }
            : col
        ));
        toast.success('Item deleted successfully');
        fetchStats();
      } else {
        toast.error('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !newItem.tags.includes(tagInput.trim())) {
      setNewItem({
        ...newItem,
        tags: [...newItem.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setNewItem({
      ...newItem,
      tags: newItem.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const getTypeIcon = (type) => {
    const typeConfig = contentTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : BookOpen;
  };

  const getTypeColor = (type) => {
    const typeConfig = contentTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.color : 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'currently_consuming': return PlayCircle;
      case 'want_to_consume': return Bookmark;
      case 'abandoned': return Eye;
      default: return Bookmark;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'currently_consuming': return 'text-blue-600';
      case 'want_to_consume': return 'text-yellow-600';
      case 'abandoned': return 'text-red-600';
      default: return 'text-gray-600';
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Mission Card */}
        <div className="bg-gray-900 border-2 border-gray-600 rounded-lg p-6 relative overflow-hidden mb-8" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
          {/* Film grain overlay */}
          <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
          
          {/* Reason Strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-blue-500 to-green-500"></div>
          
          <h1 className="text-3xl font-bold text-white mb-2 font-oswald tracking-wide">CONTENT MISSION</h1>
          <p className="text-gray-300 font-inter">Discover, organize, and track your books, movies, and other content</p>
        </div>

        {/* Stats Overview - Mission Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  <p className="text-sm font-medium text-gray-300 font-oswald tracking-wide">TOTAL ITEMS</p>
                  <p className="text-2xl font-bold text-white font-mono">{stats.totalItems}</p>
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
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 font-oswald tracking-wide">COMPLETED</p>
                  <p className="text-2xl font-bold text-white font-mono">{stats.completedItems}</p>
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
                  <p className="text-sm font-medium text-gray-300 font-oswald tracking-wide">AVG RATING</p>
                  <p className="text-2xl font-bold text-white font-mono">{stats.averageRating}</p>
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
                  <TrendingUp className="h-6 w-6 text-amber-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300 font-oswald tracking-wide">COMPLETION RATE</p>
                  <p className="text-2xl font-bold text-white font-mono">{stats.completionRate}%</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex space-x-3">
            <button
              onClick={() => setShowNewCollectionForm(true)}
              className="inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors duration-200 border border-amber-400 hover:shadow-lg hover:shadow-amber-500/20 font-oswald tracking-wide"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Collection
            </button>
            
            <button
              onClick={() => setShowNewItemForm(true)}
              className="inline-flex items-center px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Content
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Types</option>
              {contentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category.replace('_', ' ')}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* New Collection Form */}
        <AnimatePresence>
          {showNewCollectionForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg shadow-lg p-6 mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Collection</h3>
              
              <form onSubmit={handleCreateCollection} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Collection Name *
                    </label>
                    <input
                      type="text"
                      value={newCollection.name}
                      onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Books to Read, Movies to Watch"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Collection Type
                    </label>
                    <select
                      value={newCollection.type}
                      onChange={(e) => setNewCollection({ ...newCollection, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="wishlist">Wishlist</option>
                      <option value="favorites">Favorites</option>
                      <option value="completed">Completed</option>
                      <option value="currently_reading">Currently Reading</option>
                      <option value="watchlist">Watchlist</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newCollection.description}
                    onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Describe what this collection is for..."
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newCollection.isPublic}
                      onChange={(e) => setNewCollection({ ...newCollection, isPublic: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Make collection public</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowNewCollectionForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
                  >
                    Create Collection
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Item Form */}
        <AnimatePresence>
          {showNewItemForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg shadow-lg p-6 mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Content</h3>
              
              <form onSubmit={handleCreateItem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Collection *
                    </label>
                    <select
                      value={selectedCollection?._id || ''}
                      onChange={(e) => {
                        const collection = collections.find(col => col._id === e.target.value);
                        setSelectedCollection(collection);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">Select a collection</option>
                      {collections.map(col => (
                        <option key={col._id} value={col._id}>{col.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={newItem.type}
                      onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {contentTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <input
                      type="text"
                      value={newItem.language}
                      onChange={(e) => setNewItem({ ...newItem, language: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="English"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Author/Director
                    </label>
                    <input
                      type="text"
                      value={newItem.author || newItem.director}
                      onChange={(e) => {
                        if (newItem.type === 'movie' || newItem.type === 'tv_show' || newItem.type === 'documentary') {
                          setNewItem({ ...newItem, director: e.target.value });
                        } else {
                          setNewItem({ ...newItem, author: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder={newItem.type === 'movie' || newItem.type === 'tv_show' || newItem.type === 'documentary' ? 'Director' : 'Author'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <input
                      type="number"
                      value={newItem.year}
                      onChange={(e) => setNewItem({ ...newItem, year: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="2024"
                      min="1900"
                      max="2030"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Describe the content..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={newItem.duration}
                      onChange={(e) => setNewItem({ ...newItem, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="2h 15m or 300 pages"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={newItem.difficulty}
                      onChange={(e) => setNewItem({ ...newItem, difficulty: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {difficulties.map(difficulty => (
                        <option key={difficulty} value={difficulty}>{difficulty}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Investment
                    </label>
                    <select
                      value={newItem.timeInvestment}
                      onChange={(e) => setNewItem({ ...newItem, timeInvestment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {timeInvestments.map(investment => (
                        <option key={investment} value={investment}>{investment}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Add a tag"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>
                  {newItem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newItem.tags.map(tag => (
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

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowNewItemForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors duration-200"
                  >
                    Add Content
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Collections */}
        <div className="space-y-8">
          {collections.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No collections yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first content collection
              </p>
            </div>
          ) : (
            collections.map((collection, index) => (
              <motion.div
                key={collection._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{collection.name}</h3>
                      {collection.description && (
                        <p className="text-gray-600 mt-1">{collection.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="capitalize">{collection.type.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{collection.items.length} items</span>
                        {collection.isPublic && (
                          <>
                            <span>•</span>
                            <span className="text-green-600">Public</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDeleteCollection(collection._id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                        title="Delete collection"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {collection.items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No items in this collection yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {collection.items
                        .filter(item => {
                          if (filters.type && item.type !== filters.type) return false;
                          if (filters.category && item.category !== filters.category) return false;
                          if (filters.status && item.status !== filters.status) return false;
                          if (filters.difficulty && item.difficulty !== filters.difficulty) return false;
                          if (filters.timeInvestment && item.timeInvestment !== filters.timeInvestment) return false;
                          return true;
                        })
                        .map(item => (
                          <motion.div
                            key={item._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className={`p-2 rounded-lg ${getTypeColor(item.type)} bg-opacity-20`}>
                                {React.createElement(getTypeIcon(item.type), { className: "h-5 w-5 text-gray-700" })}
                              </div>
                              <div className="flex items-center space-x-1">
                                {React.createElement(getStatusIcon(item.status), { 
                                  className: `h-4 w-4 ${getStatusColor(item.status)}` 
                                })}
                              </div>
                            </div>

                            <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h4>
                            
                            {item.description && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-3">{item.description}</p>
                            )}

                            <div className="space-y-2 text-sm text-gray-500">
                              {item.author && <p>by {item.author}</p>}
                              {item.director && <p>dir. {item.director}</p>}
                              {item.year && <p>{item.year}</p>}
                              {item.duration && (
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {item.duration}
                                </div>
                              )}
                            </div>

                            {item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {item.tags.slice(0, 3).map(tag => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full"
                                  >
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tag}
                                  </span>
                                ))}
                                {item.tags.length > 3 && (
                                  <span className="text-xs text-gray-500">+{item.tags.length - 3} more</span>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  item.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                                  item.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {item.difficulty}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  item.timeInvestment === 'quick' ? 'bg-blue-100 text-blue-800' :
                                  item.timeInvestment === 'moderate' ? 'bg-orange-100 text-orange-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {item.timeInvestment}
                                </span>
                              </div>

                              <button
                                onClick={() => handleDeleteItem(collection._id, item._id)}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                                title="Delete item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  {rec.coverImage && (
                    <img
                      src={rec.coverImage}
                      alt={rec.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(rec.type)} bg-opacity-20`}>
                        {React.createElement(getTypeIcon(rec.type), { className: "h-5 w-5 text-gray-700" })}
                      </div>
                      <span className="text-sm text-gray-500 capitalize">{rec.type}</span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{rec.title}</h3>
                    
                    {rec.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">{rec.description}</p>
                    )}

                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      {rec.author && <p>by {rec.author}</p>}
                      {rec.director && <p>dir. {rec.director}</p>}
                      {rec.year && <p>{rec.year}</p>}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{rec.rating}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rec.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                          rec.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {rec.difficulty}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rec.timeInvestment === 'quick' ? 'bg-blue-100 text-blue-800' :
                          rec.timeInvestment === 'moderate' ? 'bg-orange-100 text-orange-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {rec.timeInvestment}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Content;

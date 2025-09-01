import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Book,
  Quote,
  Star,
  Tag,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { buildApiUrl } from '../config';

const Content = () => {
  const { token } = useAuth();
  const [bookDocuments, setBookDocuments] = useState([]);
  const [showNewBookForm, setShowNewBookForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);

  // Book Documents state
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

  const [bookTagInput, setBookTagInput] = useState('');
  const [noteTagInput, setNoteTagInput] = useState('');
  


  const bookCategories = [
    'fiction', 'non_fiction', 'self_help', 'business', 'health', 'technology', 
    'science', 'history', 'philosophy', 'art', 'travel', 'cooking', 'fitness', 
    'education', 'biography', 'memoir', 'poetry', 'other'
  ];

  const difficulties = ['beginner', 'intermediate', 'advanced'];



  const fetchBookDocuments = useCallback(async () => {
    try {
      const response = await fetch(buildApiUrl('/api/book-documents'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setBookDocuments(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching book documents:', error);
      toast.error('Failed to load book documents');
      setLoading(false);
    }
  }, [token]);

  const createDefaultJournal = useCallback(async () => {
    try {
      const response = await fetch(buildApiUrl('/api/book-documents/journal/default'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Check if the journal was just created and add it to the list
        if (!bookDocuments.find(book => book._id === data._id)) {
          setBookDocuments(prev => [...prev, data]);
        }
      }
    } catch (error) {
      console.error('Error creating default journal:', error);
    }
  }, [token, bookDocuments]);



  // Move useEffect here after functions are defined
  useEffect(() => {
    if (token) {
      fetchBookDocuments();
      createDefaultJournal();
    }
  }, [token, fetchBookDocuments, createDefaultJournal]);

  const handleCreateBook = async (e) => {
    e.preventDefault();
    
    if (!newBook.title.trim() || !newBook.author.trim()) {
      toast.error('Please enter both title and author');
      return;
    }

    try {
      const response = await fetch(buildApiUrl('/api/book-documents'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newBook)
      });

      if (response.ok) {
        const data = await response.json();
        setBookDocuments([...bookDocuments, data.bookDocument]);
        setShowNewBookForm(false);
        setNewBook({
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
        toast.success('Book document created successfully!');
      } else {
        toast.error('Failed to create book document');
      }
    } catch (error) {
      console.error('Error creating book document:', error);
      toast.error('Failed to create book document');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    
    console.log('Submitting note with data:', newNote);
    console.log('Note isQuote flag:', newNote.isQuote);
    
    if (!newNote.content.trim()) {
      toast.error('Please enter note content');
      return;
    }

    if (!selectedBook) {
      toast.error('Please select a book');
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/api/book-documents/${selectedBook._id}/notes`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newNote)
      });

      if (response.ok) {
        const data = await response.json();
        
        console.log('Note created successfully:', data.note);
        console.log('Note isQuote flag:', data.note.isQuote);
        
        // Update the book with the new note
        setBookDocuments(bookDocuments.map(book => 
          book._id === selectedBook._id 
            ? { ...book, notes: [...book.notes, data.note] }
            : book
        ));
        
        setShowNoteForm(false);
        setNewNote({
          content: '',
          location: '',
          tags: [],
          isImportant: false,
          isQuote: false
        });
        toast.success('Note added successfully!');
      } else {
        toast.error('Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const handleDeleteBook = async (bookId) => {

    try {
      const response = await fetch(buildApiUrl(`/api/book-documents/${bookId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setBookDocuments(bookDocuments.filter(book => book._id !== bookId));
        toast.success('Book deleted successfully');
      } else {
        toast.error('Failed to delete book');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    }
  };

  const handleDeleteNote = async (bookId, noteId) => {

    try {
      const response = await fetch(buildApiUrl(`/api/book-documents/${bookId}/notes/${noteId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setBookDocuments(bookDocuments.map(book => 
          book._id === bookId 
            ? { ...book, notes: book.notes.filter(note => note._id !== noteId) }
            : book
        ));
        toast.success('Note deleted successfully');
      } else {
        toast.error('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const handleUpdateNote = async (bookId, noteId, updates) => {
    try {
      const response = await fetch(buildApiUrl(`/api/book-documents/${bookId}/notes/${noteId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const data = await response.json();
        
        setBookDocuments(bookDocuments.map(book => 
          book._id === bookId 
            ? { 
                ...book, 
                notes: book.notes.map(note => 
                  note._id === noteId ? data.note : note
                )
              }
            : book
        ));
        
        toast.success('Note updated successfully!');
      } else {
        toast.error('Failed to update note');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const addBookTag = () => {
    if (bookTagInput.trim() && !newBook.tags.includes(bookTagInput.trim())) {
      setNewBook({
        ...newBook,
        tags: [...newBook.tags, bookTagInput.trim()]
      });
      setBookTagInput('');
    }
  };

  const removeBookTag = (tagToRemove) => {
    setNewBook({
      ...newBook,
      tags: newBook.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const addNoteTag = () => {
    if (noteTagInput.trim() && !newNote.tags.includes(noteTagInput.trim())) {
      setNewNote({
        ...newNote,
        tags: [...newNote.tags, noteTagInput.trim()]
      });
      setNoteTagInput('');
    }
  };

  const removeNoteTag = (tagToRemove) => {
    setNewNote({
      ...newNote,
      tags: newNote.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const getBookStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✓';
      case 'currently_reading': return '▶';
      case 'not_started': return '📖';
      case 'paused': return '⏸';
      default: return '📖';
    }
  };

  const getBookStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'currently_reading': return 'text-blue-600';
      case 'not_started': return 'text-yellow-600';
      case 'paused': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FFD200]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C0F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header - Mission Card */}
        <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 relative overflow-hidden mb-8" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
          {/* Film grain overlay */}
          <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
          
          {/* Reason Strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD200] via-[#3CCB7F] to-[#4ECDC4]"></div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#E8EEF2] mb-2 font-oswald tracking-wide">BOOK DOCUMENTS</h1>
            <p className="text-[#C9D1D9] font-inter">Track your reading journey, take notes, and collect inspiring quotes</p>
          </div>
        </div>



        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex space-x-3">
            <button
              onClick={() => setShowNewBookForm(true)}
              className="inline-flex items-center px-4 py-2 bg-[#FFD200] text-[#0A0C0F] rounded-lg hover:bg-[#FFB800] transition-colors duration-200 border border-[#FFD200] hover:shadow-lg hover:shadow-[#FFD200]/20 font-oswald tracking-wide"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Book
            </button>
          </div>
        </div>

        {/* New Book Form */}
        <AnimatePresence>
          {showNewBookForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg shadow-lg p-6 mb-8"
            >
              <h3 className="text-lg font-semibold text-[#E8EEF2] mb-4 font-oswald tracking-wide">CREATE NEW BOOK DOCUMENT</h3>
              
              <form onSubmit={handleCreateBook} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#C9D1D9] mb-2 font-inter">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newBook.title}
                      onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                      placeholder="Enter book title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#C9D1D9] mb-2 font-inter">
                      Author *
                    </label>
                    <input
                      type="text"
                      value={newBook.author}
                      onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                      placeholder="Enter author name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#C9D1D9] mb-2 font-inter">
                      Category
                    </label>
                    <select
                      value={newBook.category}
                      onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                    >
                      {bookCategories.map(category => (
                        <option key={category} value={category} className="bg-[#0A0C0F] text-[#E8EEF2]">{category.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#C9D1D9] mb-2 font-inter">
                      Total Pages
                    </label>
                    <input
                      type="number"
                      value={newBook.totalPages}
                      onChange={(e) => setNewBook({ ...newBook, totalPages: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                      placeholder="e.g., 300"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#C9D1D9] mb-2 font-inter">
                      Difficulty
                    </label>
                    <select
                      value={newBook.difficulty}
                      onChange={(e) => setNewBook({ ...newBook, difficulty: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                    >
                      {difficulties.map(difficulty => (
                        <option key={difficulty} value={difficulty} className="bg-[#0A0C0F] text-[#E8EEF2]">{difficulty}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#C9D1D9] mb-2 font-inter">
                      ISBN
                    </label>
                    <input
                      type="text"
                      value={newBook.isbn}
                      onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                      placeholder="Enter ISBN"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#C9D1D9] mb-2 font-inter">
                      Publication Year
                    </label>
                    <input
                      type="number"
                      value={newBook.publicationYear}
                      onChange={(e) => setNewBook({ ...newBook, publicationYear: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                      placeholder="e.g., 2024"
                      min="1900"
                      max="2030"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#C9D1D9] mb-2 font-inter">
                    Description
                  </label>
                  <textarea
                    value={newBook.description}
                    onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                    placeholder="Describe the book..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#C9D1D9] mb-2 font-inter">
                    Tags
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={bookTagInput}
                      onChange={(e) => setBookTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBookTag())}
                      className="flex-1 px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-l-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                      placeholder="Add a tag"
                    />
                    <button
                      type="button"
                      onClick={addBookTag}
                      className="px-3 py-2 bg-[#2A313A] border border-l-0 border-[#2A313A] rounded-r-lg hover:bg-[#3A414A] text-[#E8EEF2]"
                    >
                      Add
                    </button>
                  </div>
                  {newBook.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newBook.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 bg-[#2A313A] text-[#E8EEF2] text-xs rounded-full"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeBookTag(tag)}
                            className="ml-1 text-[#C9D1D9] hover:text-[#E8EEF2]"
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
                    onClick={() => setShowNewBookForm(false)}
                    className="px-4 py-2 text-[#C9D1D9] bg-[#2A313A] rounded-lg hover:bg-[#3A414A] transition-colors duration-200 border border-[#2A313A]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#FFD200] text-[#0A0C0F] rounded-lg hover:bg-[#FFB800] transition-colors duration-200 border border-[#FFD200] font-oswald tracking-wide"
                  >
                    Create Book
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Note Form */}
        <AnimatePresence>
          {showNoteForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg shadow-lg p-6 mb-8"
            >
              <h3 className="text-lg font-semibold text-[#E8EEF2] mb-4 font-oswald tracking-wide">
                {selectedBook ? `ADD NOTE TO "${selectedBook.title.toUpperCase()}"` : 'ADD NOTE'}
              </h3>
              
              <form onSubmit={handleAddNote} className="space-y-4">
                {!selectedBook && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Book *
                    </label>
                    <select
                      value={selectedBook?._id || ''}
                      onChange={(e) => {
                        const book = bookDocuments.find(b => b._id === e.target.value);
                        setSelectedBook(book);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">Select a book</option>
                      {bookDocuments.map(book => (
                        <option key={book._id} value={book._id}>{book.title} by {book.author}</option>
                      ))}
                    </select>
                  </div>
                )}

                                  <div>
                    <label className="block text-sm font-medium text-[#C9D1D9] mb-2 font-inter">
                      Note Content *
                    </label>
                    <textarea
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                      placeholder="Write your note here..."
                      required
                    />
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#C9D1D9] mb-2 font-inter">
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={newNote.location}
                      onChange={(e) => setNewNote({ ...newNote, location: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                      placeholder="e.g., Page 45, Chapter 3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#C9D1D9] mb-2 font-inter">
                      Tags
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={noteTagInput}
                        onChange={(e) => setNoteTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNoteTag())}
                        className="flex-1 px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-l-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                        placeholder="Add a tag"
                      />
                      <button
                        type="button"
                        onClick={addNoteTag}
                        className="px-3 py-2 bg-[#2A313A] border border-l-0 border-[#2A313A] rounded-r-lg hover:bg-[#3A414A] text-[#C9D1D9]"
                      >
                        Add
                      </button>
                    </div>
                    {newNote.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newNote.tags.map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 bg-[#2A313A] text-[#C9D1D9] text-xs rounded-full"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeNoteTag(tag)}
                              className="ml-1 text-[#FFD200] hover:text-[#FFB800]"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newNote.isImportant}
                      onChange={(e) => setNewNote({ ...newNote, isImportant: e.target.checked })}
                      className="mr-2 h-4 w-4 text-[#FFD200] focus:ring-[#FFD200] border-[#2A313A] rounded"
                    />
                    <span className="text-sm text-[#C9D1D9] font-inter">Mark as important</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newNote.isQuote}
                      onChange={(e) => setNewNote({ ...newNote, isQuote: e.target.checked })}
                      className="mr-2 h-4 w-4 text-[#FFD200] focus:ring-[#FFD200] border-[#2A313A] rounded"
                    />
                    <span className="text-sm text-[#C9D1D9] font-inter">Include in dashboard quotes</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNoteForm(false);
                      setSelectedBook(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors duration-200"
                  >
                    Add Note
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Book Documents */}
        <div className="space-y-8">
          {bookDocuments.length === 0 ? (
            <div className="text-center py-12">
              <Book className="mx-auto h-12 w-12 text-[#2A313A]" />
              <h3 className="mt-2 text-sm font-medium text-[#E8EEF2] font-oswald tracking-wide">NO BOOK DOCUMENTS YET</h3>
              <p className="mt-1 text-sm text-[#C9D1D9]">
                Get started by creating your first book document
              </p>
            </div>
          ) : (
            bookDocuments.map((book, index) => (
              <motion.div
                key={book._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                                              <div className="flex items-center space-x-3 mb-2">
                          <div className="p-2 bg-[#2A313A] rounded-lg">
                            <Book className="h-6 w-6 text-[#4ECDC4]" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-[#E8EEF2] font-oswald tracking-wide">{book.title}</h3>
                            <p className="text-[#C9D1D9]">by {book.author}</p>
                          </div>
                        </div>
                      
                                              <div className="flex items-center space-x-4 text-sm text-[#C9D1D9] mb-3">
                          <span className="capitalize">{book.category.replace('_', ' ')}</span>
                          <span>•</span>
                          <span className={`flex items-center ${getBookStatusColor(book.status)}`}>
                            <span className="mr-1">{getBookStatusIcon(book.status)}</span>
                            {book.status.replace('_', ' ')}
                          </span>
                          {book.totalPages && (
                            <>
                              <span>•</span>
                              <span>{book.totalPages} pages</span>
                            </>
                          )}
                          {book.isDefault && (
                            <>
                              <span>•</span>
                              <span className="text-[#FFD200] font-medium font-oswald tracking-wide">Personal Journal</span>
                            </>
                          )}
                        </div>

                                              {book.description && (
                          <p className="text-[#C9D1D9] mb-3">{book.description}</p>
                        )}

                        {book.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {book.tags.map(tag => (
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
                    </div>

                                          <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBook(book);
                            setShowNoteForm(true);
                          }}
                          className="inline-flex items-center px-3 py-2 bg-[#3CCB7F] text-[#0A0C0F] rounded-lg hover:bg-[#2BB870] transition-colors duration-200 border border-[#3CCB7F] text-sm font-medium"
                          title="Add note"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Note
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book._id)}
                          className="p-2 text-[#C9D1D9] hover:text-red-500 transition-colors duration-200"
                          title="Delete book"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                  </div>

                                      {/* Notes Section */}
                    <div className="border-t border-[#2A313A] pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-medium text-[#E8EEF2] font-oswald tracking-wide">NOTES ({book.notes.length})</h4>
                        <button
                          onClick={() => {
                            setSelectedBook(book);
                            setShowNoteForm(true);
                          }}
                          className="inline-flex items-center px-2 py-1 bg-[#2A313A] text-[#C9D1D9] rounded text-sm hover:bg-[#3A414A] transition-colors duration-200 border border-[#2A313A]"
                          title="Add note to this book"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Note
                        </button>
                      </div>
                      
                      {book.notes.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-[#C9D1D9] text-sm mb-3">No notes yet. Add your first note to start tracking your reading journey.</p>
                          <button
                            onClick={() => {
                              setSelectedBook(book);
                              setShowNoteForm(true);
                            }}
                            className="inline-flex items-center px-3 py-2 bg-[#3CCB7F] text-[#0A0C0F] rounded-lg hover:bg-[#2BB870] transition-colors duration-200 border border-[#3CCB7F] text-sm font-medium"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add First Note
                          </button>
                        </div>
                      ) : (
                      <div className="space-y-3">
                        {book.notes.map((note, noteIndex) => (
                                                      <div
                              key={note._id}
                              className={`p-3 rounded-lg border ${
                                note.isImportant ? 'border-[#FFD200] bg-[#2A313A]' : 'border-[#2A313A] bg-[#0A0C0F]'
                              }`}
                            >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {note.isQuote && (
                                  <Quote className="h-4 w-4 text-blue-500" title="Quote note" />
                                )}
                                {note.isImportant && (
                                  <Star className="h-4 w-4 text-amber-500" title="Important note" />
                                )}
                                {note.location && (
                                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                                    {note.location}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleUpdateNote(book._id, note._id, { isQuote: !note.isQuote })}
                                  className={`p-1 rounded ${
                                    note.isQuote 
                                      ? 'text-blue-600 bg-blue-100' 
                                      : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                                  }`}
                                  title={note.isQuote ? 'Remove from quotes' : 'Add to quotes'}
                                >
                                  <Quote className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleUpdateNote(book._id, note._id, { isImportant: !note.isImportant })}
                                  className={`p-1 rounded ${
                                    note.isImportant 
                                      ? 'text-amber-600 bg-amber-100' 
                                      : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                                  }`}
                                  title={note.isImportant ? 'Remove from important' : 'Mark as important'}
                                >
                                  <Star className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteNote(book._id, note._id)}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                                  title="Delete note"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            
                                                          <p className="text-[#E8EEF2] text-sm mb-2">{note.content}</p>
                              
                              {note.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {note.tags.map(tag => (
                                    <span
                                      key={tag}
                                      className="inline-flex items-center px-1.5 py-0.5 bg-[#2A313A] text-[#C9D1D9] text-xs rounded border border-[#2A313A]"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              <div className="text-xs text-[#C9D1D9] mt-2">
                                {new Date(note.timestamp).toLocaleDateString()}
                              </div>
                          </div>
                        ))}
                      </div>
                    )}
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

export default Content;

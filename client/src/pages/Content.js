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
import { Button, Input, Card, Section, Header, Badge } from '../components/ui';

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
    if (!window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      return;
    }

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
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

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
      case 'not_started': return 'Not Started';
      case 'paused': return 'Paused';
      default: return 'Not Started';
    }
  };

  const getBookStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'currently_reading': return 'text-blue-600';
      case 'not_started': return 'text-yellow-600';
      case 'paused': return 'text-red-600';
      default: return 'text-[#C9D1D9]';
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
    <Section>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Header level={1} className="tracking-tight">Book Documents</Header>
            <p className="text-text-secondary mt-2">Track your reading journey, take notes, and collect inspiring quotes</p>
          </div>
          <Button
            onClick={() => setShowNewBookForm(true)}
            variant="secondary"
            className="inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Book
          </Button>
        </div>

        {/* New Book Form */}
        <AnimatePresence>
          {showNewBookForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <Card title="Create New Book Document">
              
              <form onSubmit={handleCreateBook} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Title *"
                    type="text"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    placeholder="Enter book title"
                    required
                  />

                  <Input
                    label="Author *"
                    type="text"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    placeholder="Enter author name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2 font-jakarta">
                      Category
                    </label>
                    <select
                      value={newBook.category}
                      onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                      className="input w-full"
                    >
                      {bookCategories.map(category => (
                        <option key={category} value={category} className="bg-background-primary text-text-primary">{category.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Total Pages"
                    type="number"
                    value={newBook.totalPages}
                    onChange={(e) => setNewBook({ ...newBook, totalPages: e.target.value })}
                    placeholder="e.g., 300"
                    min="1"
                  />

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2 font-jakarta">
                      Difficulty
                    </label>
                    <select
                      value={newBook.difficulty}
                      onChange={(e) => setNewBook({ ...newBook, difficulty: e.target.value })}
                      className="input w-full"
                    >
                      {difficulties.map(difficulty => (
                        <option key={difficulty} value={difficulty} className="bg-background-primary text-text-primary">{difficulty}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="ISBN"
                    type="text"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                    placeholder="Enter ISBN"
                  />

                  <Input
                    label="Publication Year"
                    type="number"
                    value={newBook.publicationYear}
                    onChange={(e) => setNewBook({ ...newBook, publicationYear: e.target.value })}
                    placeholder="e.g., 2024"
                    min="1900"
                    max="2030"
                  />
                </div>

                <Input
                  label="Description"
                  type="textarea"
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  rows={3}
                  placeholder="Describe the book..."
                />

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2 font-jakarta">
                    Tags
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={bookTagInput}
                      onChange={(e) => setBookTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBookTag())}
                      className="flex-1 input rounded-l-lg rounded-r-none"
                      placeholder="Add a tag"
                    />
                    <button
                      type="button"
                      onClick={addBookTag}
                      className="px-3 py-2 bg-background-tertiary border border-l-0 border-border-primary rounded-r-lg hover:bg-background-secondary text-text-primary"
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
                  <Button
                    type="button"
                    onClick={() => setShowNewBookForm(false)}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                  >
                    Create Book
                  </Button>
                </div>
              </form>
              </Card>
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
              className="mb-8"
            >
              <Card title={selectedBook ? `Add Note to "${selectedBook.title}"` : 'Add Note'}>
              
              <form onSubmit={handleAddNote} className="space-y-4">
                {!selectedBook && (
                  <div>
                    <label className="block text-sm font-medium text-[#C9D1D9] mb-2 font-inter">
                      Select Book *
                    </label>
                    <select
                      value={selectedBook?._id || ''}
                      onChange={(e) => {
                        const book = bookDocuments.find(b => b._id === e.target.value);
                        setSelectedBook(book);
                      }}
                      className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
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
                      className="mr-2 h-4 w-4 text-accent-primary focus:ring-accent-primary border-border-primary rounded"
                    />
                    <span className="text-sm text-text-secondary font-jakarta">Mark as important</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newNote.isQuote}
                      onChange={(e) => setNewNote({ ...newNote, isQuote: e.target.checked })}
                      className="mr-2 h-4 w-4 text-accent-primary focus:ring-accent-primary border-border-primary rounded"
                    />
                    <span className="text-sm text-text-secondary font-jakarta">Include in dashboard quotes</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowNoteForm(false);
                      setSelectedBook(null);
                    }}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                  >
                    Add Note
                  </Button>
                </div>
              </form>
            </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Book Documents */}
        {bookDocuments.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Book className="mx-auto h-12 w-12 text-text-muted" />
              <h3 className="mt-2 text-sm font-medium text-text-primary font-jakarta">No Book Documents Yet</h3>
              <p className="mt-1 text-sm text-text-secondary">
                Get started by creating your first book document
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookDocuments.map((book, index) => (
              <motion.div
                key={book._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="elevated" className="overflow-hidden h-full flex flex-col">
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="p-2 bg-background-tertiary rounded-lg">
                            <Book className="h-6 w-6 text-accent-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-text-primary font-jakarta">{book.title}</h3>
                            <p className="text-text-secondary">by {book.author}</p>
                          </div>
                        </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-text-secondary mb-3">
                        <Badge variant="outline" className="text-xs">
                          {book.category.replace('_', ' ')}
                        </Badge>
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
                            <Badge variant="success" className="text-xs">Personal Journal</Badge>
                          </>
                        )}
                      </div>

                      {book.description && (
                        <p className="text-text-secondary mb-3">{book.description}</p>
                      )}

                      {book.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {book.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => {
                            setSelectedBook(book);
                            setShowNoteForm(true);
                          }}
                          variant="primary"
                          size="sm"
                          className="inline-flex items-center"
                          title="Add note"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Note
                        </Button>
                        <Button
                          onClick={() => handleDeleteBook(book._id)}
                          variant="ghost"
                          size="sm"
                          className="p-2 text-text-secondary hover:text-status-error"
                          title="Delete book"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div className="border-t border-border-primary pt-4 mt-auto">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-medium text-text-primary font-jakarta">Notes ({book.notes.length})</h4>
                        <Button
                          onClick={() => {
                            setSelectedBook(book);
                            setShowNoteForm(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="inline-flex items-center"
                          title="Add note to this book"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Note
                        </Button>
                      </div>
                      
                    {book.notes.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-text-secondary text-sm mb-3">No notes yet. Add your first note to start tracking your reading journey.</p>
                        <Button
                          onClick={() => {
                            setSelectedBook(book);
                            setShowNoteForm(true);
                          }}
                          variant="primary"
                          size="sm"
                          className="inline-flex items-center"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add First Note
                        </Button>
                      </div>
                    ) : (
                    <div className="space-y-3">
                      {book.notes.map((note, noteIndex) => (
                        <div
                          key={note._id}
                          className={`p-3 rounded-lg border ${
                            note.isImportant ? 'border-accent-primary bg-background-card' : 'border-border-primary bg-background-primary'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {note.isQuote && (
                                <Quote className="h-4 w-4 text-accent-primary" title="Quote note" />
                              )}
                              {note.isImportant && (
                                <Star className="h-4 w-4 text-accent-primary" title="Important note" />
                              )}
                              {note.location && (
                                <Badge variant="outline" className="text-xs">
                                  {note.location}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                onClick={() => handleUpdateNote(book._id, note._id, { isQuote: !note.isQuote })}
                                variant="ghost"
                                size="sm"
                                className={`p-1 ${
                                  note.isQuote 
                                    ? 'text-accent-primary bg-accent-primary/20' 
                                    : 'text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10'
                                }`}
                                title={note.isQuote ? 'Remove from quotes' : 'Add to quotes'}
                              >
                                <Quote className="h-3 w-3" />
                              </Button>
                              <Button
                                onClick={() => handleUpdateNote(book._id, note._id, { isImportant: !note.isImportant })}
                                variant="ghost"
                                size="sm"
                                className={`p-1 ${
                                  note.isImportant 
                                    ? 'text-accent-primary bg-accent-primary/20' 
                                    : 'text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10'
                                }`}
                                title={note.isImportant ? 'Remove from important' : 'Mark as important'}
                              >
                                <Star className="h-3 w-3" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteNote(book._id, note._id)}
                                variant="ghost"
                                size="sm"
                                className="p-1 text-text-secondary hover:text-status-error"
                                title="Delete note"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-text-primary text-sm mb-2">{note.content}</p>
                              
                            {note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {note.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          
                          <div className="text-xs text-text-secondary mt-2">
                            {new Date(note.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
    </Section>
  );
};

export default Content;

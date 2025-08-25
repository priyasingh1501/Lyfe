// Load environment variables FIRST, before any other imports
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from current directory
console.log('🔍 Loading .env from current directory');
dotenv.config({ path: '.env' });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const timeManagementRoutes = require('./routes/timeManagement');
const healthRoutes = require('./routes/health');
const financeRoutes = require('./routes/finance');
const documentRoutes = require('./routes/documents');
const relationshipRoutes = require('./routes/relationships');
const communicationRoutes = require('./routes/communication');
const journalRoutes = require('./routes/journal');
const contentRoutes = require('./routes/content');
const bookDocumentRoutes = require('./routes/bookDocuments');
const aiChatRoutes = require('./routes/aiChat');
const goalRoutes = require('./routes/goals');
const habitRoutes = require('./routes/habits');
const foodRoutes = require('./routes/food');
const pantryRoutes = require('./routes/pantry');

// Debug environment variable loading
console.log('🔍 Environment check on startup:');
console.log('🔍 Current working directory:', process.cwd());
console.log('🔍 .env file path:', path.resolve('../.env'));
console.log('🔍 OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('🔍 OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);
console.log('🔍 PORT:', process.env.PORT);
console.log('🔍 NODE_ENV:', process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lyfe', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/time', timeManagementRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/relationships', relationshipRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/book-documents', bookDocumentRoutes);
app.use('/api/ai-chat', aiChatRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/pantry', pantryRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Load environment variables FIRST, before any other imports
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from project root directory
console.log('🔍 Loading .env from project root directory');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

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
const mindfulnessRoutes = require('./routes/mindfulness');
const foodRoutes = require('./routes/food');
const mealsRoutes = require('./routes/meals');
const pantryRoutes = require('./routes/pantry');
const devRoutes = require('./routes/dev');

// Debug environment variable loading
console.log('🔍 Environment check on startup:');
console.log('🔍 Current working directory:', process.cwd());
console.log('🔍 .env file path:', path.resolve('../.env'));
console.log('🔍 OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('🔍 OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);
console.log('🔍 USDA_API_KEY exists:', !!process.env.USDA_API_KEY);
console.log('🔍 USDA_API_KEY length:', process.env.USDA_API_KEY?.length || 0);
console.log('🔍 PORT:', process.env.PORT);
console.log('🔍 NODE_ENV:', process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
// Configure CORS to allow Vercel frontend and local development
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'https://lyfe-six.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow local development origins
    if (allowedOrigins.filter(Boolean).includes(origin)) {
      return callback(null, true);
    }
    
    // Allow file:// protocol for local testing
    if (origin.startsWith('file://')) {
      return callback(null, true);
    }
    
    // Allow localhost variations
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Handle preflight requests
app.options('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lyfe', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    // Don't exit the process, let the health check handle it
  }
};

// Connect to database
connectDB();

// Add a startup delay to ensure everything is ready
let serverReady = false;
setTimeout(() => {
  serverReady = true;
  console.log('✅ Server is fully ready for health checks');
}, 5000);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/time', timeManagementRoutes);
app.use('/api/health', healthRoutes);

// Root health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
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
app.use('/api/mindfulness', mindfulnessRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/dev', devRoutes);

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check available at: http://0.0.0.0:${PORT}/api/health`);
});

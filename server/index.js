const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

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
const aiChatRoutes = require('./routes/aiChat');
const goalRoutes = require('./routes/goals');
const habitRoutes = require('./routes/habits');
const foodRoutes = require('./routes/food');
const pantryRoutes = require('./routes/pantry');

dotenv.config({ path: '../.env' });

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

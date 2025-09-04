const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Basic health check endpoint for Railway deployment
router.get('/', (req, res) => {
  try {
    // Basic health check - just ensure the server is running
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5002,
      message: 'Server is running'
    };
    
    res.status(200).json(healthStatus);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Detailed health check endpoint
router.get('/detailed', (req, res) => {
  try {
    // Check if MongoDB is connected
    const dbStatus = mongoose.connection.readyState;
    const isDbConnected = dbStatus === 1; // 1 = connected
    
    // Check if required environment variables are present
    const hasRequiredEnvVars = !!(
      process.env.MONGODB_URI &&
      process.env.JWT_SECRET &&
      process.env.OPENAI_API_KEY
    );
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: isDbConnected ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5002,
      hasRequiredEnvVars
    };
    
    // Return 200 if everything is healthy, 503 if not
    const statusCode = (isDbConnected && hasRequiredEnvVars) ? 200 : 503;
    
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    console.error('Detailed health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;

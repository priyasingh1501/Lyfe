const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Basic health check endpoint for Railway deployment
router.get('/', (req, res) => {
  try {
    const uptime = process.uptime();
    
    // If server just started (less than 10 seconds), return 503 to indicate not ready
    if (uptime < 10) {
      return res.status(503).json({
        status: 'starting',
        timestamp: new Date().toISOString(),
        uptime: uptime,
        message: 'Server is starting up, please wait...'
      });
    }
    
    // Basic health check - ensure the server is running
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 5002,
      message: 'Server is running and ready'
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

// Simple health check endpoint (always returns 200)
router.get('/simple', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
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

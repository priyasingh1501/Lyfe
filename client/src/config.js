// API Configuration
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.REACT_APP_API_URL || 'https://your-railway-backend.railway.app')
  : 'http://localhost:5002';

// Helper function to build API URLs
export const buildApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;

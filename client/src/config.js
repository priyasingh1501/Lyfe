// API Configuration
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.REACT_APP_API_URL || 'https://lyfe-backend-production.up.railway.app')
  : 'http://localhost:5002';

// Debug logging for production
if (process.env.NODE_ENV === 'production') {
  console.log('🌐 Production API Configuration:');
  console.log('🌐 REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
  console.log('🌐 API_BASE_URL:', API_BASE_URL);
}

// Helper function to build API URLs
export const buildApiUrl = (endpoint) => {
  const url = `${API_BASE_URL}${endpoint}`;
  if (process.env.NODE_ENV === 'production') {
    console.log('🌐 Building API URL:', url);
  }
  return url;
};

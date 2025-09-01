import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import { PWAInstall } from './components/ui';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import TimeManagement from './pages/TimeManagement';
import Health from './pages/Health';
import Finance from './pages/Finance';
import Documents from './pages/Documents';
import Relationships from './pages/Relationships';
import Communication from './pages/Communication';
import Journal from './pages/Journal';
import Content from './pages/Content';
import GoalAlignedDay from './pages/GoalAlignedDay';
import Food from './pages/Food';
import Pantry from './pages/Pantry';
import AiChat from './pages/AiChat';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile';
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/overview" replace />;
  }
  
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
                        <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            {/* PWA Install Prompt */}
            <PWAInstall />
            
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
                
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/overview" replace />} />
                <Route path="overview" element={<Dashboard />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="time-management" element={<TimeManagement />} />
                <Route path="health" element={<Health />} />
                <Route path="finance" element={<Finance />} />
                <Route path="documents" element={<Documents />} />
                <Route path="relationships" element={<Relationships />} />
                <Route path="communication" element={<Communication />} />
                <Route path="journal" element={<Journal />} />
                <Route path="content" element={<Content />} />
                <Route path="goal-aligned-day" element={<GoalAlignedDay />} />
                <Route path="food" element={<Food />} />
                <Route path="pantry" element={<Pantry />} />
                <Route path="ai-chat" element={<AiChat />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/overview" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

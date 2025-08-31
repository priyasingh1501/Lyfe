import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  X,
  Home,
  DollarSign,
  LogOut,
  Brain,
  Send,
  Target,
  Utensils
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { componentStyles, colors, typography } from '../../styles/designTokens';

const ConsistentPopup = ({ isOpen, onClose, title, children, maxWidth = "md", showReasonStrip = true, reasonStripColor = "from-accent-yellow to-accent-green" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background-overlay flex items-center justify-center z-[99999] p-4" onClick={onClose}>
      <div className={`bg-background-card border-2 border-border-primary rounded-2xl p-6 w-full max-w-${maxWidth} max-h-[90vh] overflow-y-auto shadow-2xl relative overflow-hidden`} 
           style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }} 
           onClick={(e) => e.stopPropagation()}>
        
        {/* Film grain overlay */}
        <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
        
        {/* Reason Strip */}
        {showReasonStrip && (
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${reasonStripColor}`}></div>
        )}
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-xl font-semibold text-text-primary ${typography.fontFamily.display} tracking-wide`}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Close popup"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [rightToolbarOpen, setRightToolbarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [aiMessages, setAiMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m Alfred, your AI lifestyle assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);



  const navigation = [
    { name: 'Overview', href: '/overview', icon: Home },
    { name: 'Goals', href: '/goal-aligned-day', icon: Target },
    { name: 'Food', href: '/food', icon: Utensils },
    { name: 'Finance', href: '/finance', icon: DollarSign },
    { name: 'Content', href: '/content', icon: Brain },
  ];



  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };





  const handleAiMessage = async (message) => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setAiLoading(true);
    
    try {
      // Send message to AI chat API
      const token = localStorage.getItem('token');
      
      const requestUrl = '/api/ai-chat/chat';
      const requestBody = { message };
      const requestHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      let response;
      try {
        response = await fetch(requestUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });
      } catch (fetchError) {
        console.error('❌ Fetch request failed:', fetchError);
        throw fetchError;
      }
      
      if (response.ok) {
        const data = await response.json();
        
        const aiResponse = {
          role: 'assistant',
          content: data.response || data.content || 'I understand. How else can I help?',
          timestamp: new Date()
        };
        
        setAiMessages(prev => {
          const newMessages = [...prev, aiResponse];
          return newMessages;
        });
      } else {
        console.log('❌ Response not ok, status:', response.status);
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        
        // Fallback response if API fails
        const fallbackResponse = {
          role: 'assistant',
          content: 'I\'m here to help! You can ask me to track expenses, add tasks, or get lifestyle insights.',
          timestamp: new Date()
        };
        setAiMessages(prev => [...prev, fallbackResponse]);
      }
    } catch (error) {
      console.error('❌ AI chat error:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Fallback response on error
      const fallbackResponse = {
        role: 'assistant',
        content: 'I\'m experiencing some technical difficulties. Please try again in a moment.',
        timestamp: new Date()
      };
      setAiMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-primary text-text-primary">
      {/* Main Layout */}
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div 
          className={`bg-background-secondary border-r border-border-primary flex flex-col transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          {/* Logo */}
          <div className={`border-b border-border-primary transition-all duration-300 ${
            sidebarCollapsed ? 'p-3' : 'p-6'
          }`}>
            <div className={`flex items-center transition-all duration-300 ${
              sidebarCollapsed ? 'justify-center' : 'space-x-3'
            }`}>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="w-full flex items-center rounded-xl transition-all duration-200 text-white hover:text-gray-200 px-2 py-3"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                )}
              </button>
              <span className={`text-xl font-bold ${typography.fontFamily.display} tracking-wide transition-all duration-300 ${
                sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              }`}>
                Lyfe
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'p-2' : 'p-4'
          }`}>
            <div className={`space-y-2 ${
              sidebarCollapsed ? 'space-y-3' : 'space-y-2'
            }`}>
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "w-full flex items-center rounded-xl transition-all duration-200",
                      sidebarCollapsed 
                        ? "justify-center px-2 py-3" 
                        : "justify-start space-x-3 px-4 py-3",
                      isActive
                        ? "bg-accent-green/20 text-accent-green border border-accent-green/30"
                        : "text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
                    )}
                    title={sidebarCollapsed ? item.name : ''}
                  >
                    <Icon size={20} />
                    <span className={`font-medium transition-all duration-300 ${
                      sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                    }`}>
                      {item.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </nav>

          {/* User Section */}
          <div className={`border-t border-border-primary transition-all duration-300 ${
            sidebarCollapsed ? 'p-2' : 'p-4'
          }`}>
            <div className={`flex items-center rounded-xl bg-background-tertiary transition-all duration-300 ${
              sidebarCollapsed ? 'justify-center p-2' : 'space-x-3 p-3'
            }`}>
              <div className="w-8 h-8 bg-accent-green rounded-full flex items-center justify-center">
                <span className="text-text-inverse text-sm font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className={`flex-1 min-w-0 transition-all duration-300 ${
                sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              }`}>
                <p className="text-sm font-medium text-text-primary truncate">
                  {user?.email || 'User'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className={`text-text-muted hover:text-text-primary transition-colors transition-all duration-300 ${
                  sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                }`}
                aria-label="Logout"
                title={sidebarCollapsed ? 'Logout' : ''}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="h-16 bg-background-secondary border-b border-border-primary flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <h1 className={`text-xl font-semibold ${typography.fontFamily.display} tracking-wide`}>
                Lyfe
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Chat with Alfred Button */}
              <button
                onClick={() => setAiChatOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-accent-green text-text-inverse rounded-lg hover:bg-accent-green/90 transition-all duration-200 font-medium"
                aria-label="Chat with Alfred"
              >
                <Brain size={18} />
                <span>Chat with Alfred</span>
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-background-primary">
            <Outlet />
          </main>
        </div>

        {/* Right Sidebar - AI Chat */}
        {aiChatOpen && (
          <div className="w-80 bg-background-secondary border-l border-border-primary flex flex-col">
            {/* AI Chat Header */}
            <div className="p-4 border-b border-border-primary">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${typography.fontFamily.display} tracking-wide`}>
                  AI Assistant
                </h3>
                <button
                  onClick={() => setAiChatOpen(false)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                  aria-label="Close AI chat"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* AI Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {aiMessages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex",
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-xs px-4 py-2 rounded-2xl",
                      msg.role === 'user'
                        ? "bg-accent-green text-text-inverse"
                        : "bg-background-tertiary text-text-primary"
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Chat Input */}
            <div className="p-4 border-t border-border-primary">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Ask Alfred anything..."
                  value={aiInput}
                  onChange={(e) => {
                    setAiInput(e.target.value);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && aiInput.trim() && !aiLoading) {
                      e.preventDefault();
                      handleAiMessage(aiInput);
                    }
                  }}
                  className={componentStyles.input.base}
                  disabled={aiLoading}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (aiInput.trim() && !aiLoading) {
                      handleAiMessage(aiInput);
                    }
                  }}
                  disabled={aiLoading || !aiInput.trim()}
                  className="p-3 bg-accent-green text-text-inverse rounded-xl hover:bg-accent-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;

import React, { useState, useEffect } from 'react';
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
  Utensils,
  Menu,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { componentStyles, colors, typography } from '../../styles/designTokens';

const ConsistentPopup = ({ isOpen, onClose, title, children, maxWidth = "md", showReasonStrip = true, reasonStripColor = "from-accent-yellow to-accent-green" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4 safe-area-top safe-area-bottom" onClick={onClose}>
      <div className="bg-[#1E2330] border-2 border-[#2A313A] rounded-2xl p-4 lg:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative overflow-hidden" 
           style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }} 
           onClick={(e) => e.stopPropagation()}>
        
        {/* Film grain overlay */}
        <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
        
        {/* Reason Strip */}
        {showReasonStrip && (
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${reasonStripColor}`}></div>
        )}
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <h3 className="text-lg lg:text-xl font-semibold text-[#E8EEF2] tracking-wide">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#E8EEF2] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close popup"
          >
            <X size={20} />
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m Alfred, your AI lifestyle assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  const navigation = [
    { name: 'Overview', href: '/overview', icon: Home },
    { name: 'Goals', href: '/goal-aligned-day', icon: Target },
    { name: 'Food', href: '/food', icon: Utensils },
    { name: 'Finance', href: '/finance', icon: DollarSign },
    { name: 'Content', href: '/content', icon: Brain },
    { name: 'Journal 🧠', href: '/journal', icon: BookOpen },
  ];

  // Debug log
  console.log('Navigation items:', navigation.map(item => item.name));



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
      {/* Mobile Sidebar Overlay */}
      {isMobile && mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Layout */}
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div 
          className={cn(
            "bg-background-secondary border-r border-border-primary flex flex-col transition-all duration-300 ease-in-out",
            isMobile 
              ? cn(
                  "fixed left-0 top-0 h-full z-50 transform transition-transform duration-300",
                  mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )
              : cn(
                  sidebarCollapsed ? 'w-16' : 'w-64'
                )
          )}
        >
          {/* Logo */}
          <div className={cn(
            "border-b border-border-primary transition-all duration-300",
            isMobile ? 'p-4' : sidebarCollapsed ? 'p-3' : 'p-6'
          )}>
            <div className={cn(
              "flex items-center transition-all duration-300",
              isMobile ? 'justify-between' : sidebarCollapsed ? 'justify-center' : 'space-x-3'
            )}>
              {!isMobile && (
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="w-full flex items-center rounded-xl transition-all duration-200 text-white hover:text-gray-200 px-2 py-3"
                  title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="w-5 h-5" />
                  ) : (
                    <ChevronLeft className="w-5 h-5" />
                  )}
                </button>
              )}
              <span className={cn(
                "text-xl font-bold tracking-wide transition-all duration-300",
                isMobile ? 'opacity-100' : sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              )}>
                Lyfe
              </span>
              {isMobile && (
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className={cn(
            "flex-1 transition-all duration-300",
            isMobile ? 'p-4' : sidebarCollapsed ? 'p-2' : 'p-4'
          )}>
            <div className={cn(
              "space-y-2",
              isMobile ? 'space-y-3' : sidebarCollapsed ? 'space-y-3' : 'space-y-2'
            )}>
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => isMobile && setMobileSidebarOpen(false)}
                    className={cn(
                      "w-full flex items-center rounded-xl transition-all duration-200",
                      isMobile 
                        ? "justify-start space-x-3 px-4 py-3" 
                        : sidebarCollapsed 
                          ? "justify-center px-2 py-3" 
                          : "justify-start space-x-3 px-4 py-3",
                      isActive
                        ? "bg-accent-green/20 text-accent-green border border-accent-green/30"
                        : "text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
                    )}
                    title={sidebarCollapsed && !isMobile ? item.name : ''}
                  >
                    <Icon size={20} />
                    <span className={cn(
                      "font-medium transition-all duration-300",
                      isMobile ? 'opacity-100' : sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                    )}>
                      {item.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </nav>

          {/* User Section */}
          <div className={cn(
            "border-t border-border-primary transition-all duration-300",
            isMobile ? 'p-4' : sidebarCollapsed ? 'p-2' : 'p-4'
          )}>
            <div className={cn(
              "flex items-center rounded-xl bg-background-tertiary transition-all duration-300",
              isMobile ? 'space-x-3 p-3' : sidebarCollapsed ? 'justify-center p-2' : 'space-x-3 p-3'
            )}>
              <div className="w-8 h-8 bg-accent-green rounded-full flex items-center justify-center">
                <span className="text-text-inverse text-sm font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className={cn(
                "flex-1 min-w-0 transition-all duration-300",
                isMobile ? 'opacity-100' : sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              )}>
                <p className="text-sm font-medium text-text-primary truncate">
                  {user?.email || 'User'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className={cn(
                  "text-text-muted hover:text-text-primary transition-colors transition-all duration-300",
                  isMobile ? 'opacity-100' : sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                )}
                aria-label="Logout"
                title={sidebarCollapsed && !isMobile ? 'Logout' : ''}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={cn(
          "flex-1 flex flex-col overflow-hidden",
          isMobile && mobileSidebarOpen ? 'ml-0' : ''
        )}>
          {/* Top Bar */}
          <header className="h-16 bg-background-secondary border-b border-border-primary flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center space-x-4">
              {isMobile && (
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="text-text-muted hover:text-text-primary transition-colors lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu size={24} />
                </button>
              )}
              <h1 className={cn(
                "text-xl font-semibold tracking-wide",
                isMobile ? 'text-lg' : 'text-xl'
              )}>
                Lyfe
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-3">
              {/* Chat with Alfred Button */}
              <button
                onClick={() => setAiChatOpen(true)}
                className={cn(
                  "flex items-center space-x-2 bg-accent-green text-text-inverse rounded-lg hover:bg-accent-green/90 transition-all duration-200 font-medium",
                  isMobile ? 'px-3 py-2' : 'px-4 py-2'
                )}
                aria-label="Chat with Alfred"
              >
                <Brain size={isMobile ? 16 : 18} />
                {!isMobile && <span>Chat with Alfred</span>}
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-background-primary safe-area-bottom">
            <Outlet />
          </main>
        </div>

        {/* Right Sidebar - AI Chat */}
        {aiChatOpen && (
          <div className={cn(
            "bg-background-secondary border-l border-border-primary flex flex-col",
            isMobile ? "fixed right-0 top-0 h-full w-full z-50" : "w-80"
          )}>
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
                      "px-4 py-2 rounded-2xl",
                      isMobile ? "max-w-[80%]" : "max-w-xs",
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
            <div className="p-4 border-t border-border-primary safe-area-bottom">
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
                  className={cn(
                    componentStyles.input.base,
                    "flex-1 min-h-[44px]"
                  )}
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
                  className="p-3 bg-accent-green text-text-inverse rounded-xl hover:bg-accent-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px]"
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

export { ConsistentPopup };
export default Layout;

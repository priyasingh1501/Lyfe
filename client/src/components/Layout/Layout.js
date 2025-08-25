import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Menu,
  X,
  Home,
  DollarSign,
  FileText,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Brain,
  ShoppingCart,
  Heart,
  BookOpen,
  Video,
  Film,
  Plus,
  Search,
  Bell,
  Send,
  Target,
  Utensils,
  Package
} from 'lucide-react';
import { cn } from '../../utils/cn';

const ConsistentPopup = ({ isOpen, onClose, title, children, maxWidth = "md", showReasonStrip = true, reasonStripColor = "from-[#FFD200] to-[#3CCB7F]" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4" onClick={onClose}>
      <div className={`bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 w-full max-w-${maxWidth} max-h-[90vh] overflow-y-auto shadow-2xl relative overflow-hidden`} 
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
          <h3 className="text-xl font-semibold text-[#E8EEF2] font-oswald tracking-wide">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-[#C9D1D9] hover:text-[#E8EEF2] transition-colors"
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
  console.log('🔍 Layout component mounting...');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(true);
  const [rightToolbarOpen, setRightToolbarOpen] = useState(true);
  const [aiMessages, setAiMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m Alfred, your AI lifestyle assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  console.log('🔍 Layout state initialized:', { aiChatOpen, aiMessages: aiMessages.length, aiInput, aiLoading });

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Goal-Aligned Day', href: '/goal-aligned-day', icon: Target },
    { name: 'Food', href: '/food', icon: Utensils },
    { name: 'Pantry', href: '/pantry', icon: Package },
    { name: 'Finance', href: '/finance', icon: DollarSign },
    { name: 'Content', href: '/content', icon: BookOpen },
  ];

  const rightTools = [
    { name: 'Quick Add', icon: Plus, action: 'quick-add' },
    { name: 'Search', icon: Search, action: 'search' },
    { name: 'Notifications', icon: Bell, action: 'notifications' },
    { name: 'Settings', icon: Settings, action: 'settings' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActiveRoute = (href) => {
    return location.pathname === href;
  };

  const handleAiMessage = async (message) => {
    if (!message.trim()) return;
    
    console.log('🚀 Sending message:', message);
    console.log('🚀 Function called successfully');
    console.log('🚀 Message length:', message.length);
    
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
      console.log('🔑 Token available:', !!token);
      console.log('🔑 Token length:', token ? token.length : 0);
      console.log('🔑 Token preview:', token ? token.substring(0, 20) + '...' : 'none');
      
      const requestUrl = '/api/ai-chat/chat';
      const requestBody = { message };
      const requestHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      console.log('🌐 Making fetch request to:', requestUrl);
      console.log('🌐 Request body:', requestBody);
      console.log('🌐 Request headers:', requestHeaders);
      console.log('🌐 Full request URL:', window.location.origin + requestUrl);
      
      console.log('🌐 About to make fetch request...');
      
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
        console.log('✅ Fetch request completed successfully');
      } catch (fetchError) {
        console.error('❌ Fetch request failed:', fetchError);
        throw fetchError;
      }
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📡 Response data:', data);
        console.log('📡 Response keys:', Object.keys(data));
        console.log('📡 Response content:', data.response);
        console.log('📡 Response actions:', data.actions);
        
        const aiResponse = {
          role: 'assistant',
          content: data.response || data.content || 'I understand. How else can I help?',
          timestamp: new Date()
        };
        console.log('🤖 AI Response:', aiResponse);
        
        setAiMessages(prev => {
          console.log('📝 Previous messages:', prev);
          const newMessages = [...prev, aiResponse];
          console.log('📝 New messages array:', newMessages);
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
      
      const errorResponse = {
        role: 'assistant',
        content: `Sorry, I'm having trouble connecting right now. Error: ${error.message}`,
        timestamp: new Date()
      };
      setAiMessages(prev => [...prev, errorResponse]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C0F] grid [grid-template-columns:clamp(260px,28vw,360px)_minmax(0,1fr)_72px] overflow-hidden">
      {/* Left Sidebar - AI Chat - Alfred Bar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-[#11151A] border-r-2 border-[#2A313A] shadow-2xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:inset-0 lg:flex-shrink-0 lg:w-80 flex flex-col h-screen",
        aiChatOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b-2 border-[#2A313A] flex-shrink-0 bg-[#0A0C0F]">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-[#FFD200] to-[#FFD200] rounded-lg flex items-center justify-center border border-[#FFD200]">
              <Brain size={20} className="text-[#0A0C0F]" />
            </div>
            <h1 className="ml-3 text-xl font-bold text-[#E8EEF2] font-oswald tracking-wide">ALFRED AI</h1>
          </div>
          <button
            onClick={() => setAiChatOpen(false)}
            className="lg:hidden p-1 rounded-md text-[#C9D1D9] hover:text-[#FFD200] hover:bg-[#2A313A] transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* AI Chat Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-[#0A0C0F] p-3 border-b-2 border-[#2A313A] flex-shrink-0">
            <h3 className="font-semibold text-[#E8EEF2] mb-1 font-oswald tracking-wide">MISSION BRIEFING</h3>
            <p className="text-xs text-[#C9D1D9] font-inter">
              Ask me to track expenses, add tasks, or get lifestyle insights
            </p>
          </div>
          
          {/* Chat Messages - Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#11151A]">
            {aiMessages.length > 0 ? (
              aiMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm border border-[#2A313A] ${
                      msg.role === 'user'
                        ? 'bg-[#FFD200] text-[#0A0C0F]'
                        : 'bg-[#0A0C0F] text-[#C9D1D9] border-[#2A313A]'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[#C9D1D9]">
                <p className="text-sm font-inter">Start a conversation with Alfred</p>
              </div>
            )}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="bg-[#0A0C0F] border border-[#2A313A] rounded-lg px-3 py-2 text-sm text-[#C9D1D9]">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-[#FFD200] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#FFD200] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[#FFD200] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Chat Input - Always Visible at Bottom */}
          <div className="p-3 border-t-2 border-[#2A313A] bg-[#0A0C0F] flex-shrink-0 mt-auto">
            <div className="flex space-x-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => {
                  console.log('🔍 Input change:', e.target.value);
                  setAiInput(e.target.value);
                }}
                onKeyPress={(e) => {
                  console.log('🔍 Key press:', e.key);
                  if (e.key === 'Enter' && aiInput.trim() && !aiLoading) {
                    e.preventDefault();
                    console.log('🔍 Enter pressed, calling handleAiMessage');
                    handleAiMessage(aiInput);
                  }
                }}
                placeholder="Ask Alfred anything..."
                className="flex-1 px-3 py-2 border-2 border-[#2A313A] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD200] focus:border-[#FFD200] text-sm bg-[#11151A] text-[#E8EEF2] placeholder-[#C9D1D9] font-inter"
                disabled={aiLoading}
              />
              <button
                type="button"
                onClick={() => {
                  console.log('🔍 Send button clicked');
                  if (aiInput.trim() && !aiLoading) {
                    console.log('🔍 Calling handleAiMessage from button');
                    handleAiMessage(aiInput);
                  }
                }}
                disabled={aiLoading || !aiInput.trim()}
                className="px-3 py-2 bg-[#FFD200] text-[#0A0C0F] rounded-lg hover:bg-[#FFD200]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-[#FFD200]"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col overflow-auto min-w-0">

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#0A0C0F]">
          <div className="pr-6 py-6">
            <div className="w-full">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Right Toolbar */}
      <div className={cn(
        "fixed inset-y-0 right-0 z-40 w-16 bg-[#11151A] border-l-2 border-[#2A313A] shadow-2xl transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:inset-0 lg:flex-shrink-0 overflow-auto min-w-0",
        rightToolbarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        {/* Toolbar Toggle Indicator when hidden */}
        {!rightToolbarOpen && (
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-8 lg:hidden">
            <button
              onClick={() => setRightToolbarOpen(true)}
              className="p-2 bg-[#0A0C0F] text-[#FFD200] rounded-l-lg shadow-lg hover:bg-[#2A313A] transition-colors border border-[#2A313A]"
            >
              <Settings size={16} />
            </button>
          </div>
        )}
        <div className="flex flex-col items-center py-6 space-y-4">
          {/* Navigation Icons */}
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={cn(
                  "p-3 rounded-lg transition-colors group relative border border-transparent hover:border-[#2A313A]",
                  isActiveRoute(item.href)
                    ? "text-[#FFD200] bg-[#2A313A] border-[#2A313A]"
                    : "text-[#C9D1D9] hover:text-[#FFD200] hover:bg-[#2A313A]"
                )}
                title={item.name}
              >
                <Icon size={20} />
                
                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-2 py-1 text-xs text-[#E8EEF2] bg-[#0A0C0F] border border-[#2A313A] rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 font-oswald tracking-wide">
                  {item.name}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-r-4 border-l-4 border-t-4 border-b-4 border-transparent border-r-[#0A0C0F]"></div>
                </div>
              </button>
            );
          })}
          
          {/* Divider */}
          <div className="w-8 h-px bg-[#2A313A]"></div>
           
           {/* Logout */}
           <button 
             onClick={handleLogout}
             className="p-3 rounded-lg text-[#C9D1D9] hover:text-[#D64545] hover:bg-[#2A313A] transition-colors group relative border border-transparent hover:border-[#D64545]"
             title="Logout"
           >
             <LogOut size={20} />
             <div className="absolute left-full ml-2 px-2 py-1 text-xs text-[#E8EEF2] bg-[#0A0C0F] border border-[#2A313A] rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 font-oswald tracking-wide">
               Logout
               <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-r-4 border-l-4 border-t-4 border-b-4 border-transparent border-r-[#0A0C0F]"></div>
             </div>
           </button>
         </div>
       </div>

      {/* Mobile AI Chat Toggle */}
      {!aiChatOpen && (
        <button
          onClick={() => setAiChatOpen(true)}
          className="fixed bottom-4 left-4 z-50 lg:hidden p-3 bg-[#0A0C0F] text-[#FFD200] rounded-full shadow-2xl hover:bg-[#2A313A] transition-colors border-2 border-[#FFD200]"
        >
          <Brain size={20} />
        </button>
      )}
    </div>
  );
};

export { ConsistentPopup };
export default Layout;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Edit3,
  Trash2,
  Filter,
  Download
} from 'lucide-react';
import axios from 'axios';

const Finance = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showCategoryGoalsForm, setShowCategoryGoalsForm] = useState(false);
  const [categoryGoals, setCategoryGoals] = useState({
    food: 2000,
    transportation: 1500,
    shopping: 3000,
    entertainment: 1000,
    healthcare: 2000,
    utilities: 1500,
    housing: 25000,
    travel: 5000,
    education: 3000,
    other: 1000
  });
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    vendor: '',
    paymentMethod: '',
    source: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('🔍 Fetching financial data with token:', token ? 'Present' : 'Missing');
      
      const [expensesRes, summaryRes] = await Promise.all([
        axios.get('/api/finance/expenses', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/finance/summary', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      console.log('📊 Financial data received:', {
        expenses: expensesRes.data,
        summary: summaryRes.data
      });

      console.log('🔍 Setting state with:', {
        expensesCount: expensesRes.data.length,
        summaryKeys: Object.keys(summaryRes.data)
      });

      setExpenses(expensesRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('❌ Error fetching financial data:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const endpoint = '/api/finance/expenses';
      
      if (editingItem) {
        await axios.put(`${endpoint}/${editingItem._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(endpoint, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setShowAddForm(false);
      setEditingItem(null);
      setFormData({
        amount: '',
        category: '',
        description: '',
        vendor: '',
        paymentMethod: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      fetchFinancialData();
    } catch (error) {
      console.error('Error saving financial record:', error);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = '/api/finance/expenses';
      
      await axios.delete(`${endpoint}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchFinancialData();
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      amount: item.amount,
      category: item.category || '',
      description: item.description || '',
      vendor: item.vendor || '',
      paymentMethod: item.paymentMethod || '',
      date: new Date(item.date).toISOString().split('T')[0],
      notes: item.notes || ''
    });
    setShowAddForm(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  const getCategoryColor = (category) => {
    return 'bg-gray-100 text-gray-700';
  };

  const getCategoryGoalsWithProgress = () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const currentMonthExpenses = expenses.filter(expense => 
      expense.date.startsWith(currentMonth)
    );

    // Group expenses by category for current month
    const categoryExpenses = {};
    currentMonthExpenses.forEach(expense => {
      const category = expense.category || 'other';
      categoryExpenses[category] = (categoryExpenses[category] || 0) + expense.amount;
    });

    // Calculate progress for each category
    return Object.entries(categoryGoals).map(([category, goal]) => {
      const spent = categoryExpenses[category] || 0;
      const percentage = goal > 0 ? Math.round((spent / goal) * 100) : 0;
      
      return {
        name: category,
        goal,
        spent,
        percentage
      };
    }).sort((a, b) => b.spent - a.spent); // Sort by amount spent
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FFD200]"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-full overflow-x-auto"
    >
      {/* Header - Mission Card */}
      <div className="bg-gray-900 border-2 border-gray-600 rounded-lg p-6 relative overflow-hidden mb-6" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
        {/* Film grain overlay */}
        <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
        
        {/* Reason Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-blue-500 to-green-500"></div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-white font-oswald tracking-wide">FINANCIAL MISSION</h1>
            
            {/* Tabs */}
            <div className="flex space-x-0.5 bg-gray-800 p-0.5 rounded-md w-fit border border-gray-600">
              {['overview', 'expenses', 'subscriptions'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-1 px-2 rounded-sm text-xs font-medium transition-colors font-oswald tracking-wide ${
                    activeTab === tab
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-gray-300 hover:text-amber-400'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-amber-500 text-white px-3 py-1.5 rounded hover:bg-amber-400 flex items-center gap-1 font-oswald tracking-wide transition-colors text-xs border border-amber-400 hover:shadow-lg hover:shadow-amber-500/20"
            >
              <Plus size={14} />
              ADD RECORD
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
                  {/* Summary Cards - Mission Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-900 border-2 border-gray-600 text-white p-3 rounded-lg relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
            <div className="flex flex-col items-center text-center">
              <p className="text-gray-300 text-xs mb-1 font-oswald tracking-wide">EXPENSES</p>
              <p className="text-sm font-bold font-mono">{formatCurrency(summary.totalExpenses || 0)}</p>
            </div>
          </div>
          
          <div className="bg-gray-900 border-2 border-gray-600 text-white p-3 rounded-lg relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-green-500"></div>
            <div className="flex flex-col items-center text-center">
              <p className="text-gray-300 text-xs mb-1 font-oswald tracking-wide">INCOME</p>
              <p className="text-sm font-bold font-mono">{formatCurrency(summary.totalIncome || 0)}</p>
            </div>
          </div>
          
          <div className={`p-3 rounded-lg relative overflow-hidden border-2 ${(summary.netAmount || 0) >= 0 ? 'bg-gray-900 border-gray-600 text-white' : 'bg-gray-900 border-red-600 text-white'}`} style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
            <div className={`absolute top-0 left-0 right-0 h-1 ${(summary.netAmount || 0) >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}></div>
            <div className="flex flex-col items-center text-center">
              <p className="text-gray-300 text-xs mb-1 font-oswald tracking-wide">NET</p>
              <p className="text-sm font-bold font-mono">{formatCurrency(summary.netAmount || 0)}</p>
            </div>
          </div>
        </div>

          {/* Monthly Expense Analysis - Mission Card */}
          <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 relative overflow-hidden mb-6" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
            {/* Film grain overlay */}
            <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
            
            {/* Reason Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD200] via-[#3EA6FF] to-[#3CCB7F]"></div>
            
            <h3 className="text-sm font-semibold text-[#E8EEF2] mb-3 font-oswald tracking-wide">MONTHLY EXPENSE ANALYSIS</h3>
            <div className="grid grid-cols-3 gap-2">
              {/* Current Month */}
              <div className="text-center p-3 bg-[#0A0C0F] border border-[#2A313A] rounded-lg">
                <p className="text-xs text-[#C9D1D9] mb-1 font-oswald tracking-wide">CURRENT MONTH</p>
                <p className="text-base font-bold text-[#E8EEF2] font-mono">
                  {formatCurrency(summary.currentMonthExpenses || 0)}
                </p>
                <p className="text-xs text-[#C9D1D9] font-inter">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              
              {/* Previous Month */}
              <div className="text-center p-3 bg-[#0A0C0F] border border-[#2A313A] rounded-lg">
                <p className="text-xs text-[#C9D1D9] mb-1 font-oswald tracking-wide">PREVIOUS MONTH</p>
                <p className="text-base font-bold text-[#E8EEF2] font-mono">
                  {formatCurrency(summary.previousMonthExpenses || 0)}
                </p>
                <p className="text-xs text-[#C9D1D9] font-inter">
                  {new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              
              {/* Monthly Average */}
              <div className="text-center p-2 bg-[#0A0C0F] border border-[#2A313A] rounded">
                <p className="text-xs text-[#C9D1D9] mb-1 font-oswald tracking-wide">MONTHLY AVERAGE</p>
                <p className="text-base font-bold text-[#E8EEF2] font-mono">
                  {formatCurrency(summary.monthlyAverage || 0)}
                </p>
                <p className="text-xs text-[#C9D1D9] font-inter">Last 6 months</p>
              </div>
            </div>
            
            {/* Monthly Trend Chart */}
            <div className="mt-2 p-2 bg-[#0A0C0F] border border-[#2A313A] rounded max-w-full overflow-x-auto">
              <p className="text-xs text-[#C9D1D9] mb-1 font-oswald tracking-wide">MONTHLY TREND</p>
              <div className="flex items-end justify-between h-16 space-x-1 min-w-max">
                {Array.from({ length: 6 }, (_, i) => {
                  const month = new Date(new Date().getFullYear(), new Date().getMonth() - (5 - i), 1);
                  const monthKey = month.toISOString().slice(0, 7); // YYYY-MM format
                  const monthExpense = summary.monthlyExpenses?.[monthKey] || 0;
                  const maxExpense = Math.max(...Object.values(summary.monthlyExpenses || {}), 1);
                  const height = maxExpense > 0 ? (monthExpense / maxExpense) * 100 : 0;
                  
                  return (
                    <div key={monthKey} className="flex flex-col items-center">
                      <div 
                        className="w-3 bg-[#2A313A] rounded-t-sm transition-all duration-300 hover:bg-[#3EA6FF]"
                        style={{ height: `${height}%` }}
                        title={`${month.toLocaleDateString('en-US', { month: 'short' })}: ${formatCurrency(monthExpense)}`}
                      ></div>
                      <p className="text-xs text-[#C9D1D9] mt-1 font-mono">
                        {month.toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Category Goals vs Expenses */}
          <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-4 relative overflow-hidden mb-4" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
            {/* Film grain overlay */}
            <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
            
            {/* Reason Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3CCB7F] via-[#3EA6FF] to-[#FFD200]"></div>
            
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#E8EEF2] font-oswald tracking-wide">CATEGORY GOALS VS EXPENSES</h3>
              <button 
                onClick={() => setShowCategoryGoalsForm(true)}
                className="text-xs bg-[#FFD200] text-[#0A0C0F] px-2 py-1 rounded hover:bg-[#FFD200]/90 transition-colors font-oswald tracking-wide"
              >
                SET GOALS
              </button>
            </div>
            
            <div className="space-y-2">
              {getCategoryGoalsWithProgress().map((category) => (
                <div key={category.name} className="p-2 bg-[#0A0C0F] border border-[#2A313A] rounded">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-[#3EA6FF]"></span>
                      <span className="text-xs font-medium text-[#E8EEF2] font-oswald tracking-wide capitalize">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#C9D1D9] font-mono">
                        {formatCurrency(category.spent)} / {formatCurrency(category.goal)}
                      </p>
                      <p className="text-xs text-[#C9D1D9] font-mono">
                        {category.percentage}% used
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-[#2A313A] rounded-full h-1.5">
                    <div 
                      className="h-1.5 rounded-full transition-all duration-300 bg-[#3EA6FF]"
                      style={{ width: `${Math.min(category.percentage, 100)}%` }}
                    ></div>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-oswald tracking-wide ${
                      category.percentage >= 100 
                        ? 'bg-[#D64545] text-[#E8EEF2]' 
                        : 'bg-[#2A313A] text-[#C9D1D9]'
                    }`}>
                      {category.percentage >= 100 
                        ? 'OVER BUDGET' 
                        : 'ON TRACK'
                      }
                    </span>
                    
                    {category.percentage < 100 && (
                      <span className="text-xs text-[#C9D1D9] font-mono">
                        {formatCurrency(category.goal - category.spent)} remaining
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-max">
            {/* Recent Expenses */}
            <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-4 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
              {/* Film grain overlay */}
              <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
              
              {/* Reason Strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3CCB7F] to-[#3EA6FF]"></div>
              
              <h3 className="text-sm font-semibold text-[#E8EEF2] mb-3 font-oswald tracking-wide">RECENT EXPENSES</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {(summary.recentExpenses || []).length > 0 ? (
                  (summary.recentExpenses || []).map((expense) => (
                    <div key={expense._id} className="flex items-center justify-between p-2 bg-[#0A0C0F] border border-[#2A313A] rounded hover:bg-[#2A313A] transition-colors">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-[#3EA6FF]"></div>
                        <div>
                          <p className="text-xs font-medium text-[#E8EEF2] font-oswald tracking-wide">{expense.description || expense.vendor}</p>
                          <p className="text-xs text-[#C9D1D9] font-inter">{formatDate(expense.date)}</p>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-[#FFD200] font-mono">{formatCurrency(expense.amount)}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-[#C9D1D9] font-inter text-xs">No expenses yet</p>
                    <p className="text-xs text-[#C9D1D9] mt-1 font-inter">Add your first expense to get started</p>
                  </div>
                )}
              </div>
            </div>

            {/* Subscriptions */}
            <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-4 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
              {/* Film grain overlay */}
              <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
              
              {/* Reason Strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD200] to-[#3CCB7F]"></div>
              
              <h3 className="text-sm font-semibold text-[#E8EEF2] mb-3 font-oswald tracking-wide">ACTIVE SUBSCRIPTIONS</h3>
              <div className="space-y-1">
                <div className="text-center py-3">
                  <p className="text-[#C9D1D9] font-inter text-xs">No subscriptions yet</p>
                  <p className="text-xs text-[#C9D1D9] mt-1 font-inter">Track your recurring payments</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'expenses' && (
        <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-4 relative overflow-hidden max-w-full overflow-x-auto" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
          {/* Film grain overlay */}
          <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
          
          {/* Reason Strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D64545] to-[#FFD200]"></div>
          
          <h3 className="text-sm font-semibold text-[#E8EEF2] mb-3 font-oswald tracking-wide">ALL EXPENSES</h3>
          <div className="overflow-y-auto max-h-[320px] relative min-w-max">
            <table className="w-full">
              <thead className="sticky top-0 bg-[#0A0C0F] z-10 border-b border-[#2A313A]">
                <tr>
                  <th className="text-left py-2 px-3 font-medium text-[#E8EEF2] font-oswald tracking-wide text-sm">DATE</th>
                  <th className="text-left py-2 px-3 font-medium text-[#E8EEF2] font-oswald tracking-wide text-sm">DESCRIPTION</th>
                  <th className="text-left py-2 px-3 font-medium text-[#E8EEF2] font-oswald tracking-wide text-sm">CATEGORY</th>
                  <th className="text-left py-2 px-3 font-medium text-[#E8EEF2] font-oswald tracking-wide text-sm">VENDOR</th>
                  <th className="text-left py-2 px-3 font-medium text-[#E8EEF2] font-oswald tracking-wide text-sm">PAYMENT</th>
                  <th className="text-right py-2 px-3 font-medium text-[#E8EEF2] font-oswald tracking-wide text-sm">AMOUNT</th>
                  <th className="text-center py-2 px-3 font-medium text-[#E8EEF2] font-oswald tracking-wide text-sm">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <tr key={expense._id} className="border-b border-[#2A313A] hover:bg-[#2A313A] transition-colors">
                      <td className="py-2 px-3 text-xs text-[#C9D1D9] font-inter">{formatDate(expense.date)}</td>
                      <td className="py-2 px-3">
                        <p className="font-medium text-[#E8EEF2] font-oswald tracking-wide text-sm">{expense.description}</p>
                        {expense.notes && <p className="text-xs text-[#C9D1D9] font-inter">{expense.notes}</p>}
                      </td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium font-oswald tracking-wide bg-[#2A313A] text-[#E8EEF2] border border-[#3EA6FF]">
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-xs text-[#C9D1D9] font-inter">{expense.vendor}</td>
                      <td className="py-2 px-3 text-xs text-[#C9D1D9] font-inter">{expense.paymentMethod}</td>
                      <td className="py-2 px-3 text-right font-semibold text-[#FFD200] font-mono text-sm">{formatCurrency(expense.amount)}</td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex justify-center space-x-1">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="text-[#3EA6FF] hover:text-[#3EA6FF]/80 transition-colors p-1"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(expense._id, 'expense')}
                            className="text-[#D64545] hover:text-[#D64545]/80 transition-colors p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center">
                      <div className="text-[#C9D1D9] font-inter">
                        <p className="text-base mb-2">No expenses yet</p>
                        <p className="text-xs text-[#C9D1D9]">Add your first expense to get started</p>
                        <button
                          onClick={() => setShowAddForm(true)}
                          className="mt-3 bg-[#FFD200] text-[#0A0C0F] px-3 py-1.5 rounded-lg hover:bg-[#FFD200]/90 font-oswald tracking-wide transition-colors text-sm"
                        >
                          ADD FIRST EXPENSE
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-3 relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
          {/* Film grain overlay */}
          <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
          
          {/* Reason Strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD200] to-[#3CCB7F]"></div>
          
          <h3 className="text-sm font-semibold text-[#E8EEF2] mb-2 font-oswald tracking-wide">ACTIVE SUBSCRIPTIONS</h3>
          <div className="space-y-1.5">
            <div className="text-center py-4">
              <p className="text-[#C9D1D9] font-inter text-xs">No subscriptions yet</p>
              <p className="text-xs text-[#C9D1D9] mt-1 font-inter">Track your recurring payments</p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
          <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-4 w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
            {/* Film grain overlay */}
            <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
            
            {/* Reason Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD200] to-[#3EA6FF]"></div>
            
            <h3 className="text-base font-semibold text-[#E8EEF2] mb-3 font-oswald tracking-wide">
              {editingItem ? 'EDIT EXPENSE' : 'ADD NEW EXPENSE'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-3">


              <div>
                <label className="block text-xs font-medium text-[#E8EEF2] mb-1 font-oswald tracking-wide">AMOUNT</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                  className="w-full p-1.5 border-2 border-[#2A313A] rounded-md focus:ring-2 focus:ring-[#FFD200] focus:border-[#FFD200] bg-[#0A0C0F] text-[#E8EEF2] placeholder-[#C9D1D9] font-inter text-sm"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C9D1D9] mb-1 font-oswald tracking-wide">CATEGORY</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-1.5 border-2 border-[#2A313A] rounded-md focus:ring-2 focus:ring-[#FFD200] focus:border-[#FFD200] bg-[#0A0C0F] text-[#E8EEF2] font-inter text-sm"
                >
                  <option value="">Select Category</option>
                  <option value="food">Food</option>
                  <option value="transportation">Transportation</option>
                  <option value="shopping">Shopping</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="utilities">Utilities</option>
                  <option value="housing">Housing</option>
                  <option value="travel">Travel</option>
                  <option value="education">Education</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C9D1D9] mb-1 font-oswald tracking-wide">VENDOR</label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                  className="w-full p-1.5 border-2 border-[#2A313A] rounded-md focus:ring-2 focus:ring-[#FFD200] focus:border-[#FFD200] bg-[#0A0C0F] text-[#E8EEF2] placeholder-[#C9D1D9] font-inter text-sm"
                  placeholder="Where did you spend?"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C9D1D9] mb-1 font-oswald tracking-wide">PAYMENT METHOD</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  className="w-full p-1.5 border-2 border-[#2A313A] rounded-md focus:ring-2 focus:ring-[#FFD200] focus:border-[#FFD200] bg-[#0A0C0F] text-[#E8EEF2] font-inter text-sm"
                >
                  <option value="">Select Payment Method</option>
                  <option value="cash">Cash</option>
                  <option value="credit-card">Credit Card</option>
                  <option value="debit-card">Debit Card</option>
                  <option value="digital-wallet">Digital Wallet</option>
                  <option value="bank-transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>



              <div>
                <label className="block text-xs font-medium text-[#C9D1D9] mb-1 font-oswald tracking-wide">DESCRIPTION</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-1.5 border-2 border-[#2A313A] rounded-md focus:ring-2 focus:ring-[#FFD200] focus:border-[#FFD200] bg-[#0A0C0F] text-[#E8EEF2] placeholder-[#C9D1D9] font-inter text-sm"
                  placeholder="What was this for?"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C9D1D9] mb-1 font-oswald tracking-wide">DATE</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full p-1.5 border-2 border-[#2A313A] rounded-md focus:ring-2 focus:ring-[#FFD200] focus:border-[#FFD200] bg-[#0A0C0F] text-[#E8EEF2] font-inter text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C9D1D9] mb-1 font-oswald tracking-wide">NOTES</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-1.5 border-2 border-[#2A313A] rounded-md focus:ring-2 focus:ring-[#FFD200] focus:border-[#FFD200] bg-[#0A0C0F] text-[#E8EEF2] placeholder-[#C9D1D9] font-inter text-sm"
                  rows="2"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingItem(null);
                    setFormData({
                      amount: '',
                      category: '',
                      description: '',
                      vendor: '',
                      paymentMethod: '',
                      date: new Date().toISOString().split('T')[0],
                      notes: ''
                    });
                  }}
                  className="flex-1 px-3 py-1.5 border-2 border-[#2A313A] text-[#C9D1D9] rounded-md hover:bg-[#2A313A] font-oswald tracking-wide transition-colors text-sm"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-1.5 bg-[#FFD200] text-[#0A0C0F] rounded-md hover:bg-[#FFD200]/90 font-oswald tracking-wide transition-colors text-sm"
                >
                  {editingItem ? 'UPDATE' : 'ADD'} EXPENSE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Goals Form Modal */}
      {showCategoryGoalsForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
          <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-4 w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
            {/* Film grain overlay */}
            <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
            
            {/* Reason Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3CCB7F] to-[#FFD200]"></div>
            
            <h3 className="text-base font-semibold text-[#E8EEF2] mb-3 font-oswald tracking-wide">SET CATEGORY GOALS</h3>
            
            <div className="space-y-3">
              {Object.entries(categoryGoals).map(([category, goal]) => (
                <div key={category}>
                  <label className="block text-xs font-medium text-[#C9D1D9] mb-1 capitalize font-oswald tracking-wide">{category.toUpperCase()}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={goal}
                    onChange={(e) => setCategoryGoals({
                      ...categoryGoals,
                      [category]: parseFloat(e.target.value) || 0
                    })}
                    className="w-full p-1.5 border-2 border-[#2A313A] rounded-md focus:ring-2 focus:ring-[#FFD200] focus:border-[#FFD200] bg-[#0A0C0F] text-[#E8EEF2] placeholder-[#C9D1D9] font-inter text-sm"
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>

            <div className="flex space-x-2 pt-3">
              <button
                type="button"
                onClick={() => setShowCategoryGoalsForm(false)}
                className="flex-1 px-3 py-1.5 border-2 border-[#2A313A] text-[#C9D1D9] rounded-md hover:bg-[#2A313A] font-oswald tracking-wide transition-colors text-sm"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => setShowCategoryGoalsForm(false)}
                className="flex-1 px-3 py-1.5 bg-[#FFD200] text-[#0A0C0F] rounded-md hover:bg-[#FFD200]/90 font-oswald tracking-wide transition-colors text-sm"
              >
                SAVE GOALS
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Finance;

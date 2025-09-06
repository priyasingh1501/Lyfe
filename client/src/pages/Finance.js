import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { buildApiUrl } from '../config';
import { 
  Plus, 
  Edit3,
  Trash2,
  Upload,
  Image,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Target
} from 'lucide-react';
import axios from 'axios';
import Card from '../components/ui/Card';
import { componentStyles, animations } from '../styles/designTokens';

const Finance = () => {
  
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showCategoryGoalsForm, setShowCategoryGoalsForm] = useState(false);
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
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
  const [expenseGoals, setExpenseGoals] = useState([]);
  const [newGoalForm, setNewGoalForm] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    notes: '',
    color: '#3CCB7F'
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
    notes: '',
    billImage: null,
    billImageUrl: ''
  });

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [expensesRes, summaryRes, goalsRes] = await Promise.all([
        axios.get(buildApiUrl('/api/finance/expenses'), {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(buildApiUrl('/api/finance/summary'), {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(buildApiUrl('/api/finance/goals'), {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setExpenses(expensesRes.data);
      setSummary(summaryRes.data);
      setExpenseGoals(goalsRes.data);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  // Expense Goals Management Functions
  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingGoal) {
        // Update existing goal
        const response = await axios.put(
          buildApiUrl(`/api/finance/goals/${editingGoal._id}`),
          newGoalForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setExpenseGoals(prev => 
          prev.map(goal => 
            goal._id === editingGoal._id ? response.data : goal
          )
        );
        
        // Update category goals
        setCategoryGoals(prev => ({
          ...prev,
          [response.data.category]: response.data.amount
        }));
        
        setEditingGoal(null);
      } else {
        // Check if goal already exists for this category
        const existingGoal = expenseGoals.find(goal => goal.category === newGoalForm.category);
        if (existingGoal) {
          toast.error('A goal already exists for this category. Please edit the existing goal instead.');
          return;
        }
        
        // Create new goal
        const response = await axios.post(
          buildApiUrl('/api/finance/goals'),
          newGoalForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setExpenseGoals(prev => [...prev, response.data]);
        
        // Update category goals
        setCategoryGoals(prev => ({
          ...prev,
          [response.data.category]: response.data.amount
        }));
      }
      
      // Reset form
      setNewGoalForm({
        category: '',
        amount: '',
        period: 'monthly',
        notes: '',
        color: '#3CCB7F'
      });
      setShowAddGoalForm(false);
      
      toast.success(editingGoal ? 'Goal updated successfully!' : 'Goal added successfully!');
    } catch (error) {
      console.error('Error managing expense goal:', error);
      toast.error(error.response?.data?.message || 'Error managing expense goal');
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setNewGoalForm({
      category: goal.category,
      amount: goal.amount.toString(),
      period: goal.period,
      notes: goal.notes || '',
      color: goal.color
    });
    setShowAddGoalForm(true);
  };

  const handleDeleteGoal = async (goalId) => {
    const goalToDelete = expenseGoals.find(goal => goal._id === goalId);
    if (!goalToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        buildApiUrl(`/api/finance/goals/${goalId}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove from expense goals
      setExpenseGoals(prev => prev.filter(goal => goal._id !== goalId));
      
      // Remove from category goals
      setCategoryGoals(prev => {
        const updated = { ...prev };
        delete updated[goalToDelete.category];
        return updated;
      });
      
      toast.success(`${goalToDelete.category} goal deleted successfully!`);
    } catch (error) {
      console.error('Error deleting expense goal:', error);
      toast.error('Error deleting expense goal');
    }
  };

  const resetGoalForm = () => {
    setNewGoalForm({
      category: '',
      amount: '',
      period: 'monthly',
      notes: '',
      color: '#3CCB7F'
    });
    setEditingGoal(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const endpoint = buildApiUrl('/api/finance/expenses');
      
      // Prepare the data to send
      const expenseData = {
        ...formData,
        billImage: formData.billImage ? {
          filename: formData.billImage.name,
          url: formData.billImageUrl,
          data: formData.billImageUrl // Send base64 data
        } : null
      };
      
      // Remove the file object as it can't be serialized
      delete expenseData.billImage;
      
      if (editingItem) {
        await axios.put(`${endpoint}/${editingItem._id}`, expenseData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(endpoint, expenseData, {
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
        notes: '',
        billImage: null,
        billImageUrl: ''
      });
      
      fetchFinancialData();
    } catch (error) {
      console.error('Error saving financial record:', error);
    }
  };

  const handleDelete = async (id, type) => {
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = buildApiUrl('/api/finance/expenses');
      
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
      notes: item.notes || '',
      billImage: null,
      billImageUrl: item.billImage?.url || item.billImageUrl || ''
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

  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [showPantryUpdateDialog, setShowPantryUpdateDialog] = useState({
    show: false,
    items: [],
    vendor: '',
    date: ''
  });
  const [selectedPantryItems, setSelectedPantryItems] = useState([]);

  const handleBillImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData(prev => ({
            ...prev,
            billImage: file,
            billImageUrl: event.target.result
          }));
          // Automatically analyze the image for expense details
          analyzeBillImage(file);
        };
        reader.readAsDataURL(file);
      } else {
        // Invalid file type - could show a toast notification instead
        console.log('Invalid file type selected');
      }
    }
  };

  const analyzeBillImage = async (file) => {
    if (!file) return;
    
    console.log('🔍 Starting bill image analysis for file:', file.name, file.size);
    setIsAnalyzingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const token = localStorage.getItem('token');
      const apiUrl = buildApiUrl('/api/finance/analyze-bill');
      console.log('🔍 Sending request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      console.log('🔍 Response status:', response.status, response.ok);
      console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const result = await response.json();
        console.log('🔍 Bill analysis result:', result);
        console.log('🔍 Result type:', typeof result);
        console.log('🔍 Result keys:', Object.keys(result));
        
        // Update form with extracted information
        if (result.amount) {
          console.log('🔍 Updating form with extracted data:', result);
          
          // Force a state update to ensure the form re-renders
          const newFormData = {
            ...formData,
            amount: result.amount,
            description: result.description || formData.description,
            vendor: result.vendor || formData.vendor,
            category: result.category || formData.category,
            date: result.date || formData.date
          };
          
          console.log('🔍 Current form data before update:', formData);
          console.log('🔍 New form data to set:', newFormData);
          
          console.log('🔍 About to update form data from:', formData, 'to:', newFormData);
          setFormData(newFormData);
          
          // Force a re-render by updating a different state
          setTimeout(() => {
            console.log('🔍 Form data after update:', newFormData);
            console.log('🔍 Current form state should be:', newFormData);
          }, 100);
          
          // Show success notification
          const extractedFields = [];
          if (result.amount) extractedFields.push(`Amount: ₹${result.amount}`);
          if (result.description) extractedFields.push(`Description: ${result.description}`);
          if (result.vendor) extractedFields.push(`Vendor: ${result.vendor}`);
          if (result.category) extractedFields.push(`Category: ${result.category}`);
          
          console.log('✅ OCR Analysis Complete:', extractedFields.join(', '));
          
          // Show success indicator
          setOcrSuccess(true);
          setTimeout(() => setOcrSuccess(false), 3000);
          
          // Check if this is a food purchase with pantry items
          if (result.category === 'food' && result.description) {
            // Extract pantry items from description
            const pantryItems = extractPantryItems(result.description);
            if (pantryItems.length > 0) {
              setShowPantryUpdateDialog({
                show: true,
                items: pantryItems,
                vendor: result.vendor,
                date: result.date
              });
              // Initialize all items as selected
              setSelectedPantryItems(pantryItems);
            }
          }
        }
        
        if (result.error) {
          console.warn('OCR analysis warning:', result.error);
        }
        
        if (result.warning) {
          console.warn('OCR analysis warning:', result.warning);
        }
      } else {
        console.error('Failed to analyze bill image');
      }
    } catch (error) {
      console.error('Error analyzing bill image:', error);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const removeBillImage = () => {
    setFormData(prev => ({
      ...prev,
      billImage: null,
      billImageUrl: ''
    }));
  };

  const extractPantryItems = (description) => {
    // Enhanced food item detection with brand names and common items
    const pantryKeywords = [
      'milk', 'bread', 'eggs', 'rice', 'pasta', 'oil', 'sugar', 'salt', 'flour',
      'cereal', 'beans', 'lentils', 'spices', 'herbs', 'sauce', 'jam', 'honey',
      'nuts', 'dried fruits', 'canned goods', 'beverages', 'snacks', 'chocolate',
      'tea', 'coffee', 'juice', 'yogurt', 'cheese', 'butter', 'meat', 'fish',
      'vegetables', 'fruits', 'onions', 'potatoes', 'tomatoes', 'carrots',
      'taaza', 'novel', 'naphthale', 'keventer', 'chicke', 'idly', 'dosa', 'bat'
    ];
    
    // Split by commas and clean up
    const items = description.split(',').map(item => item.trim());
    const foundItems = [];
    
    items.forEach(item => {
      // Clean the item name
      const cleanItem = item.replace(/[^a-zA-Z\s]/g, ' ').trim();
      const words = cleanItem.split(/\s+/);
      
      words.forEach(word => {
        const cleanWord = word.toLowerCase();
        if (cleanWord.length > 2 && pantryKeywords.some(keyword => 
          cleanWord.includes(keyword) || keyword.includes(cleanWord)
        )) {
          // Capitalize first letter and add to found items
          const capitalizedWord = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1);
          if (!foundItems.includes(capitalizedWord)) {
            foundItems.push(capitalizedWord);
          }
        }
      });
      
      // Also check if the entire item contains food keywords
      if (cleanItem.length > 3) {
        const hasFoodKeyword = pantryKeywords.some(keyword => 
          cleanItem.toLowerCase().includes(keyword)
        );
        if (hasFoodKeyword && !foundItems.includes(cleanItem)) {
          foundItems.push(cleanItem);
        }
      }
    });
    
    // Remove duplicates and return unique items
    return [...new Set(foundItems)];
  };

  const handlePantryUpdate = async () => {
    try {
      console.log('🔍 Starting pantry update...');
      console.log('🔍 Selected items:', selectedPantryItems);
      console.log('🔍 Dialog data:', showPantryUpdateDialog);
      
      const token = localStorage.getItem('token');
      console.log('🔍 Token exists:', !!token);
      
      const pantryData = {
        items: selectedPantryItems.map(item => ({
          name: item,
          quantity: 1,
          unit: 'piece',
          category: 'food',
          purchaseDate: showPantryUpdateDialog.date,
          vendor: showPantryUpdateDialog.vendor,
          expiryDate: null,
          notes: `Added from expense receipt`
        }))
      };

      console.log('🔍 Updating pantry with items:', pantryData);
      console.log('🔍 API URL:', buildApiUrl('/api/pantry/add-multiple'));
      
      // Add items to pantry
      const response = await fetch(buildApiUrl('/api/pantry/add-multiple'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pantryData)
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Pantry updated successfully:', result);
        // Close the dialog
        setShowPantryUpdateDialog({ show: false, items: [], vendor: '', date: '' });
        setSelectedPantryItems([]);
        // Show success message
        setOcrSuccess(true);
        setTimeout(() => setOcrSuccess(false), 3000);
      } else {
        const errorText = await response.text();
        console.error('Failed to update pantry:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error updating pantry:', error);
    }
  };

  const togglePantryItem = (item) => {
    setSelectedPantryItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const selectAllPantryItems = () => {
    setSelectedPantryItems(showPantryUpdateDialog.items);
  };

  const deselectAllPantryItems = () => {
    setSelectedPantryItems([]);
  };

  const closePantryDialog = () => {
    console.log('🔍 Closing pantry dialog');
    setShowPantryUpdateDialog({ show: false, items: [], vendor: '', date: '' });
    setSelectedPantryItems([]);
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
      className="relative w-full max-w-full overflow-x-auto p-4 lg:p-0"
    >
      {/* Header - Mission Card */}
      <Card 
        variant="elevated" 
        className="mb-6"
        title="FINANCIAL MISSION"
        subtitle="Track expenses, manage budgets, and achieve financial goals"
        icon={<DollarSign className="h-5 w-5 text-[#1E49C9]" />}
      >
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Tabs */}
            <div className="flex space-x-1 bg-[rgba(0,0,0,0.2)] p-1 rounded-lg w-fit border border-[rgba(255,255,255,0.1)] mx-auto lg:mx-0">
              {['overview', 'expenses', 'subscriptions'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 font-jakarta tracking-wider ${
                    activeTab === tab
                      ? 'bg-[#1E49C9] text-white shadow-lg'
                      : 'text-text-secondary hover:text-text-primary hover:bg-[rgba(30,73,201,0.1)]'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center lg:justify-end">
            <button
              onClick={() => setShowAddForm(true)}
              className={componentStyles.button.primary + " flex items-center gap-2"}
            >
              <Plus size={16} />
              ADD RECORD
            </button>
          </div>
        </div>
      </Card>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>

          {/* Monthly Expense Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Current Month */}
            <Card 
              variant="base"
              title="CURRENT MONTH"
              subtitle={new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              icon={<TrendingUp className="h-5 w-5 text-[#1E49C9]" />}
            >
              <div className="text-center">
                <p className="text-3xl font-bold text-[#1E49C9] font-mono">
                  {formatCurrency(summary.currentMonthExpenses || 0)}
                </p>
              </div>
            </Card>
            
            {/* Previous Month */}
            <Card 
              variant="base"
              title="PREVIOUS MONTH"
              subtitle={new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              icon={<TrendingDown className="h-5 w-5 text-[#1E49C9]" />}
            >
              <div className="text-center">
                <p className="text-3xl font-bold text-[#1E49C9] font-mono">
                  {formatCurrency(summary.previousMonthExpenses || 0)}
                </p>
              </div>
            </Card>
            
            {/* Monthly Average */}
            <Card 
              variant="base"
              title="MONTHLY AVERAGE"
              subtitle="Last 6 months"
              icon={<DollarSign className="h-5 w-5 text-[#1E49C9]" />}
            >
              <div className="text-center">
                <p className="text-3xl font-bold text-[#1E49C9] font-mono">
                  {formatCurrency(summary.monthlyAverage || 0)}
                </p>
              </div>
            </Card>
          </div>

          {/* Monthly Trend Chart */}
          <Card 
            variant="base" 
            className="mb-6"
            title="MONTHLY TREND"
            subtitle="Track your spending patterns over time"
            icon={<TrendingUp className="h-5 w-5 text-[#1E49C9]" />}
          >
            <div className="flex items-end justify-between h-20 space-x-2 min-w-max">
              {Array.from({ length: 6 }, (_, i) => {
                const month = new Date(new Date().getFullYear(), new Date().getMonth() - (5 - i), 1);
                const monthKey = month.toISOString().slice(0, 7); // YYYY-MM format
                
                // Generate sample data for demonstration since monthlyExpenses might not exist
                const monthExpense = summary.monthlyExpenses?.[monthKey] || Math.floor(Math.random() * 1000) + 100;
                const maxExpense = Math.max(...Object.values(summary.monthlyExpenses || { 1: 1000, 2: 800, 3: 1200, 4: 900, 5: 1100, 6: 950 }), 1);
                const height = maxExpense > 0 ? (monthExpense / maxExpense) * 100 : 0;
                
                return (
                  <div key={monthKey} className="flex flex-col items-center group">
                    <div 
                      className="w-4 bg-[#1E49C9] rounded-t-md transition-all duration-300 hover:bg-[#1E49C9]/80 group-hover:scale-105"
                      style={{ height: `${height}%` }}
                      title={`${month.toLocaleDateString('en-US', { month: 'short' })}: ${formatCurrency(monthExpense)}`}
                    ></div>
                    <p className="text-xs text-text-secondary mt-2 font-mono">
                      {month.toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Category Goals vs Expenses */}
          <Card 
            variant="base" 
            className="mb-6"
            title="CATEGORY GOALS VS EXPENSES"
            subtitle="Monitor spending against your budget goals"
            icon={<Target className="h-5 w-5 text-[#1E49C9]" />}
          >
            <div className="flex items-center justify-between mb-6">
              <div></div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setShowAddGoalForm(true)}
                  className={componentStyles.button.secondary + " text-sm"}
                >
                  ADD GOAL
                </button>
                <button 
                  onClick={() => setShowCategoryGoalsForm(true)}
                  className={componentStyles.button.outline + " text-sm"}
                >
                  SET GOALS
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {getCategoryGoalsWithProgress().map((category) => {
                const existingGoal = expenseGoals.find(goal => goal.category === category.name);
                const categoryExpenses = expenses.filter(expense => expense.category === category.name);
                const spendCount = categoryExpenses.length;
                
                // Get category color
                const getCategoryColor = (categoryName) => {
                  const colors = {
                    food: '#10B981', // green-500
                    transportation: '#3B82F6', // blue-500
                    shopping: '#8B5CF6', // purple-500
                    entertainment: '#EC4899', // pink-500
                    healthcare: '#EF4444', // red-500
                    utilities: '#F59E0B', // yellow-500
                    housing: '#6366F1', // indigo-500
                    travel: '#06B6D4', // cyan-500
                    education: '#F97316', // orange-500
                    other: '#6B7280' // gray-500
                  };
                  return colors[categoryName] || '#6B7280';
                };

                return (
                  <div key={category.name} className="flex items-center justify-between p-4 bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-lg backdrop-blur-sm hover:border-[#1E49C9]/30 transition-all duration-300">
                    {/* Left side - Glass circle with colored dot, name, and spend count */}
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded-full flex items-center justify-center backdrop-blur-sm">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: getCategoryColor(category.name) }}
                        ></div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary font-jakarta tracking-wide capitalize">
                          {category.name}
                        </h3>
                        <p className="text-sm text-text-secondary font-jakarta">
                          {spendCount} Spend{spendCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    {/* Right side - Amount and budget status */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#1E49C9] font-mono">
                        {formatCurrency(category.spent)}
                      </p>
                      {existingGoal ? (
                        <p className="text-sm text-text-secondary font-jakarta">
                          of {formatCurrency(category.goal)}
                        </p>
                      ) : (
                        <button
                          onClick={() => {
                            setNewGoalForm({
                              ...newGoalForm,
                              category: category.name
                            });
                            setShowAddGoalForm(true);
                          }}
                          className="text-sm text-[#1E49C9] hover:text-[#1E49C9]/80 font-jakarta transition-colors"
                        >
                          Set budget →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>



        </>
      )}

      {activeTab === 'expenses' && (
        <Card 
          variant="base"
          title="ALL EXPENSES"
          subtitle="Complete list of your financial transactions"
          icon={<CreditCard className="h-5 w-5 text-[#1E49C9]" />}
        >
          <div className="overflow-y-auto max-h-[400px] relative min-w-max">
            <table className="w-full">
              <thead className="sticky top-0 bg-[rgba(0,0,0,0.3)] z-10 border-b border-[rgba(255,255,255,0.1)] backdrop-blur-sm">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-text-primary font-jakarta tracking-wider text-sm">DATE</th>
                  <th className="text-left py-3 px-4 font-medium text-text-primary font-jakarta tracking-wider text-sm">DESCRIPTION</th>
                  <th className="text-left py-3 px-4 font-medium text-text-primary font-jakarta tracking-wider text-sm">CATEGORY</th>
                  <th className="text-left py-3 px-4 font-medium text-text-primary font-jakarta tracking-wider text-sm">VENDOR</th>
                  <th className="text-left py-3 px-4 font-medium text-text-primary font-jakarta tracking-wider text-sm">PAYMENT</th>
                  <th className="text-center py-3 px-4 font-medium text-text-primary font-jakarta tracking-wider text-sm">BILL IMAGE</th>
                  <th className="text-right py-3 px-4 font-medium text-text-primary font-jakarta tracking-wider text-sm">AMOUNT</th>
                  <th className="text-center py-3 px-4 font-medium text-text-primary font-jakarta tracking-wider text-sm">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <tr key={expense._id} className="border-b border-[rgba(255,255,255,0.1)] hover:bg-[rgba(30,73,201,0.05)] transition-colors">
                      <td className="py-3 px-4 text-sm text-text-secondary font-jakarta">{formatDate(expense.date)}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-text-primary font-jakarta tracking-wide text-sm">{expense.description}</p>
                        {expense.notes && <p className="text-xs text-text-secondary font-jakarta mt-1">{expense.notes}</p>}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium font-jakarta tracking-wider bg-[rgba(30,73,201,0.2)] text-[#1E49C9] border border-[#1E49C9]/30">
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-text-secondary font-jakarta">{expense.vendor}</td>
                      <td className="py-3 px-4 text-sm text-text-secondary font-jakarta">{expense.paymentMethod}</td>
                      <td className="py-3 px-4 text-center">
                        {expense.billImage?.url || expense.billImageUrl ? (
                          <button
                            onClick={() => window.open(expense.billImage?.url || expense.billImageUrl, '_blank')}
                            className="inline-flex items-center space-x-1 text-[#1E49C9] hover:text-[#1E49C9]/80 transition-colors"
                            title="View bill image"
                          >
                            <Image className="h-4 w-4" />
                            <span className="text-xs font-jakarta">View</span>
                          </button>
                        ) : (
                          <span className="text-xs text-text-secondary font-jakarta">No image</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-[#1E49C9] font-mono text-sm">{formatCurrency(expense.amount)}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="text-[#1E49C9] hover:text-[#1E49C9]/80 transition-colors p-2 rounded-lg hover:bg-[rgba(30,73,201,0.1)]"
                            title="Edit expense"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(expense._id, 'expense')}
                            className="text-red-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                            title="Delete expense"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-12 text-center">
                      <div className="text-text-secondary font-jakarta">
                        <CreditCard className="h-12 w-12 text-text-secondary mx-auto mb-4" />
                        <p className="text-lg mb-2 font-semibold">No expenses yet</p>
                        <p className="text-sm text-text-secondary mb-4">Add your first expense to get started</p>
                        <button
                          onClick={() => setShowAddForm(true)}
                          className={componentStyles.button.primary}
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
        </Card>
      )}

      {activeTab === 'subscriptions' && (
        <Card 
          variant="base"
          title="ACTIVE SUBSCRIPTIONS"
          subtitle="Manage your recurring payments and subscriptions"
          icon={<Target className="h-5 w-5 text-[#1E49C9]" />}
        >
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-text-secondary mx-auto mb-4" />
            <p className="text-lg font-semibold text-text-primary font-jakarta mb-2">No subscriptions yet</p>
            <p className="text-sm text-text-secondary font-jakarta mb-6">Track your recurring payments and manage subscriptions</p>
            <button
              onClick={() => setShowAddForm(true)}
              className={componentStyles.button.primary}
            >
              ADD SUBSCRIPTION
            </button>
          </div>
        </Card>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
          <motion.div 
            className="bg-[rgba(0,0,0,0.8)] border border-[rgba(255,255,255,0.2)] rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl backdrop-blur-[32px]"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-text-primary font-jakarta tracking-wide">
                {editingItem ? 'EDIT EXPENSE' : 'ADD NEW EXPENSE'}
              </h3>
              <button
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
                    notes: '',
                    billImage: null,
                    billImageUrl: ''
                  });
                }}
                className="text-text-secondary hover:text-text-primary transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {ocrSuccess && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                <p className="text-sm text-green-400 font-jakarta">
                  ✨ OCR Analysis Complete! Form fields have been auto-populated.
                </p>
                <p className="text-xs text-green-300 font-jakarta mt-1">
                  Amount: ₹{formData.amount} | Vendor: {formData.vendor || 'N/A'} | Category: {formData.category || 'N/A'}
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-jakarta tracking-wider">
                  AMOUNT {isAnalyzingImage && <span className="text-[#1E49C9]">(Analyzing...)</span>}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                  className={componentStyles.input.base + ` ${
                    isAnalyzingImage ? 'border-[#1E49C9]' : ''
                  }`}
                  placeholder="0.00"
                  disabled={isAnalyzingImage}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-jakarta tracking-wider">CATEGORY</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className={componentStyles.input.base}
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
                <label className="block text-sm font-medium text-text-secondary mb-2 font-jakarta tracking-wider">VENDOR</label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                  className={componentStyles.input.base}
                  placeholder="Where did you spend?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-jakarta tracking-wider">PAYMENT METHOD</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  className={componentStyles.input.base}
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
                <label className="block text-sm font-medium text-text-secondary mb-2 font-jakarta tracking-wider">DESCRIPTION</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className={componentStyles.input.base}
                  placeholder="What was this for?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-jakarta tracking-wider">DATE</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className={componentStyles.input.base}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-jakarta tracking-wider">NOTES</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className={componentStyles.input.base}
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>

              {/* Bill Image Upload */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2 font-jakarta tracking-wider">BILL IMAGE</label>
                <div className="space-y-3">
                  {formData.billImageUrl ? (
                    <div className="relative">
                      <img 
                        src={formData.billImageUrl} 
                        alt="Bill preview" 
                        className="w-full h-32 object-cover rounded-lg border border-[rgba(255,255,255,0.2)]"
                      />
                      <button
                        type="button"
                        onClick={removeBillImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        title="Remove image"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      {isAnalyzingImage && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E49C9] mx-auto mb-2"></div>
                            <p className="text-xs text-white font-jakarta">Analyzing bill...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-[rgba(255,255,255,0.2)] rounded-lg p-6 text-center hover:border-[#1E49C9] transition-colors">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBillImageUpload}
                          className="hidden"
                        />
                        <div className="space-y-3">
                          <Upload className="h-8 w-8 text-text-secondary mx-auto" />
                          <p className="text-sm text-text-secondary font-jakarta">
                            Click to upload bill image
                          </p>
                          <p className="text-xs text-text-secondary font-jakarta">
                            JPG, PNG, GIF up to 5MB
                          </p>
                          <p className="text-xs text-[#1E49C9] font-jakarta">
                            ✨ Auto-extract expense details
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
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
                      notes: '',
                      billImage: null,
                      billImageUrl: ''
                    });
                  }}
                  className={componentStyles.button.outline + " flex-1"}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className={componentStyles.button.primary + " flex-1"}
                >
                  {editingItem ? 'UPDATE' : 'ADD'} EXPENSE
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Pantry Update Dialog */}
      {showPantryUpdateDialog.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4" onClick={closePantryDialog}>
          <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 w-full max-w-md shadow-2xl relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }} onClick={(e) => e.stopPropagation()}>
            {/* Film grain overlay */}
            <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
            
            {/* Reason Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3CCB7F] to-[#FFD200]"></div>
            
            <h3 className="text-lg font-semibold text-[#E8EEF2] mb-4 font-oswald tracking-wide">
              🛒 Update Pantry Inventory?
            </h3>
            
            <div className="space-y-4">
              <p className="text-sm text-[#C9D1D9] font-inter">
                We detected food items in your receipt. Would you like to add them to your pantry inventory?
              </p>
              
              {selectedPantryItems.length === 0 && (
                <div className="bg-[#FFD200]/20 border border-[#FFD200]/50 text-[#FFD200] rounded-md p-2 text-xs font-inter">
                  ⚠️ Please select at least one item to add to your pantry
                </div>
              )}
              
              <div className="bg-[#0A0C0F] border border-[#2A313A] rounded-md p-3">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-[#E8EEF2] font-oswald tracking-wide">
                    Detected Items ({selectedPantryItems.length}/{showPantryUpdateDialog.items.length})
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllPantryItems}
                      className="px-2 py-1 text-xs bg-[#3CCB7F]/20 border border-[#3CCB7F]/50 text-[#3CCB7F] rounded hover:bg-[#3CCB7F]/30 transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={deselectAllPantryItems}
                      className="px-2 py-1 text-xs bg-[#2A313A] border border-[#2A313A] text-[#C9D1D9] rounded hover:bg-[#2A313A]/80 transition-colors"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {showPantryUpdateDialog.items.map((item, index) => (
                    <label key={index} className="flex items-center gap-3 cursor-pointer hover:bg-[#2A313A]/50 p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedPantryItems.includes(item)}
                        onChange={() => togglePantryItem(item)}
                        className="w-4 h-4 text-[#3CCB7F] bg-[#0A0C0F] border-[#2A313A] rounded focus:ring-[#3CCB7F] focus:ring-2"
                      />
                      <span className={`text-sm font-inter ${selectedPantryItems.includes(item) ? 'text-[#E8EEF2]' : 'text-[#8B949E]'}`}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={closePantryDialog}
                  className="flex-1 px-4 py-2 border-2 border-[#2A313A] text-[#C9D1D9] rounded-md hover:bg-[#2A313A] font-oswald tracking-wide transition-colors text-sm"
                >
                  Skip
                </button>
                <button
                  onClick={() => {
                    console.log('🔍 Update Pantry button clicked!');
                    console.log('🔍 Selected items:', selectedPantryItems);
                    handlePantryUpdate();
                  }}
                  disabled={selectedPantryItems.length === 0}
                  className={`flex-1 px-4 py-2 rounded-md font-oswald tracking-wide transition-colors text-sm ${
                    selectedPantryItems.length === 0
                      ? 'bg-[#2A313A] text-[#8B949E] cursor-not-allowed'
                      : 'bg-[#3CCB7F] text-white hover:bg-[#3CCB7F]/80'
                  }`}
                >
                  Update Pantry ({selectedPantryItems.length})
                </button>
                

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Goal Form Modal */}
      {showAddGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
          <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
            {/* Film grain overlay */}
            <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
            
            {/* Reason Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3CCB7F] to-[#FFD200]"></div>
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-[#E8EEF2] font-oswald tracking-wide">
                {editingGoal ? 'EDIT EXPENSE GOAL' : 'ADD EXPENSE GOAL'}
              </h3>
              <button
                onClick={() => {
                  setShowAddGoalForm(false);
                  resetGoalForm();
                }}
                className="text-[#C9D1D9] hover:text-[#E8EEF2] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] mb-1 font-inter">Category *</label>
                <select
                  value={newGoalForm.category}
                  onChange={(e) => setNewGoalForm({...newGoalForm, category: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                  required
                >
                  <option value="" className="bg-[#0A0C0F] text-[#E8EEF2]">Select a category</option>
                  <option value="food" className="bg-[#0A0C0F] text-[#E8EEF2]">Food</option>
                  <option value="transportation" className="bg-[#0A0C0F] text-[#E8EEF2]">Transportation</option>
                  <option value="housing" className="bg-[#0A0C0F] text-[#E8EEF2]">Housing</option>
                  <option value="utilities" className="bg-[#0A0C0F] text-[#E8EEF2]">Utilities</option>
                  <option value="healthcare" className="bg-[#0A0C0F] text-[#E8EEF2]">Healthcare</option>
                  <option value="entertainment" className="bg-[#0A0C0F] text-[#E8EEF2]">Entertainment</option>
                  <option value="shopping" className="bg-[#0A0C0F] text-[#E8EEF2]">Shopping</option>
                  <option value="education" className="bg-[#0A0C0F] text-[#E8EEF2]">Education</option>
                  <option value="travel" className="bg-[#0A0C0F] text-[#E8EEF2]">Travel</option>
                  <option value="insurance" className="bg-[#0A0C0F] text-[#E8EEF2]">Insurance</option>
                  <option value="taxes" className="bg-[#0A0C0F] text-[#E8EEF2]">Taxes</option>
                  <option value="debt" className="bg-[#0A0C0F] text-[#E8EEF2]">Debt</option>
                  <option value="other" className="bg-[#0A0C0F] text-[#E8EEF2]">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] mb-1 font-inter">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newGoalForm.amount}
                  onChange={(e) => setNewGoalForm({...newGoalForm, amount: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] mb-1 font-inter">Period</label>
                <select
                  value={newGoalForm.period}
                  onChange={(e) => setNewGoalForm({...newGoalForm, period: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                >
                  <option value="monthly" className="bg-[#0A0C0F] text-[#E8EEF2]">Monthly</option>
                  <option value="weekly" className="bg-[#0A0C0F] text-[#E8EEF2]">Weekly</option>
                  <option value="yearly" className="bg-[#0A0C0F] text-[#E8EEF2]">Yearly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] mb-1 font-inter">Color</label>
                <input
                  type="color"
                  value={newGoalForm.color}
                  onChange={(e) => setNewGoalForm({...newGoalForm, color: e.target.value})}
                  className="w-full h-10 border border-[#2A313A] rounded-lg bg-[#0A0C0F]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] mb-1 font-inter">Notes</label>
                <textarea
                  value={newGoalForm.notes}
                  onChange={(e) => setNewGoalForm({...newGoalForm, notes: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                  rows="3"
                  placeholder="Optional notes about this goal..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#3CCB7F] text-[#0A0C0F] py-2 px-4 rounded-lg hover:bg-[#2FB86B] transition-colors font-oswald tracking-wide"
                >
                  {editingGoal ? 'Update Goal' : 'Add Goal'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddGoalForm(false);
                    resetGoalForm();
                  }}
                  className="flex-1 bg-[#2A313A] text-[#E8EEF2] py-2 px-4 rounded-lg hover:bg-[#3A414A] transition-colors font-oswald tracking-wide"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Goal Form Modal */}
      {showAddGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
          <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative overflow-hidden" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
            {/* Film grain overlay */}
            <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
            
            {/* Reason Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3CCB7F] to-[#FFD200]"></div>
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-[#E8EEF2] font-oswald tracking-wide">
                {editingGoal ? 'EDIT EXPENSE GOAL' : 'ADD EXPENSE GOAL'}
              </h3>
              <button
                onClick={() => {
                  setShowAddGoalForm(false);
                  resetGoalForm();
                }}
                className="text-[#C9D1D9] hover:text-[#E8EEF2] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] mb-1 font-inter">Category *</label>
                <select
                  value={newGoalForm.category}
                  onChange={(e) => setNewGoalForm({...newGoalForm, category: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                  required
                >
                  <option value="" className="bg-[#0A0C0F] text-[#E8EEF2]">Select a category</option>
                  <option value="food" className="bg-[#0A0C0F] text-[#E8EEF2]">Food</option>
                  <option value="transportation" className="bg-[#0A0C0F] text-[#E8EEF2]">Transportation</option>
                  <option value="housing" className="bg-[#0A0C0F] text-[#E8EEF2]">Housing</option>
                  <option value="utilities" className="bg-[#0A0C0F] text-[#E8EEF2]">Utilities</option>
                  <option value="healthcare" className="bg-[#0A0C0F] text-[#E8EEF2]">Healthcare</option>
                  <option value="entertainment" className="bg-[#0A0C0F] text-[#E8EEF2]">Entertainment</option>
                  <option value="shopping" className="bg-[#0A0C0F] text-[#E8EEF2]">Shopping</option>
                  <option value="education" className="bg-[#0A0C0F] text-[#E8EEF2]">Education</option>
                  <option value="travel" className="bg-[#0A0C0F] text-[#E8EEF2]">Travel</option>
                  <option value="insurance" className="bg-[#0A0C0F] text-[#E8EEF2]">Insurance</option>
                  <option value="taxes" className="bg-[#0A0C0F] text-[#E8EEF2]">Taxes</option>
                  <option value="debt" className="bg-[#0A0C0F] text-[#E8EEF2]">Debt</option>
                  <option value="other" className="bg-[#0A0C0F] text-[#E8EEF2]">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] mb-1 font-inter">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newGoalForm.amount}
                  onChange={(e) => setNewGoalForm({...newGoalForm, amount: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] mb-1 font-inter">Period</label>
                <select
                  value={newGoalForm.period}
                  onChange={(e) => setNewGoalForm({...newGoalForm, period: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                >
                  <option value="monthly" className="bg-[#0A0C0F] text-[#E8EEF2]">Monthly</option>
                  <option value="weekly" className="bg-[#0A0C0F] text-[#E8EEF2]">Weekly</option>
                  <option value="yearly" className="bg-[#0A0C0F] text-[#E8EEF2]">Yearly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] mb-1 font-inter">Color</label>
                <input
                  type="color"
                  value={newGoalForm.color}
                  onChange={(e) => setNewGoalForm({...newGoalForm, color: e.target.value})}
                  className="w-full h-10 border border-[#2A313A] rounded-lg bg-[#0A0C0F]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#C9D1D9] mb-1 font-inter">Notes</label>
                <textarea
                  value={newGoalForm.notes}
                  onChange={(e) => setNewGoalForm({...newGoalForm, notes: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0A0C0F] border border-[#2A313A] rounded-lg text-[#E8EEF2] focus:border-[#FFD200] focus:outline-none"
                  rows="3"
                  placeholder="Optional notes about this goal..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#3CCB7F] text-[#0A0C0F] py-2 px-4 rounded-lg hover:bg-[#2FB86B] transition-colors font-oswald tracking-wide"
                >
                  {editingGoal ? 'Update Goal' : 'Add Goal'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddGoalForm(false);
                    resetGoalForm();
                  }}
                  className="flex-1 bg-[#2A313A] text-[#E8EEF2] py-2 px-4 rounded-lg hover:bg-[#3A414A] transition-colors font-oswald tracking-wide"
                >
                  Cancel
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
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    await axios.put(
                      buildApiUrl('/api/finance/goals/bulk'),
                      { categoryGoals },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    
                    // Refresh the data to get updated goals
                    await fetchFinancialData();
                    setShowCategoryGoalsForm(false);
                    toast.success('Goals saved successfully!');
                  } catch (error) {
                    console.error('Error saving goals:', error);
                    toast.error('Error saving goals');
                  }
                }}
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

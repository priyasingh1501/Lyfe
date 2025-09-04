import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { buildApiUrl } from '../config';
import { 
  Plus, 
  Edit3,
  Trash2,
  Upload,
  Image
} from 'lucide-react';
import axios from 'axios';

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
      <div className="bg-gray-900 border-2 border-gray-600 rounded-lg p-4 lg:p-6 relative overflow-hidden mb-4 lg:mb-6" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
        {/* Film grain overlay */}
        <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
        
        {/* Reason Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-blue-500 to-green-500"></div>
        
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <h1 className="text-lg font-bold text-white font-oswald tracking-wide text-center lg:text-left">FINANCIAL MISSION</h1>
            
            {/* Tabs */}
            <div className="flex space-x-0.5 bg-gray-800 p-0.5 rounded-md w-fit border border-gray-600 mx-auto lg:mx-0">
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
          
          <div className="flex justify-center lg:justify-end">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-amber-500 text-white px-3 py-2 rounded hover:bg-amber-400 flex items-center gap-1 font-oswald tracking-wide transition-colors text-xs border border-amber-400 hover:shadow-lg hover:shadow-amber-500/20 min-h-[44px]"
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

          {/* Monthly Expense Analysis - Mission Card */}
          <div className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-4 lg:p-6 relative overflow-hidden mb-4 lg:mb-6" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
            {/* Film grain overlay */}
            <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
            
            {/* Reason Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD200] via-[#3EA6FF] to-[#3CCB7F]"></div>
            
            <h3 className="text-sm font-semibold text-[#E8EEF2] mb-3 font-oswald tracking-wide">MONTHLY EXPENSE ANALYSIS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                  
                  // Generate sample data for demonstration since monthlyExpenses might not exist
                  const monthExpense = summary.monthlyExpenses?.[monthKey] || Math.floor(Math.random() * 1000) + 100;
                  const maxExpense = Math.max(...Object.values(summary.monthlyExpenses || { 1: 1000, 2: 800, 3: 1200, 4: 900, 5: 1100, 6: 950 }), 1);
                  const height = maxExpense > 0 ? (monthExpense / maxExpense) * 100 : 0;
                  
                  return (
                    <div key={monthKey} className="flex flex-col items-center">
                      <div 
                        className="w-3 bg-[#3EA6FF] rounded-t-sm transition-all duration-300 hover:bg-[#FFD200]"
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
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowAddGoalForm(true)}
                  className="text-xs bg-[#3CCB7F] text-[#0A0C0F] px-2 py-1 rounded hover:bg-[#2FB86B] transition-colors font-oswald tracking-wide"
                >
                  ADD GOAL
                </button>
                <button 
                  onClick={() => setShowCategoryGoalsForm(true)}
                  className="text-xs bg-[#FFD200] text-[#0A0C0F] px-2 py-1 rounded hover:bg-[#FFD200]/90 transition-colors font-oswald tracking-wide"
                >
                  SET GOALS
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {getCategoryGoalsWithProgress().map((category) => {
                const existingGoal = expenseGoals.find(goal => goal.category === category.name);
                return (
                  <div key={category.name} className="p-4 bg-gradient-to-br from-[#0A0C0F] to-[#11151A] border-2 border-[#2A313A] rounded-xl group relative overflow-hidden shadow-lg hover:shadow-xl hover:border-[#3EA6FF]/30 transition-all duration-300">
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
                    
                    {/* Header with category name and indicator */}
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${category.percentage >= 100 ? 'bg-[#D64545]' : 'bg-[#3EA6FF]'} shadow-lg`}></div>
                        <span className="text-base font-semibold text-[#E8EEF2] font-oswald tracking-wide capitalize">{category.name}</span>
                      </div>
                      
                      {/* Action buttons - visible on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {existingGoal ? (
                          <button
                            onClick={() => handleEditGoal(existingGoal)}
                            className="p-2 bg-[#2A313A]/80 backdrop-blur-sm text-[#C9D1D9] rounded-lg hover:bg-[#3A414A] hover:text-[#E8EEF2] transition-all duration-200 shadow-lg"
                            title="Edit goal"
                          >
                            <Edit3 size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setNewGoalForm({
                                ...newGoalForm,
                                category: category.name
                              });
                              setShowAddGoalForm(true);
                            }}
                            className="p-2 bg-[#3CCB7F]/20 backdrop-blur-sm text-[#3CCB7F] rounded-lg hover:bg-[#3CCB7F] hover:text-[#0A0C0F] transition-all duration-200 shadow-lg"
                            title="Add goal for this category"
                          >
                            <Plus size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Amount display with better typography */}
                    <div className="text-center mb-4 relative z-10">
                      <div className="mb-2">
                        <p className="text-2xl font-bold text-[#FFD200] font-mono mb-1">
                          {formatCurrency(category.spent)}
                        </p>
                        <p className="text-sm text-[#C9D1D9] font-inter">
                          of {formatCurrency(category.goal)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Enhanced Circular Progress Indicator */}
                    <div className="flex justify-center mb-4 relative z-10">
                      <div className="relative w-20 h-20">
                        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                          {/* Background circle with subtle glow */}
                          <defs>
                            <filter id="glow">
                              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                              <feMerge> 
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                              </feMerge>
                            </filter>
                          </defs>
                          
                          {/* Background circle */}
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#2A313A"
                            strokeWidth="2.5"
                          />
                          {/* Progress circle with glow effect */}
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={category.percentage >= 100 ? '#D64545' : '#3EA6FF'}
                            strokeWidth="2.5"
                            strokeDasharray={`${Math.min(category.percentage, 100) * 1.01}, 100`}
                            strokeLinecap="round"
                            className="transition-all duration-500 ease-out"
                            filter="url(#glow)"
                          />
                        </svg>
                        {/* Percentage text in center */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-[#E8EEF2] font-mono">
                            {Math.min(category.percentage, 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Status and Remaining Amount */}
                    <div className="space-y-3 relative z-10">
                      {/* Status Badge */}
                      <div className="text-center">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold font-oswald tracking-wide shadow-lg ${
                          category.percentage >= 100 
                            ? 'bg-gradient-to-r from-[#D64545] to-[#B91C1C] text-white' 
                            : 'bg-gradient-to-r from-[#2A313A] to-[#3A414A] text-[#C9D1D9]'
                        }`}>
                          {category.percentage >= 100 
                            ? '🚨 OVER BUDGET' 
                            : '✅ ON TRACK'
                          }
                        </span>
                      </div>
                      
                      {/* Remaining Amount */}
                      {category.percentage < 100 && (
                        <div className="text-center">
                          <div className="bg-[#2A313A]/50 backdrop-blur-sm rounded-lg p-2 border border-[#3EA6FF]/20">
                            <p className="text-xs text-[#C9D1D9] font-inter mb-1">Remaining</p>
                            <p className="text-sm font-semibold text-[#3CCB7F] font-mono">
                              {formatCurrency(category.goal - category.spent)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
                  <th className="text-center py-2 px-3 font-medium text-[#E8EEF2] font-oswald tracking-wide text-sm">BILL IMAGE</th>
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
                      <td className="py-2 px-3 text-center">
                        {expense.billImage?.url || expense.billImageUrl ? (
                          <button
                            onClick={() => window.open(expense.billImage?.url || expense.billImageUrl, '_blank')}
                            className="inline-flex items-center space-x-1 text-[#3EA6FF] hover:text-[#3EA6FF]/80 transition-colors"
                            title="View bill image"
                          >
                            <Image className="h-4 w-4" />
                            <span className="text-xs">View</span>
                          </button>
                        ) : (
                          <span className="text-xs text-[#C9D1D9]">No image</span>
                        )}
                      </td>
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
                    <td colSpan="8" className="py-8 text-center">
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
            
            {ocrSuccess && (
              <div className="mb-3 p-2 bg-green-500/20 border border-green-500/50 rounded-md">
                <p className="text-sm text-green-400 font-inter">
                  ✨ OCR Analysis Complete! Form fields have been auto-populated.
                </p>
                <p className="text-xs text-green-300 font-inter mt-1">
                  Amount: ₹{formData.amount} | Vendor: {formData.vendor || 'N/A'} | Category: {formData.category || 'N/A'}
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-3">


              <div>
                <label className="block text-xs font-medium text-[#E8EEF2] mb-1 font-oswald tracking-wide">
                  AMOUNT {isAnalyzingImage && <span className="text-[#FFD200]">(Analyzing...)</span>}
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                  className={`w-full p-1.5 border-2 rounded-md focus:ring-2 focus:ring-[#FFD200] focus:border-[#FFD200] bg-[#0A0C0F] text-[#E8EEF2] placeholder-[#C9D1D9] font-inter text-sm ${
                    isAnalyzingImage ? 'border-[#FFD200]' : 'border-[#2A313A]'
                  }`}
                  placeholder="0.00"
                  disabled={isAnalyzingImage}
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

              {/* Bill Image Upload */}
              <div>
                <label className="block text-xs font-medium text-[#C9D1D9] mb-1 font-oswald tracking-wide">BILL IMAGE</label>
                <div className="space-y-2">
                  {formData.billImageUrl ? (
                    <div className="relative">
                      <img 
                        src={formData.billImageUrl} 
                        alt="Bill preview" 
                        className="w-full h-32 object-cover rounded-md border-2 border-[#2A313A]"
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
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFD200] mx-auto mb-2"></div>
                            <p className="text-xs text-white font-inter">Analyzing bill...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-[#2A313A] rounded-md p-4 text-center hover:border-[#FFD200] transition-colors">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBillImageUpload}
                          className="hidden"
                        />
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 text-[#C9D1D9] mx-auto" />
                          <p className="text-sm text-[#C9D1D9] font-inter">
                            Click to upload bill image
                          </p>
                          <p className="text-xs text-[#C9D1D9] placeholder-[#C9D1D9] font-inter">
                            JPG, PNG, GIF up to 5MB
                          </p>
                          <p className="text-xs text-[#FFD200] font-inter">
                            ✨ Auto-extract expense details
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                  
                  {/* Debug: Test OCR button */}
                  {formData.billImageUrl && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => analyzeBillImage(formData.billImage)}
                        className="w-full px-3 py-2 bg-[#3EA6FF] text-white rounded-md hover:bg-[#3EA6FF]/80 font-inter text-sm"
                        disabled={isAnalyzingImage}
                      >
                        🔍 Test OCR Analysis
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          console.log('🔍 Current form data:', formData);
                          console.log('🔍 Bill image:', formData.billImage);
                          console.log('🔍 Bill image URL:', formData.billImageUrl);
                        }}
                        className="w-full px-3 py-2 bg-[#FFD200] text-[#0A0C0F] rounded-md hover:bg-[#FFD200]/80 font-inter text-sm"
                      >
                        🐛 Debug Form Data
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const testData = {
                            amount: 999,
                            description: 'Test Description',
                            vendor: 'Test Vendor',
                            category: 'food',
                            date: '2025-08-24'
                          };
                          console.log('🔍 Testing form update with:', testData);
                          setFormData(prev => ({
                            ...prev,
                            ...testData
                          }));
                        }}
                        className="w-full px-3 py-2 bg-[#3CCB7F] text-white rounded-md hover:bg-[#3CCB7F]/80 font-inter text-sm"
                      >
                        🧪 Test Form Update
                      </button>
                    </div>
                  )}
                </div>
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
                      notes: '',
                      billImage: null,
                      billImageUrl: ''
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

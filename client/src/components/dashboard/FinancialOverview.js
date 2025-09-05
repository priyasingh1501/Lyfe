import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import axios from 'axios';

const FinancialOverview = () => {
  const { token } = useAuth();
  const [financialData, setFinancialData] = useState({
    summary: {},
    recentExpenses: [],
    goals: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const [summaryRes, expensesRes, goalsRes] = await Promise.all([
        axios.get(buildApiUrl('/api/finance/summary'), {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(buildApiUrl('/api/finance/expenses?limit=5'), {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(buildApiUrl('/api/finance/goals'), {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setFinancialData({
        summary: summaryRes.data,
        recentExpenses: expensesRes.data || [],
        goals: goalsRes.data || []
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBudgetAdherence = () => {
    const { totalExpenses = 0, monthlyBudget = 0 } = financialData.summary;
    if (monthlyBudget === 0) return 0;
    return Math.max(0, Math.min(100, ((monthlyBudget - totalExpenses) / monthlyBudget) * 100));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-4 lg:p-6 relative overflow-hidden"
        style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-[#2A313A] rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-[#2A313A] rounded"></div>
            <div className="h-4 bg-[#2A313A] rounded w-2/3"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  const budgetAdherence = calculateBudgetAdherence();
  const isOverBudget = budgetAdherence < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#11151A] border-2 border-[#2A313A] rounded-lg p-4 lg:p-6 relative overflow-hidden"
      style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
    >
      {/* Film grain overlay */}
      <div className="absolute inset-0 opacity-5 bg-noise-pattern pointer-events-none"></div>
      
      {/* Reason Strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3CCB7F] via-[#3EA6FF] to-[#FFD200]"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#3CCB7F] bg-opacity-20 rounded-lg">
            <DollarSign className="h-5 w-5 text-[#3CCB7F]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#E8EEF2] font-oswald tracking-wide">FINANCIAL OVERVIEW</h3>
            <p className="text-sm text-[#C9D1D9] font-inter">Budget & spending insights</p>
          </div>
        </div>
        <a 
          href="/finance" 
          className="text-sm text-[#FFD200] hover:text-[#FFD200]/80 font-medium flex items-center font-oswald tracking-wide"
        >
          VIEW DETAILS
        </a>
      </div>

      <div className="space-y-4 relative z-10">
        {/* Budget Adherence */}
        <div className="bg-[#0A0C0F] border border-[#2A313A] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#E8EEF2]">Budget Adherence</span>
            <div className="flex items-center space-x-2">
              {isOverBudget ? (
                <TrendingDown className="h-4 w-4 text-[#D64545]" />
              ) : (
                <TrendingUp className="h-4 w-4 text-[#3CCB7F]" />
              )}
              <span className={`text-lg font-bold ${isOverBudget ? 'text-[#D64545]' : 'text-[#3CCB7F]'}`}>
                {Math.abs(budgetAdherence).toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="w-full bg-[#2A313A] rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                isOverBudget ? 'bg-[#D64545]' : 'bg-[#3CCB7F]'
              }`}
              style={{ width: `${Math.min(100, Math.abs(budgetAdherence))}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-[#C9D1D9] mt-1">
            <span>Spent: {formatCurrency(financialData.summary.totalExpenses || 0)}</span>
            <span>Budget: {formatCurrency(financialData.summary.monthlyBudget || 0)}</span>
          </div>
        </div>

        {/* Recent Expenses */}
        {financialData.recentExpenses.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-[#E8EEF2] font-oswald tracking-wide flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-[#3EA6FF]" />
              Recent Expenses
            </h4>
            <div className="space-y-2">
              {financialData.recentExpenses.slice(0, 3).map((expense, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-[#0A0C0F] rounded border border-[#2A313A]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#3EA6FF] rounded-full"></div>
                    <span className="text-sm text-[#E8EEF2]">{expense.description || 'Expense'}</span>
                  </div>
                  <span className="text-sm font-medium text-[#FFD200]">
                    {formatCurrency(expense.amount || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Financial Goals */}
        {financialData.goals.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-[#E8EEF2] font-oswald tracking-wide flex items-center">
              <Target className="h-4 w-4 mr-2 text-[#FFD200]" />
              Active Goals
            </h4>
            <div className="space-y-2">
              {financialData.goals.slice(0, 2).map((goal, index) => (
                <div key={index} className="p-2 bg-[#0A0C0F] rounded border border-[#2A313A]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#E8EEF2]">{goal.category || 'Goal'}</span>
                    <span className="text-xs text-[#C9D1D9]">{goal.period || 'monthly'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#C9D1D9]">
                      {formatCurrency(goal.amount || 0)}
                    </span>
                    <div className="w-16 bg-[#2A313A] rounded-full h-1">
                      <div 
                        className="bg-[#FFD200] h-1 rounded-full transition-all duration-500"
                        style={{ width: '60%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {financialData.recentExpenses.length === 0 && financialData.goals.length === 0 && (
          <div className="text-center py-4">
            <DollarSign className="h-8 w-8 text-[#C9D1D9] mx-auto mb-2" />
            <p className="text-sm text-[#C9D1D9]">No financial data yet</p>
            <a 
              href="/finance" 
              className="text-xs text-[#FFD200] hover:text-[#FFD200]/80 font-oswald tracking-wide"
            >
              ADD EXPENSES
            </a>
          </div>
        )}
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-6 h-6 bg-[#3CCB7F]"></div>
      <div className="absolute bottom-0 left-0 w-6 h-6 bg-[#3EA6FF]"></div>
    </motion.div>
  );
};

export default FinancialOverview;

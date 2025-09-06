import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config';
import axios from 'axios';
import Card from '../ui/Card';

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
      <Card
        title="FINANCIAL OVERVIEW"
        subtitle="Budget & spending insights"
        icon={<DollarSign className="h-5 w-5 text-[#1E49C9]" />}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-[#2A313A] rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-[#2A313A] rounded"></div>
            <div className="h-4 bg-[#2A313A] rounded w-2/3"></div>
          </div>
        </div>
      </Card>
    );
  }

  const budgetAdherence = calculateBudgetAdherence();
  const isOverBudget = budgetAdherence < 0;

  return (
    <Card
      title="FINANCIAL OVERVIEW"
      subtitle="Budget & spending insights"
      icon={<DollarSign className="h-5 w-5 text-[#1E49C9]" />}
    >
      {/* Header Action */}
      <div className="flex justify-end mb-4">
        <a 
          href="/finance" 
          className="font-jakarta text-sm leading-relaxed tracking-wider text-[#1E49C9] hover:text-[#1E49C9]/80 font-medium flex items-center"
        >
          VIEW DETAILS
        </a>
      </div>

      <div className="space-y-6">
        {/* Budget Adherence */}
        <div className="bg-[#0A0C0F] border border-[#2A313A] rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-jakarta text-sm leading-relaxed tracking-wider text-text-primary font-medium">Budget Adherence</span>
            <div className="flex items-center space-x-2">
              {isOverBudget ? (
                <TrendingDown className="h-4 w-4 text-[#1E49C9]" />
              ) : (
                <TrendingUp className="h-4 w-4 text-[#1E49C9]" />
              )}
              <span className={`font-jakarta text-lg font-bold text-[#1E49C9]`}>
                {Math.abs(budgetAdherence).toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="w-full bg-[#2A313A] rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-500 bg-[#1E49C9]"
              style={{ width: `${Math.min(100, Math.abs(budgetAdherence))}%` }}
            ></div>
          </div>
          <div className="flex justify-between font-jakarta text-xs text-text-secondary mt-1">
            <span>Spent: {formatCurrency(financialData.summary.totalExpenses || 0)}</span>
            <span>Budget: {formatCurrency(financialData.summary.monthlyBudget || 0)}</span>
          </div>
        </div>

        {/* Recent Expenses */}
        {financialData.recentExpenses.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-jakarta text-2xl leading-normal text-text-primary font-bold tracking-wide flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-[#1E49C9]" />
              Recent Expenses
            </h4>
            <div className="space-y-2">
              {financialData.recentExpenses.slice(0, 3).map((expense, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-[#0A0C0F] rounded border border-[#2A313A]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#1E49C9] rounded-full"></div>
                    <span className="font-jakarta text-sm leading-relaxed text-text-primary">{expense.description || 'Expense'}</span>
                  </div>
                  <span className="font-jakarta text-sm leading-relaxed tracking-wider font-medium text-[#1E49C9]">
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
            <h4 className="font-jakarta text-2xl leading-normal text-text-primary font-bold tracking-wide flex items-center">
              <Target className="h-4 w-4 mr-2 text-[#1E49C9]" />
              Active Goals
            </h4>
            <div className="space-y-2">
              {financialData.goals.slice(0, 2).map((goal, index) => (
                <div key={index} className="p-2 bg-[#0A0C0F] rounded border border-[#2A313A]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-jakarta text-sm leading-relaxed text-text-primary">{goal.category || 'Goal'}</span>
                    <span className="font-jakarta text-xs text-text-secondary">{goal.period || 'monthly'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-jakarta text-xs text-text-secondary">
                      {formatCurrency(goal.amount || 0)}
                    </span>
                    <div className="w-16 bg-[#2A313A] rounded-full h-1">
                      <div 
                        className="bg-[#1E49C9] h-1 rounded-full transition-all duration-500"
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
            <DollarSign className="h-8 w-8 text-text-secondary mx-auto mb-2" />
            <p className="font-jakarta text-sm text-text-secondary">No financial data yet</p>
            <a 
              href="/finance" 
              className="font-jakarta text-xs text-[#1E49C9] hover:text-[#1E49C9]/80 leading-relaxed tracking-wider"
            >
              ADD EXPENSES
            </a>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FinancialOverview;

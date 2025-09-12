import { createContext, useContext, useState, useEffect } from 'react';
import { expenseApi } from '../services/expenseApi';

const ExpenseContext = createContext();

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Fetch expenses with optional filtering and pagination
  const fetchExpenses = async (token, options = {}) => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await expenseApi.getExpenses(token, options);
      
      if (response.success) {
        setExpenses(response.expenses || response.data || []);
        setPagination(response.pagination || {});
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to fetch expenses');
      console.error('Fetch expenses error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new expense
  const createExpense = async (token, expenseData) => {
    try {
      setError(null);
      const response = await expenseApi.createExpense(token, expenseData);
      
      if (response.success) {
        // Add the new expense to the list
        const newExpense = response.expense || response.data;
        setExpenses(prev => [newExpense, ...prev]);
        return { success: true, expense: newExpense };
      } else {
        setError(response.message);
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = 'Failed to create expense';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Update expense
  const updateExpense = async (token, expenseId, updateData) => {
    try {
      setError(null);
      const response = await expenseApi.updateExpense(token, expenseId, updateData);
      
      if (response.success) {
        // Update the expense in the list
        const updatedExpense = response.expense || response.data;
        setExpenses(prev => 
          prev.map(expense => 
            expense._id === expenseId ? updatedExpense : expense
          )
        );
        return { success: true, expense: updatedExpense };
      } else {
        setError(response.message);
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = 'Failed to update expense';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Delete expense
  const deleteExpense = async (token, expenseId) => {
    try {
      setError(null);
      const response = await expenseApi.deleteExpense(token, expenseId);
      
      if (response.success) {
        // Remove the expense from the list
        setExpenses(prev => prev.filter(expense => expense._id !== expenseId));
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = 'Failed to delete expense';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Get expense statistics
  const fetchStats = async (token, options = {}) => {
    if (!token) return;
    
    try {
      const response = await expenseApi.getExpenseStats(token, options);
      
      if (response.success) {
        setStats(response.stats || response.data);
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Get expense categories
  const getCategories = () => {
    return expenseApi.getExpenseCategories();
  };

  const value = {
    expenses,
    pagination,
    loading,
    error,
    stats,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    fetchStats,
    clearError,
    getCategories
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

import { useState, useEffect, useMemo } from 'react';

// Helper functions for date handling and formatting
const getMonthYear = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const getMonthName = (dateString) => {
  return new Date(dateString).toLocaleString('default', { month: 'long' });
};

const getDayName = (dayIndex) => {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex];
};

// Load data from localStorage
const loadExpenses = () => {
  const savedExpenses = localStorage.getItem('expenses');
  return savedExpenses ? JSON.parse(savedExpenses) : [];
};

// Load preferences from localStorage
const loadPreferences = () => {
  const savedPreferences = localStorage.getItem('expensePreferences');
  return savedPreferences ? JSON.parse(savedPreferences) : {
    selectedCategory: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
    dateRange: 'all',
    customDateRange: { startDate: '', endDate: '' }
  };
};

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalExpense, setTotalExpense] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Load saved preferences
  const savedPreferences = loadPreferences();
  const [selectedCategory, setSelectedCategory] = useState(savedPreferences.selectedCategory);
  const [sortBy, setSortBy] = useState(savedPreferences.sortBy);
  const [sortOrder, setSortOrder] = useState(savedPreferences.sortOrder);
  const [dateRange, setDateRange] = useState(savedPreferences.dateRange);
  const [customDateRange, setCustomDateRange] = useState(savedPreferences.customDateRange);
  
  // Load saved expenses
  const [expenses, setExpenses] = useState(loadExpenses());

  const categories = ['Food & Drinks', 'Shopping', 'Housing', 'Transportation', 'Entertainment', 'Healthcare', 'Other'];

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(expense => {
        // Check if expense and expense.name exist before calling toLowerCase()
        const matchesSearch = !searchTerm || 
          (expense?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
        const matchesCategory = selectedCategory === 'all' || expense?.category === selectedCategory;
        const matchesDate = (() => {
          if (dateRange === 'all') return true;
          const expenseDate = new Date(expense?.date);
          const today = new Date();
          const diffDays = Math.floor((today - expenseDate) / (1000 * 60 * 60 * 24));
          
          switch(dateRange) {
            case 'today': return diffDays === 0;
            case 'week': return diffDays <= 7;
            case 'month': return diffDays <= 30;
            case 'custom': {
              if (!customDateRange.startDate || !customDateRange.endDate) return true;
              const expDate = new Date(expense?.date);
              const startDate = new Date(customDateRange.startDate);
              const endDate = new Date(customDateRange.endDate);
              return expDate >= startDate && expDate <= endDate;
            }
            default: return true;
          }
        })();
        
        return matchesSearch && matchesCategory && matchesDate;
      })
      .sort((a, b) => {
        switch(sortBy) {
          case 'date':
            return sortOrder === 'asc' 
              ? new Date(a.date) - new Date(b.date)
              : new Date(b.date) - new Date(a.date);
          case 'amount':
            return sortOrder === 'asc' 
              ? a.amount - b.amount
              : b.amount - a.amount;
          case 'name':
            return sortOrder === 'asc'
              ? (a.name || '').localeCompare(b.name || '')
              : (b.name || '').localeCompare(a.name || '');
          default:
            return 0;
        }
      });
  }, [expenses, searchTerm, selectedCategory, sortBy, sortOrder, dateRange]);

  // Calculate detailed statistics and analysis
  const stats = useMemo(() => {
    const categoryTotals = {};
    const monthlyTotals = {};
    const dailyTotals = {};
    let highest = { amount: 0, name: '', category: '', date: '' };
    let lowest = { amount: Infinity, name: '', category: '', date: '' };
    let monthlyData = {};
    let categoryTrends = {};

    // Initialize category trends for all categories
    categories.forEach(cat => {
      categoryTrends[cat] = { 
        total: 0, 
        count: 0, 
        avg: 0 
      };
      categoryTotals[cat] = 0;
    });

    filteredExpenses.forEach(expense => {
      // Safely handle category totals
      if (expense.category) {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        
        // Update category trends
        if (categoryTrends[expense.category]) {
          categoryTrends[expense.category].total += expense.amount;
          categoryTrends[expense.category].count += 1;
        }
      }

      // Monthly totals
      const monthYear = getMonthYear(expense.date);
      monthlyTotals[monthYear] = (monthlyTotals[monthYear] || 0) + expense.amount;

      // Daily totals
      dailyTotals[expense.date] = (dailyTotals[expense.date] || 0) + expense.amount;

      // Highest and lowest
      if (expense.amount > highest.amount) {
        highest = { ...expense };
      }
      if (expense.amount < lowest.amount) {
        lowest = { ...expense };
      }

      // Monthly category breakdown
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          total: 0,
          categories: {}
        };
      }
      monthlyData[monthYear].total += expense.amount;
      if (expense.category) {
        monthlyData[monthYear].categories[expense.category] = 
          (monthlyData[monthYear].categories[expense.category] || 0) + expense.amount;
      }
    });

    // Calculate averages
    Object.keys(categoryTrends).forEach(cat => {
      if (categoryTrends[cat].count > 0) {
        categoryTrends[cat].avg = categoryTrends[cat].total / categoryTrends[cat].count;
      }
    });

    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyTotals).sort();

    // Calculate month-over-month changes
    const monthlyChanges = {};
    sortedMonths.forEach((month, index) => {
      if (index > 0) {
        const prevMonth = sortedMonths[index - 1];
        const change = monthlyTotals[prevMonth] > 0 
          ? ((monthlyTotals[month] - monthlyTotals[prevMonth]) / monthlyTotals[prevMonth]) * 100
          : 0;
        monthlyChanges[month] = change;
      }
    });

    // Calculate daily averages
    const dailyAverages = {};
    Object.entries(dailyTotals).forEach(([date, total]) => {
      const day = new Date(date).getDay();
      if (!dailyAverages[day]) {
        dailyAverages[day] = { total: 0, count: 0 };
      }
      dailyAverages[day].total += total;
      dailyAverages[day].count += 1;
    });

    return {
      categoryTotals,
      highest,
      lowest,
      average: filteredExpenses.length 
        ? filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0) / filteredExpenses.length 
        : 0,
      monthlyTotals,
      monthlyChanges,
      dailyAverages,
      categoryTrends,
      monthlyData,
      sortedMonths
    };
  }, [filteredExpenses, categories]);

  useEffect(() => {
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalExpense(total);
  }, [filteredExpenses]);

  // Save preferences whenever they change
  useEffect(() => {
    savePreferences();
  }, [selectedCategory, sortBy, sortOrder, dateRange, customDateRange]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Save expenses to localStorage
  const saveExpenses = (newExpenses) => {
    localStorage.setItem('expenses', JSON.stringify(newExpenses));
  };

  // Save preferences to localStorage
  const savePreferences = () => {
    const preferences = {
      selectedCategory,
      sortBy,
      sortOrder,
      dateRange,
      customDateRange
    };
    localStorage.setItem('expensePreferences', JSON.stringify(preferences));
  };

  const addExpense = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const amount = parseFloat(e.target.amount.value);
    const category = e.target.category.value;
    const date = e.target.date.value;
    const desc = e.target.desc.value;
    if (name && amount && category && date) {
      const newExpenses = [...expenses, { id: Date.now(), name, amount, category, date, desc}];
      setExpenses(newExpenses);
      saveExpenses(newExpenses);
      e.target.reset();
      closeModal();
    }
  };

  const deleteExpense = (id) => {
    const newExpenses = expenses.filter((expense) => expense.id !== id);
    setExpenses(newExpenses);
    saveExpenses(newExpenses);
  };

  const handleBulkImport = (event) => {
    const fileReader = new FileReader();
    const file = event.target.files[0];

    fileReader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        
        // Validate and transform the data
        const validExpenses = jsonData.map(expense => ({
          id: expense.id || crypto.randomUUID(),
          title: expense.title,
          amount: Number(expense.amount),
          category: expense.category,
          date: expense.date,
          desc : expense.desc
        }));

        // Update state and localStorage
        setExpenses(prev => [...prev, ...validExpenses]);
        const updatedExpenses = [...expenses, ...validExpenses];
        localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
        
        // Update total
        const newTotal = updatedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        setTotalExpense(newTotal);

        alert(`Successfully imported ${validExpenses.length} expenses`);
      } catch (error) {
        alert('Error importing data. Please check the JSON format');
        console.error(error);
      }
    };

    if (file) {
      fileReader.readAsText(file);
    }
  };

  // Add this state for category expansion
  const [isExpandedCategories, setIsExpandedCategories] = useState(false);

  // Add these state variables after your other useState declarations
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Add this pagination calculation before the return statement
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredExpenses.slice(startIndex, endIndex);
  }, [filteredExpenses, currentPage]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
              Expense Tracker
            </h1>
            <p className="text-gray-400 mt-2">Keep track of your spending</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
              <p className="text-sm text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-indigo-400">₹{totalExpense.toFixed(2)}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
              <p className="text-sm text-gray-400">Average Expense</p>
              <p className="text-2xl font-bold text-purple-400">₹{stats.average.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={openModal}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-indigo-500/25 hover:scale-105 active:scale-95"
              >
                Add Expense
              </button>
              <label 
                htmlFor="jsonImport"
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-purple-500/25 hover:scale-105 active:scale-95 cursor-pointer"
              >
                Import JSON
              </label>
              <input
                id="jsonImport"
                type="file"
                accept=".json"
                onChange={handleBulkImport}
                className="hidden"
              />
            </div>
          </div>
        </header>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Filters */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search expenses..."
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
            <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="name">Name</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="bg-gray-700/50 p-2 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
            <label className="block text-sm font-medium text-gray-300 mb-2">Time Range</label>
            <div className="space-y-3">
              <select
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value);
                  if (e.target.value !== 'custom') {
                    setCustomDateRange({ startDate: '', endDate: '' });
                  }
                }}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>

              {dateRange === 'custom' && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customDateRange.startDate}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      max={customDateRange.endDate || undefined}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                    <input
                      type="date"
                      value={customDateRange.endDate}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      min={customDateRange.startDate || undefined}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
            <h3 className="text-lg font-semibold mb-2">Highest Expense</h3>
            {stats.highest.amount > 0 && (
              <div>
                <p className="text-xl font-bold text-red-400">₹{stats.highest.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-400">{stats.highest.name}</p>
              </div>
            )}
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
            <h3 className="text-lg font-semibold mb-2">Lowest Expense</h3>
            {stats.lowest.amount < Infinity && (
              <div>
                <p className="text-xl font-bold text-green-400">₹{stats.lowest.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-400">{stats.lowest.name}</p>
              </div>
            )}
          </div>

          <div className="col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
            <h3 className="text-lg font-semibold mb-4">Category Analysis</h3>
            <div className="space-y-4">
              {Object.entries(stats.categoryTotals)
                // Sort categories by total amount
                .sort(([,a], [,b]) => b - a)
                // Slice to show only top 3 if not expanded
                .slice(0, isExpandedCategories ? undefined : 3)
                .map(([category, total]) => {
                  const categoryStats = stats.categoryTrends[category] || { total: 0, count: 0, avg: 0 };
                  const percentage = totalExpense > 0 ? (total / totalExpense) * 100 : 0;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">{category}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-400">
                            {percentage.toFixed(1)}%
                          </span>
                          <span className="text-indigo-400 font-semibold">₹{total.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Avg: ₹{categoryStats.avg.toFixed(2)}</span>
                        <span>Count: {categoryStats.count}</span>
                      </div>
                    </div>
                  );
              })}
              
              {/* Show See More/Less button only if there are more than 3 categories */}
              {Object.keys(stats.categoryTotals).length > 3 && (
                <button
                  onClick={() => setIsExpandedCategories(!isExpandedCategories)}
                  className="w-full mt-2 py-2 px-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                >
                  {isExpandedCategories ? 'Show Less' : 'See More Categories'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50">
          <h3 className="text-lg font-semibold mb-6">Monthly Trends</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="text-md font-medium mb-4">Monthly Totals</h4>
              <div className="space-y-3">
                {stats.sortedMonths.map(month => {
                  const change = stats.monthlyChanges[month];
                  return (
                    <div key={month} className="flex items-center justify-between">
                      <div>
                        <span className="text-gray-300">{getMonthName(month + '-01')}</span>
                        <span className="text-gray-500 text-sm ml-2">{month.split('-')[0]}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-indigo-400 font-semibold">
                          ₹{stats.monthlyTotals[month].toFixed(2)}
                        </span>
                        {change !== undefined && (
                          <span className={`text-sm ${change > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium mb-4">Daily Spending Patterns</h4>
              <div className="space-y-3">
                {Array.from({ length: 7 }, (_, index) => {
                  const day = getDayName(index);
                  const dayStats = stats.dailyAverages[index] || { total: 0, count: 0 };
                  const average = dayStats.count > 0 ? dayStats.total / dayStats.count : 0;
                  return (
                    <div key={day} className="flex items-center justify-between">
                      <span className="text-gray-300">{day}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">
                          {dayStats.count} transactions
                        </span>
                        <span className="text-indigo-400 font-semibold">
                          Avg: ₹{average.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <main>
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                Expenses List
              </h2>
              <p className="text-gray-400">
                Showing {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of {expenses.length} expenses
              </p>
            </div>
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2M7 7h10"></path>
                </svg>
                <p className="text-gray-400">No expenses found</p>
              </div>
            ) : (
              <>
                <ul className="space-y-4 mb-6">
                  {paginatedExpenses.map((expense) => (
                    <li
                      key={expense.id}
                      className="group flex justify-between items-center bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/50 hover:bg-gray-800/80"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                          <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0 12a9 9 0 110-18 9 9 0 010 18zm0 0v1m0-1v-.01M12 18v-1m0-16a9 9 0 100 18 9 9 0 000-18z"></path>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">{expense.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">{expense.category}</span>
                            <span className="text-sm text-gray-500">{expense.desc}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-sm text-gray-400">{new Date(expense.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-semibold text-indigo-400">₹{expense.amount.toFixed(2)}</span>
                        <button 
                          onClick={() => deleteExpense(expense.id)} 
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 hover:bg-red-500/10 rounded-lg"
                        >
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                
                {/* Pagination Controls */}
                {filteredExpenses.length > itemsPerPage > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg ${
                        currentPage === 1
                          ? 'text-gray-500 cursor-not-allowed'
                          : 'text-indigo-400 hover:bg-gray-700/50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg ${
                        currentPage === 1
                          ? 'text-gray-500 cursor-not-allowed'
                          : 'text-indigo-400 hover:bg-gray-700/50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`px-3 py-1 rounded-lg transition-colors ${
                            currentPage === index + 1
                              ? 'bg-indigo-500 text-white'
                              : 'text-gray-400 hover:bg-gray-700/50'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg ${
                        currentPage === totalPages
                          ? 'text-gray-500 cursor-not-allowed'
                          : 'text-indigo-400 hover:bg-gray-700/50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg ${
                        currentPage === totalPages
                          ? 'text-gray-500 cursor-not-allowed'
                          : 'text-indigo-400 hover:bg-gray-700/50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* Pagination Controls */}
        {filteredExpenses.length > itemsPerPage &&(
        <div className="mt-4">
          <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
            <span>Page {currentPage} of {totalPages}</span>
            <span>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredExpenses.length)} - {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} expenses
            </span>
          </div>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Last
            </button>
          </div>
        </div>
        )}
      </div>
      

      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity"></div>
            <div className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</div>
            <div className="relative inline-block align-bottom bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-700/50 backdrop-blur-lg">
              <form onSubmit={addExpense} className="divide-y divide-gray-700/50">
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-2xl leading-6 font-medium text-white mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add New Expense
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Expense Name</label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-2.5 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter expense name"
                      />
                    </div>
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        name="amount"
                        id="amount"
                        step="1"
                        required
                        min="0"
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-2.5 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        placeholder="₹0"
                      />
                    </div>
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                      <input
                        type="date"
                        name="date"
                        id="date"
                        required
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                       <div>
                      <label htmlFor="desc" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                      <input
                        type="text"
                        name="desc"
                        id="desc"
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-2.5 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter Description"
                      />
                    </div>
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                      <select
                        name="category"
                        id="category"
                        required
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select a category</option>
                        <option value="Food & Drinks">Food & Drinks</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Housing">Housing</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-4 sm:px-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-700/50 hover:bg-gray-700 text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95"
                  >
                    Add Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;


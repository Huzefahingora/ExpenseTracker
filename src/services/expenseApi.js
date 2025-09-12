// Expense API service
// Integrates with your backend API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://expensetracker-2-2jpk.onrender.com/api';

// Helper function to get headers with token
const getHeaders = (token, includeContentType = false) => {
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

// Helper function to handle API responses
const handleApiResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  
  return data;
};

// Expense API functions
export const expenseApi = {
  // Create new expense
  async createExpense(token, expenseData) {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: getHeaders(token, true),
      body: JSON.stringify({
        title: expenseData.name || expenseData.title,
        amount: expenseData.amount,
        date: expenseData.date,
        category: expenseData.category,
        description: expenseData.desc || expenseData.description
      })
    });

    return handleApiResponse(response);
  },

  // Get all expenses with optional filtering and pagination
  async getExpenses(token, options = {}) {
    const params = new URLSearchParams();
    
    // Add query parameters
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    if (options.category && options.category !== 'all') params.append('category', options.category);
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);
    if (options.search) params.append('search', options.search);

    const response = await fetch(`${API_BASE_URL}/expenses?${params}`, {
      headers: getHeaders(token)
    });

    return handleApiResponse(response);
  },

  // Get single expense by ID
  async getExpense(token, expenseId) {
    const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
      headers: getHeaders(token)
    });

    return handleApiResponse(response);
  },

  // Update expense
  async updateExpense(token, expenseId, updateData) {
    const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
      method: 'PUT',
      headers: getHeaders(token, true),
      body: JSON.stringify({
        title: updateData.name || updateData.title,
        amount: updateData.amount,
        date: updateData.date,
        category: updateData.category,
        description: updateData.desc || updateData.description
      })
    });

    return handleApiResponse(response);
  },

  // Delete expense
  async deleteExpense(token, expenseId) {
    const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });

    return handleApiResponse(response);
  },

  // Get expense statistics
  async getExpenseStats(token, options = {}) {
    const params = new URLSearchParams();
    
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);

    const response = await fetch(`${API_BASE_URL}/expenses/stats/summary?${params}`, {
      headers: getHeaders(token)
    });

    return handleApiResponse(response);
  },

  // Get expense categories
  getExpenseCategories() {
    return [
      'Food',
      'Transportation', 
      'Entertainment',
      'Shopping',
      'Bills',
      'Healthcare',
      'Education',
      'Travel',
      'Other'
    ];
  }
};

// Complete API service class for advanced usage
export class ExpenseTrackerAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // Update token
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Clear token
  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Helper method to get headers
  getHeaders(includeContentType = false) {
    const headers = {
      'Authorization': `Bearer ${this.token}`
    };
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    return headers;
  }

  // Authentication methods
  async register(userData) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  }

  async login(credentials) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  }

  async getCurrentUser() {
    const response = await fetch(`${this.baseURL}/auth/me`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async verifyToken() {
    const response = await fetch(`${this.baseURL}/auth/verify`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    return response.json();
  }

  // Expense methods
  async createExpense(expenseData) {
    const response = await fetch(`${this.baseURL}/expenses`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(expenseData)
    });
    return response.json();
  }

  async getExpenses(options = {}) {
    const params = new URLSearchParams();
    Object.keys(options).forEach(key => {
      if (options[key]) params.append(key, options[key]);
    });
    
    const response = await fetch(`${this.baseURL}/expenses?${params}`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async getExpense(expenseId) {
    const response = await fetch(`${this.baseURL}/expenses/${expenseId}`, {
      headers: this.getHeaders()
    });
    return response.json();
  }

  async updateExpense(expenseId, updateData) {
    const response = await fetch(`${this.baseURL}/expenses/${expenseId}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(updateData)
    });
    return response.json();
  }

  async deleteExpense(expenseId) {
    const response = await fetch(`${this.baseURL}/expenses/${expenseId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return response.json();
  }

  async getExpenseStats(options = {}) {
    const params = new URLSearchParams();
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    
    const response = await fetch(`${this.baseURL}/expenses/stats/summary?${params}`, {
      headers: this.getHeaders()
    });
    return response.json();
  }
}

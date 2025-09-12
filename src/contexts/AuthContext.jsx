import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing token on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('authToken');
        if (savedToken) {
          const response = await authApi.verifyToken(savedToken);
          if (response.success) {
            setUser(response.user);
            setToken(savedToken);
          } else {
            localStorage.removeItem('authToken');
          }
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authApi.login(credentials);
      
      if (response.success) {
        const { user: userData, token: authToken } = response;
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('authToken', authToken);
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, error: response.message };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authApi.register(userData);
      
      if (response.success) {
        const { user: newUser, token: authToken } = response;
        setUser(newUser);
        setToken(authToken);
        localStorage.setItem('authToken', authToken);
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, error: response.message };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      // Try to logout from server (if endpoint exists)
      if (token) {
        try {
          await authApi.logout(token);
        } catch (error) {
          // If logout endpoint doesn't exist, just continue with client-side logout
          console.log('Server logout not available, performing client-side logout');
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always perform client-side logout
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!user && !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

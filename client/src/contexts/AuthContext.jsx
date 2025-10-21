import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Configure axios defaults
// In development, use relative URLs (proxied by Vite)
// In production, use the full API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
axios.defaults.baseURL = API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set axios authorization header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid
          await axios.get('/auth/profile');
          
          // Load user's theme preference
          await loadUserTheme();
        } catch (error) {
          console.error('Token validation failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Load user's theme preference from backend
  const loadUserTheme = async () => {
    try {
      const response = await axios.get('/users/preferences');
      const theme = response.data.data.theme || 'light';
      
      // Apply theme
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
      
      return theme;
    } catch (error) {
      console.error('Failed to load user theme:', error);
      // Fallback to light theme
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      return 'light';
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data.data;
      
      setToken(newToken);
      setUser(userData);
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Load user's theme preference after successful login
      setTimeout(() => loadUserTheme(), 100);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      const { token: newToken, user: newUser } = response.data.data;
      const { message, emailVerificationRequired } = response.data;
      
      setToken(newToken);
      setUser(newUser);
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return { 
        success: true, 
        user: newUser, 
        message,
        emailVerificationRequired 
      };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || 
                         error.response?.data?.details?.[0]?.msg ||
                         error.message ||
                         'Registration failed';
      return { 
        success: false, 
        error: errorMessage
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset theme to light mode on logout
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const setAuthData = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const refreshProfile = async () => {
    try {
      const response = await axios.get('/auth/profile');
      const userData = response.data.data;
      updateUser(userData);
      return userData;
    } catch (error) {
      console.error('Profile refresh error:', error);
      return null;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    setAuthData,
    refreshProfile,
    isAuthenticated: !!token && !!user,
    isCustomer: user?.role === 'customer',
    isProvider: user?.role === 'provider',
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

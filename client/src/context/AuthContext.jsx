// ============================================
// AUTH CONTEXT - context/AuthContext.jsx
// ============================================
// Manages authentication state across the app.
// Provides login, signup, and logout functions.
// Stores user data and JWT token in localStorage.

import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

// Create the context
const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedToken = localStorage.getItem('chatwe_token');
    const savedUser = localStorage.getItem('chatwe_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // ---- LOGIN ----
  const login = async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = response.data;

    // Save to state
    setToken(newToken);
    setUser(userData);

    // Save to localStorage (persists across page refreshes)
    localStorage.setItem('chatwe_token', newToken);
    localStorage.setItem('chatwe_user', JSON.stringify(userData));

    return response.data;
  };

  // ---- SIGNUP ----
  const signup = async (email, password) => {
    const response = await API.post('/auth/signup', { email, password });
    return response.data;
  };

  // ---- LOGOUT ----
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('chatwe_token');
    localStorage.removeItem('chatwe_user');
  };

  // ---- UPDATE USER DATA ----
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('chatwe_user', JSON.stringify(userData));
  };

  // Value object provided to all children
  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

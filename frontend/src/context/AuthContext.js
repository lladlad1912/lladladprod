import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authApi from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    if (token) {
      loadCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadCurrentUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      // Token invalid, logout
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await authApi.login({ username, password });
      const { token: newToken, ...userData } = response.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authApi.register(userData);
      // After registration, user needs to login
      return { success: true, message: 'Registration successful. Please login.' };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Registration failed' 
      };
    }
  };

  const googleLogin = async (googleUserData) => {
    try {
      const response = await authApi.googleOAuthCallback(googleUserData);
      const responseData = response.data;
      
      // Check if profile setup is needed
      if (responseData.needsProfileSetup) {
        const { token: newToken, id, username, email } = responseData;
        setToken(newToken);
        localStorage.setItem('token', newToken);
        // Store user data temporarily for profile setup
        localStorage.setItem('pendingProfileSetup', JSON.stringify({ id, username, email }));
        return { 
          success: true, 
          needsProfileSetup: true,
          userData: { id, username, email }
        };
      }
      
      // Normal login flow
      const { token: newToken, ...userData } = responseData;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || 'Google login failed' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const isEditor = () => {
    return user?.role === 'EDITOR' || user?.role === 'ADMIN';
  };

  const isUser = () => {
    return user?.role === 'USER';
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    googleLogin,
    logout,
    isAdmin,
    isEditor,
    isUser,
    loadCurrentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};





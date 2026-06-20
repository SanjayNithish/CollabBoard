import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/api/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Failed to load user profile', err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { token, user: userData } = res.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return userData;
    } catch (err) {
      throw err.response?.data?.message || 'Login failed. Please check your credentials.';
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await api.post('/api/auth/signup', { username, email, password });
      const { token, user: userData } = res.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return userData;
    } catch (err) {
      throw err.response?.data?.message || 'Registration failed.';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

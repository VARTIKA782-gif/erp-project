import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('erp_token') || null);
  const [username, setUsername] = useState(() => localStorage.getItem('erp_user') || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUsername('');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (user, pass) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { username: user, password: pass });
      localStorage.setItem('erp_token', data.token);
      localStorage.setItem('erp_user', data.username);
      setToken(data.token);
      setUsername(data.username);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    setToken(null);
    setUsername('');
  };

  return (
    <AuthContext.Provider value={{ token, username, isAuthenticated: !!token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

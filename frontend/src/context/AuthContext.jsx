import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext();

export const DEMO_ACCOUNTS = [
  { role: 'planner', name: 'Water Resources Planner', email: 'planner@mangaluru.gov.in', password: 'planner123', label: 'Planner (Authority)' },
  { role: 'citizen', name: 'Citizen User', email: 'citizen@gmail.com', password: 'citizen123', label: 'Citizen (Public)' },
  { role: 'admin', name: 'System Administrator', email: 'admin@aquashield.org', password: 'admin123', label: 'Administrator' }
];

export function AuthProvider({ children }) {
  // Default to Planner for immediate rich dashboard demo
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('aquashield_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      id: 2,
      name: 'Water Resources Planner',
      email: 'planner@mangaluru.gov.in',
      role: 'planner'
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('aquashield_token') || 'demo-token');

  useEffect(() => {
    if (user) {
      localStorage.setItem('aquashield_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aquashield_user');
    }
  }, [user]);

  const loginWithCredentials = async (email, password) => {
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('aquashield_token', res.token);
      return res.user;
    } catch (err) {
      // Fallback local match if server is offline
      const match = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase());
      if (match && password === match.password) {
        const fallbackUser = { id: 99, name: match.name, email: match.email, role: match.role };
        setUser(fallbackUser);
        return fallbackUser;
      }
      throw err;
    }
  };

  const switchRole = (roleKey) => {
    const match = DEMO_ACCOUNTS.find(a => a.role === roleKey);
    if (match) {
      const newUser = { id: 99, name: match.name, email: match.email, role: match.role };
      setUser(newUser);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('aquashield_user');
    localStorage.removeItem('aquashield_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loginWithCredentials, switchRole, logout, DEMO_ACCOUNTS }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

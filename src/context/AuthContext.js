import React, { createContext, useContext, useMemo, useState } from 'react';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const refreshUser = async (currentToken = token) => {
    if (!currentToken) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Não foi possível atualizar os dados do usuário.');
      }

      setUser(data.user);
      return data.user;
    } catch (error) {
      console.warn('Auth refresh failed:', error.message);
      return null;
    }
  };

  const value = useMemo(() => ({ user, setUser, token, setToken, logout, refreshUser }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

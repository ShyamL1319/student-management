/* eslint-disable react-refresh/only-export-components */
 
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../features/auth/api/auth.api';
import * as Sentry from '@sentry/react';

interface User {
  _id?: string;
  id?: string;
  role?: string | { name?: string };
  email?: string;
  firstName?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (data: AuthData) => void;
  logout: () => void;
}

interface AuthData {
  accessToken: string;
  user: User;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('accessToken'));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (user) {
      Sentry.setUser({
        id: String(user._id || user.id || ''),
        role: typeof user.role === 'string' ? user.role : user.role?.name || '',
        email: String(user.email || ''),
      });
    } else {
      Sentry.setUser(null);
    }
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      return;
    }

    let mounted = true;
    authApi
      .getProfile()
      .then((profile) => {
        if (!mounted) return;
        setUser(profile);
        setIsAuthenticated(true);
      })
      .catch(() => {
        if (!mounted) return;
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('accessToken');
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = (data: AuthData) => {
    localStorage.setItem('accessToken', data.accessToken);
    setUser(data.user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

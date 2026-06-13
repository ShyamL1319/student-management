import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../features/auth/api/auth.api';
import {
  hasRole as checkRole,
  hasAnyRole as checkAnyRole,
  hasAllRoles as checkAllRoles,
} from '../utils/role.utils';

interface User {
  [key: string]: unknown;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (data: AuthData) => void;
  logout: () => void;
  hasRole: (roleName: string) => boolean;
  hasAnyRole: (roleNames: string[]) => boolean;
  hasAllRoles: (roleNames: string[]) => boolean;
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
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    let mounted = true;
    authApi
      .getProfile()
      .then((u) => {
        if (!mounted) return;
        setUser(u);
      })
      .catch(() => {
        if (!mounted) return;
        setIsAuthenticated(false);
        localStorage.removeItem('accessToken');
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = (data: any) => {
    localStorage.setItem('accessToken', data.accessToken);
    setIsAuthenticated(true);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  const hasRole = (roleName: string) => checkRole(user, roleName);
  const hasAnyRole = (roleNames: string[]) => checkAnyRole(user, roleNames);
  const hasAllRoles = (roleNames: string[]) => checkAllRoles(user, roleNames);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        hasRole,
        hasAnyRole,
        hasAllRoles,
      }}
    >
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

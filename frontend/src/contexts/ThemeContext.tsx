import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FC, ReactNode } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from '../theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleThemeMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeModeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [mode] = useState<ThemeMode>('dark');

  useEffect(() => {
    localStorage.setItem('themeMode', 'dark');
    window.document.documentElement.classList.add('dark');
  }, []);

  const toggleThemeMode = () => {
    // Disabled in favor of strict global dark neon theme
    console.warn('Theme toggle disabled: EduSphere uses a strict dark neon aesthetic.');
  };

  const activeTheme = darkTheme;

  return (
    <ThemeContext.Provider value={{ mode, toggleThemeMode }}>
      <ThemeProvider theme={activeTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
};

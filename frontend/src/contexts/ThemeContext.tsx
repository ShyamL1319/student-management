import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FC, ReactNode } from 'react';
import { ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';
import { lightTheme, darkTheme } from '../theme';

// Theme mode can be 'light', 'dark', or 'system' to follow OS preference
type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
}

// Create context with proper generic typing
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeModeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize mode from localStorage or fallback to 'system'
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode') as ThemeMode | null;
    return saved || 'system';
  });

  // Detect system dark mode preference
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // Determine active MUI theme based on selected mode
  const activeTheme = (() => {
    if (mode === 'light') return lightTheme;
    if (mode === 'dark') return darkTheme;
    // system mode follows OS preference
    return prefersDarkMode ? darkTheme : lightTheme;
  })();

  // Persist mode changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleThemeMode = () => {
    // Cycle through light → dark → system → light
    const nextMode: ThemeMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    setMode(nextMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleThemeMode }}>
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

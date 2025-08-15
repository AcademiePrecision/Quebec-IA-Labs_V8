import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const themes = {
  light: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    primary: '#FF6B35',
    secondary: '#2C3E50',
    text: '#2C3E50',
    textSecondary: '#6C757D',
    border: '#E9ECEF',
    card: '#FFFFFF',
    success: '#1ABC9C',
    error: '#E74C3C',
  },
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    primary: '#FF6B35',
    secondary: '#FFFFFF',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    border: '#333333',
    card: '#1E1E1E',
    success: '#1ABC9C',
    error: '#E74C3C',
  },
};
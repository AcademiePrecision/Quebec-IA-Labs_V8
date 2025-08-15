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
    text: '#1A1A1A', // Improved contrast from #2C3E50
    textSecondary: '#4A5568', // Better contrast than #6C757D
    border: '#E9ECEF',
    card: '#FFFFFF',
    success: '#FF6B35', // Orange comme ProfileSelector
    error: '#E74C3C',
    // Professional additions
    professional: '#E85D75', // Corail Fumé #ChicRebel
    premium: '#D69E2E',
    accent: '#FF8F5C',
    charcoal: '#2A2A2A',
    // Enhanced readability colors for backgrounds
    textOnBackground: '#1A1A1A',
    textSecondaryOnBackground: '#E53E3E', // Uses professional red for good visibility
  },
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    primary: '#FF6B35',
    secondary: '#FFFFFF',
    text: '#FFFFFF',
    textSecondary: '#E0E0E0', // Enhanced from #D0D0D0 for even better contrast
    border: '#333333',
    card: '#1E1E1E',
    success: '#FF6B35', // Orange comme ProfileSelector
    error: '#E74C3C',
    // Professional additions
    professional: '#E85D75', // Corail Fumé #ChicRebel
    premium: '#D69E2E',
    accent: '#FF8F5C',
    charcoal: '#2A2A2A',
    // Enhanced readability colors for backgrounds
    textOnBackground: '#FFFFFF',
    textSecondaryOnBackground: '#FF6B35', // Uses primary orange for excellent visibility
  },
};
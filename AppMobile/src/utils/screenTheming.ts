import { themes, Theme } from '../contexts/ThemeContext';

export const getScreenStyles = (theme: Theme) => {
  const currentTheme = themes[theme];
  
  return {
    // Main screen container
    screenContainer: {
      flex: 1,
      backgroundColor: currentTheme.background,
    },
    
    // Card/form containers - improved visibility over backgrounds
    card: {
      backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)',
      borderRadius: 12,
      padding: 24,
      shadowColor: theme === 'dark' ? '#000' : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
      marginHorizontal: 16,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    },
    
    // Text styles
    title: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: currentTheme.text,
      textAlign: 'center' as const,
      marginBottom: 24,
    },
    
    subtitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: currentTheme.text,
      marginBottom: 12,
    },
    
    body: {
      fontSize: 16,
      color: currentTheme.text,
      lineHeight: 24,
    },
    
    caption: {
      fontSize: 14,
      color: currentTheme.textSecondary,
      lineHeight: 20,
    },
    
    label: {
      fontSize: 16,
      fontWeight: '500' as const,
      color: currentTheme.text,
      marginBottom: 8,
    },
    
    // Input styles
    textInput: {
      borderWidth: 1,
      borderColor: currentTheme.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: currentTheme.text,
      backgroundColor: currentTheme.surface,
    },
    
    // Error styles
    errorContainer: {
      backgroundColor: theme === 'dark' ? '#4A1A1A' : '#FEE2E2',
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#7F1D1D' : '#FECACA',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    
    errorText: {
      color: theme === 'dark' ? '#FCA5A5' : '#DC2626',
      textAlign: 'center' as const,
    },
    
    // List item styles
    listItem: {
      backgroundColor: currentTheme.card,
      borderRadius: 8,
      padding: 16,
      marginVertical: 4,
      borderWidth: 1,
      borderColor: currentTheme.border,
    },
    
    // Section styles
    section: {
      marginBottom: 24,
    },
    
    sectionHeader: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: currentTheme.text,
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    
    // Dashboard specific styles
    statsCard: {
      backgroundColor: currentTheme.card,
      borderRadius: 12,
      padding: 20,
      marginHorizontal: 8,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minHeight: 100,
      shadowColor: theme === 'dark' ? '#000' : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    statsValue: {
      fontSize: 28,
      fontWeight: 'bold' as const,
      color: currentTheme.primary,
      marginBottom: 4,
    },
    
    statsLabel: {
      fontSize: 14,
      color: currentTheme.textSecondary,
      textAlign: 'center' as const,
    },
    
    // Additional styles
    text: {
      fontSize: 16,
      color: currentTheme.text,
    },
    
    primaryText: {
      fontSize: 16,
      color: currentTheme.primary,
      fontWeight: '500' as const,
    },
    
    input: {
      borderWidth: 1,
      borderColor: currentTheme.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: currentTheme.text,
      backgroundColor: currentTheme.card,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
    },
    
    inputText: {
      fontSize: 16,
      color: currentTheme.text,
    },
    
    border: {
      borderColor: currentTheme.border,
    },
  };
};

// Quick access to placeholder text color
export const getPlaceholderColor = (theme: Theme) => {
  return themes[theme].textSecondary;
};
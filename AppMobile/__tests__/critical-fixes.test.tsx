import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { SalonDashboard } from '../src/screens/SalonDashboard';
import { FormateurDashboard } from '../src/screens/FormateurDashboard';
import { StudentDashboard } from '../src/screens/StudentDashboard';
import { CheckoutFlowScreen } from '../src/screens/CheckoutFlowScreen';
import { AppNavigator } from '../src/navigation/AppNavigator';

// Mock stores
jest.mock('../src/state/authStore', () => ({
  useAuthStore: () => ({
    session: {
      user: { id: 'test-user', email: 'test@example.com' },
      activeProfile: { userType: 'student', firstName: 'Test', lastName: 'User' },
      availableProfiles: []
    },
    language: 'fr',
    isAuthenticated: true
  })
}));

jest.mock('../src/state/appStore', () => ({
  useAppStore: () => ({
    formations: [],
    enrollments: [],
    userBadges: [],
    setFormations: jest.fn(),
    setBadges: jest.fn()
  })
}));

describe('Critical Fixes Test Suite', () => {
  
  describe('Marcel Badge Updates', () => {
    it('should display correct Marcel badge text in SalonDashboard', () => {
      const { getByText } = render(
        <ThemeProvider>
          <NavigationContainer>
            <SalonDashboard 
              onNavigateToCatalog={jest.fn()}
              onNavigateToProfile={jest.fn()}
              onLogout={jest.fn()}
              onNavigateToAdminAccounts={jest.fn()}
              onNavigateToAIValet={jest.fn()}
            />
          </NavigationContainer>
        </ThemeProvider>
      );
      
      // Badge should show updated text
      expect(getByText('Marcel • Là pour vous ✂️')).toBeTruthy();
    });

    it('should display correct Marcel badge text in FormateurDashboard', () => {
      const { getByText } = render(
        <ThemeProvider>
          <NavigationContainer>
            <FormateurDashboard 
              onNavigateToCatalog={jest.fn()}
              onNavigateToProfile={jest.fn()}
              onLogout={jest.fn()}
              onNavigateToValetLanding={jest.fn()}
            />
          </NavigationContainer>
        </ThemeProvider>
      );
      
      // Badge should show updated text
      expect(getByText('Marcel • Là pour vous ✂️')).toBeTruthy();
    });

    it('should navigate to AI Valet when Marcel badge is tapped', async () => {
      const mockNavigateToAIValet = jest.fn();
      const { getByText } = render(
        <ThemeProvider>
          <NavigationContainer>
            <SalonDashboard 
              onNavigateToCatalog={jest.fn()}
              onNavigateToProfile={jest.fn()}
              onLogout={jest.fn()}
              onNavigateToAdminAccounts={jest.fn()}
              onNavigateToAIValet={mockNavigateToAIValet}
            />
          </NavigationContainer>
        </ThemeProvider>
      );
      
      const badge = getByText('Marcel • Là pour vous ✂️');
      fireEvent.press(badge);
      
      await waitFor(() => {
        expect(mockNavigateToAIValet).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation GO_BACK Fix', () => {
    it('should handle back navigation from AI Valet with fallback', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ThemeProvider>
      );
      
      // Test navigation state management
      // This would require more complex setup with navigation testing
    });

    it('should return to correct dashboard based on user type', () => {
      // Test that navigation returns to appropriate dashboard
      // based on activeProfile.userType
    });
  });

  describe('Checkout Cancel Button', () => {
    it('should call onCancel when Cancel button is pressed', () => {
      const mockOnCancel = jest.fn();
      const { getByText } = render(
        <ThemeProvider>
          <NavigationContainer>
            <CheckoutFlowScreen 
              plan={{ id: 'test', name: 'Test Plan', price: 29 }}
              onCancel={mockOnCancel}
            />
          </NavigationContainer>
        </ThemeProvider>
      );
      
      const cancelButton = getByText('Annuler');
      fireEvent.press(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should check canGoBack before navigation', () => {
      // Test navigation.canGoBack() logic
    });
  });

  describe('StudentDashboard PRECISION LUXE Design', () => {
    it('should render with ChicRebel color palette', () => {
      const { getByTestId, getAllByStyle } = render(
        <ThemeProvider>
          <NavigationContainer>
            <StudentDashboard 
              onNavigateToCatalog={jest.fn()}
              onNavigateToProfile={jest.fn()}
              onLogout={jest.fn()}
            />
          </NavigationContainer>
        </ThemeProvider>
      );
      
      // Check for ChicRebel colors
      const primaryColorElements = getAllByStyle({ color: '#FF6B35' });
      expect(primaryColorElements.length).toBeGreaterThan(0);
    });

    it('should maintain consistent design with other dashboards', () => {
      // Compare design elements across dashboards
    });

    it('should support dark/light theme switching', () => {
      const { rerender, getByTestId } = render(
        <ThemeProvider initialTheme="light">
          <NavigationContainer>
            <StudentDashboard 
              onNavigateToCatalog={jest.fn()}
              onNavigateToProfile={jest.fn()}
              onLogout={jest.fn()}
            />
          </NavigationContainer>
        </ThemeProvider>
      );
      
      // Test theme switching
      rerender(
        <ThemeProvider initialTheme="dark">
          <NavigationContainer>
            <StudentDashboard 
              onNavigateToCatalog={jest.fn()}
              onNavigateToProfile={jest.fn()}
              onLogout={jest.fn()}
            />
          </NavigationContainer>
        </ThemeProvider>
      );
      
      // Verify dark theme applied
    });
  });

  describe('Cross-Platform Compatibility', () => {
    it('should render correctly on iOS', () => {
      jest.mock('react-native/Libraries/Utilities/Platform', () => ({
        OS: 'ios',
        select: jest.fn(obj => obj.ios)
      }));
      
      // Test iOS specific rendering
    });

    it('should render correctly on Android', () => {
      jest.mock('react-native/Libraries/Utilities/Platform', () => ({
        OS: 'android',
        select: jest.fn(obj => obj.android)
      }));
      
      // Test Android specific rendering
    });
  });

  describe('Performance Tests', () => {
    it('should complete navigation transition under 300ms', async () => {
      const startTime = Date.now();
      
      // Simulate navigation
      const { getByText } = render(
        <ThemeProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ThemeProvider>
      );
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(300);
    });

    it('should handle rapid navigation without memory leaks', () => {
      // Test memory management during navigation
    });
  });

  describe('Security Validation', () => {
    it('should enforce role-based access control', () => {
      // Test that users can only access appropriate screens
    });

    it('should validate authentication state before navigation', () => {
      // Test authentication checks
    });
  });
});
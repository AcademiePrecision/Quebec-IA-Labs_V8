describe('Critical Fixes E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' }
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Marcel Badge Functionality', () => {
    it('should display updated Marcel badge text in Salon Dashboard', async () => {
      // Login as salon owner
      await element(by.id('email-input')).typeText('salon@academie-precision.com');
      await element(by.id('password-input')).typeText('Test123!');
      await element(by.id('login-button')).tap();
      
      // Wait for dashboard to load
      await waitFor(element(by.id('salon-dashboard')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Check Marcel badge text
      await expect(element(by.text('Marcel • Là pour vous ✂️'))).toBeVisible();
    });

    it('should navigate to AI Valet when Marcel badge is tapped', async () => {
      // Tap Marcel badge
      await element(by.text('Marcel • Là pour vous ✂️')).tap();
      
      // Verify navigation to AI Valet
      await waitFor(element(by.id('ai-valet-dashboard')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should display updated Marcel badge text in Formateur Dashboard', async () => {
      // Logout and login as formateur
      await element(by.id('profile-menu')).tap();
      await element(by.id('logout-button')).tap();
      
      await element(by.id('email-input')).typeText('formateur@academie-precision.com');
      await element(by.id('password-input')).typeText('Test123!');
      await element(by.id('login-button')).tap();
      
      // Wait for dashboard to load
      await waitFor(element(by.id('formateur-dashboard')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Check Marcel badge text
      await expect(element(by.text('Marcel • Là pour vous ✂️'))).toBeVisible();
    });
  });

  describe('Navigation GO_BACK Fix', () => {
    it('should navigate back from AI Valet to Salon Dashboard', async () => {
      // Login as salon owner
      await element(by.id('email-input')).typeText('salon@academie-precision.com');
      await element(by.id('password-input')).typeText('Test123!');
      await element(by.id('login-button')).tap();
      
      // Navigate to AI Valet
      await element(by.text('Marcel • Là pour vous ✂️')).tap();
      await waitFor(element(by.id('ai-valet-dashboard')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Navigate back
      await element(by.id('back-button')).tap();
      
      // Should return to Salon Dashboard
      await waitFor(element(by.id('salon-dashboard')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should fallback to correct dashboard when canGoBack is false', async () => {
      // Direct navigation to AI Valet (no back stack)
      await device.openURL({
        url: 'academie-precision://ai-valet',
      });
      
      await waitFor(element(by.id('ai-valet-dashboard')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Try to go back - should fallback to appropriate dashboard
      await element(by.id('back-button')).tap();
      
      // Should navigate to dashboard based on user type
      await waitFor(element(by.id('salon-dashboard')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should navigate back from AI Valet to Student Dashboard', async () => {
      // Login as student
      await element(by.id('email-input')).typeText('student@academie-precision.com');
      await element(by.id('password-input')).typeText('Test123!');
      await element(by.id('login-button')).tap();
      
      // Navigate to AI Valet
      await element(by.id('ai-valet-button')).tap();
      await waitFor(element(by.id('ai-valet-dashboard')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Navigate back
      await element(by.id('back-button')).tap();
      
      // Should return to Student Dashboard
      await waitFor(element(by.id('student-dashboard')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Checkout Cancel Button', () => {
    it('should cancel checkout and return to previous screen', async () => {
      // Navigate to course catalog
      await element(by.id('catalog-button')).tap();
      
      // Select a course
      await element(by.id('course-1')).tap();
      
      // Start checkout
      await element(by.id('enroll-button')).tap();
      
      // Wait for checkout screen
      await waitFor(element(by.id('checkout-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Press Cancel button
      await element(by.text('Annuler')).tap();
      
      // Should return to course detail
      await waitFor(element(by.id('course-detail')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should handle multi-step checkout cancellation', async () => {
      // Start checkout
      await element(by.id('enroll-button')).tap();
      
      // Move to step 2
      await element(by.id('next-button')).tap();
      await waitFor(element(by.text('Informations de paiement')))
        .toBeVisible()
        .withTimeout(2000);
      
      // Press back button (should say "← Retour")
      await element(by.text('← Retour')).tap();
      
      // Should return to step 1
      await waitFor(element(by.text('Sélection du plan')))
        .toBeVisible()
        .withTimeout(2000);
      
      // Press cancel from step 1
      await element(by.text('Annuler')).tap();
      
      // Should exit checkout
      await waitFor(element(by.id('course-detail')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('StudentDashboard PRECISION LUXE Design', () => {
    it('should display ChicRebel color scheme', async () => {
      // Login as student
      await element(by.id('email-input')).typeText('student@academie-precision.com');
      await element(by.id('password-input')).typeText('Test123!');
      await element(by.id('login-button')).tap();
      
      // Wait for dashboard
      await waitFor(element(by.id('student-dashboard')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Check for primary color elements
      await expect(element(by.id('primary-accent')).atIndex(0)).toBeVisible();
      
      // Verify navigation tab uses ChicRebel colors
      await expect(element(by.id('active-tab-indicator'))).toHaveLabel('color-FF6B35');
    });

    it('should maintain theme consistency across light/dark modes', async () => {
      // Check light mode
      await expect(element(by.id('student-dashboard'))).toBeVisible();
      
      // Toggle to dark mode
      await element(by.id('profile-menu')).tap();
      await element(by.id('theme-toggle')).tap();
      
      // Verify dark mode applied
      await expect(element(by.id('student-dashboard'))).toHaveLabel('theme-dark');
      
      // Toggle back to light mode
      await element(by.id('theme-toggle')).tap();
      await expect(element(by.id('student-dashboard'))).toHaveLabel('theme-light');
    });

    it('should have consistent layout with other dashboards', async () => {
      // Check header structure
      await expect(element(by.id('dashboard-header'))).toBeVisible();
      
      // Check main content area
      await expect(element(by.id('dashboard-content'))).toBeVisible();
      
      // Check bottom navigation
      await expect(element(by.id('bottom-navigation'))).toBeVisible();
      
      // Verify scroll behavior
      await element(by.id('dashboard-content')).scroll(200, 'down');
      await element(by.id('dashboard-content')).scroll(200, 'up');
    });
  });

  describe('Performance Tests', () => {
    it('should load dashboard within 2 seconds', async () => {
      const startTime = Date.now();
      
      await element(by.id('email-input')).typeText('student@academie-precision.com');
      await element(by.id('password-input')).typeText('Test123!');
      await element(by.id('login-button')).tap();
      
      await waitFor(element(by.id('student-dashboard')))
        .toBeVisible()
        .withTimeout(2000);
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2000);
    });

    it('should handle rapid navigation without crashes', async () => {
      // Rapid navigation test
      for (let i = 0; i < 10; i++) {
        await element(by.id('catalog-button')).tap();
        await element(by.id('back-button')).tap();
      }
      
      // App should still be responsive
      await expect(element(by.id('student-dashboard'))).toBeVisible();
    });
  });

  describe('Cross-Platform Tests', () => {
    it('should work correctly on iOS', async () => {
      if (device.getPlatform() === 'ios') {
        // iOS specific tests
        await expect(element(by.id('ios-specific-element'))).toExist();
        
        // Test iOS gestures
        await element(by.id('dashboard-content')).swipe('left');
        await element(by.id('dashboard-content')).swipe('right');
      }
    });

    it('should work correctly on Android', async () => {
      if (device.getPlatform() === 'android') {
        // Android specific tests
        await expect(element(by.id('android-specific-element'))).toExist();
        
        // Test Android back button
        await device.pressBack();
        await waitFor(element(by.id('exit-confirmation')))
          .toBeVisible()
          .withTimeout(1000);
      }
    });
  });

  describe('Security Tests', () => {
    it('should enforce authentication for protected screens', async () => {
      // Try to access protected route without login
      await device.openURL({
        url: 'academie-precision://dashboard',
      });
      
      // Should redirect to login
      await waitFor(element(by.id('login-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should restrict access based on user roles', async () => {
      // Login as student
      await element(by.id('email-input')).typeText('student@academie-precision.com');
      await element(by.id('password-input')).typeText('Test123!');
      await element(by.id('login-button')).tap();
      
      // Try to access admin features
      await device.openURL({
        url: 'academie-precision://admin',
      });
      
      // Should show access denied or redirect
      await waitFor(element(by.id('access-denied')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });
});
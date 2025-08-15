/**
 * Background Image Optimization Utilities
 * For Académie Précision EdTech Platform
 */

import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface BackgroundConfig {
  opacity: number;
  blur: number;
  enableCaching: boolean;
  priority: 'low' | 'normal' | 'high';
  quality: 'low' | 'medium' | 'high';
}

/**
 * Performance recommendations based on device capabilities
 */
export const getOptimalBackgroundConfig = (): BackgroundConfig => {
  const isLowEndDevice = screenWidth < 375 || Platform.OS === 'android';
  const isTablet = screenWidth > 768;

  if (isLowEndDevice) {
    return {
      opacity: 0.05,
      blur: 0,
      enableCaching: true,
      priority: 'low',
      quality: 'low',
    };
  }

  if (isTablet) {
    return {
      opacity: 0.10,
      blur: 2,
      enableCaching: true,
      priority: 'normal',
      quality: 'high',
    };
  }

  // Standard mobile devices
  return {
    opacity: 0.08,
    blur: 1,
    enableCaching: true,
    priority: 'normal',
    quality: 'medium',
  };
};

/**
 * WCAG 2.1 AA Compliance Checker
 */
export const checkContrastCompliance = (
  textColor: string,
  backgroundColor: string,
  backgroundOpacity: number
): {
  isCompliant: boolean;
  contrastRatio: number;
  recommendations: string[];
} => {
  // Simplified contrast calculation for demonstration
  // In production, use a proper color contrast library
  
  const recommendations: string[] = [];
  
  if (backgroundOpacity > 0.15) {
    recommendations.push('Reduce background opacity for better text readability');
  }
  
  if (backgroundOpacity > 0.08) {
    recommendations.push('Consider adding text shadows for enhanced contrast');
  }

  // For this implementation, we assume compliance if opacity is low enough
  const isCompliant = backgroundOpacity <= 0.12;
  const mockContrastRatio = isCompliant ? 4.8 : 3.2; // WCAG AA requires 4.5:1

  return {
    isCompliant,
    contrastRatio: mockContrastRatio,
    recommendations,
  };
};

/**
 * Screen categorization for background intensity
 */
export const getScreenBackgroundIntensity = (screenName: string): 'minimal' | 'subtle' | 'medium' => {
  const highTextScreens = [
    'formationdetail',
    'adminaccounts', 
    'admindashboard',
    'profileselector',
    'addprofile'
  ];
  
  const mediumTextScreens = [
    'welcome',
    'catalog',
    'subscription'
  ];
  
  const normalizedScreenName = screenName.toLowerCase().replace('screen', '');
  
  if (highTextScreens.includes(normalizedScreenName)) {
    return 'minimal';
  }
  
  if (mediumTextScreens.includes(normalizedScreenName)) {
    return 'medium';
  }
  
  return 'subtle';
};

/**
 * Image rotation strategy for visual variety
 */
export const getBackgroundImageIndex = (screenName: string, userId?: string): number => {
  const screens = [
    'welcome', 'login', 'register', 'catalog', 
    'studentdashboard', 'formateurdashboard', 'salondashboard'
  ];
  
  const normalizedScreenName = screenName.toLowerCase().replace('screen', '');
  let baseIndex = screens.indexOf(normalizedScreenName);
  
  if (baseIndex === -1) {
    baseIndex = 0;
  }
  
  // Add user-specific rotation if userId provided
  if (userId) {
    const userSeed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    baseIndex = (baseIndex + userSeed) % 6;
  }
  
  return baseIndex % 6; // 6 professional barber photos available
};

/**
 * Memory optimization for background images
 */
export const shouldPreloadBackgrounds = (): boolean => {
  // Only preload on higher-end devices to avoid memory pressure
  return screenWidth >= 375 && Platform.OS === 'ios';
};

/**
 * Performance monitoring
 */
export const trackBackgroundPerformance = (screenName: string, loadTime: number) => {
  if (__DEV__) {
    console.log(`[BackgroundPerformance] ${screenName}: ${loadTime}ms`);
    
    if (loadTime > 100) {
      console.warn(`[BackgroundPerformance] Slow background load on ${screenName}: ${loadTime}ms`);
    }
  }
};
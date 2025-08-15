// 🎯 PROFESSIONAL EDGE THEME - Académie Précision
// Validé par UX Expert pour conversion optimale

export const PROFESSIONAL_EDGE_COLORS = {
  // Base Professional Colors
  noir: '#1A1A1A',           // Softer black for better UX
  blanc: '#FAFAFA',          // Off-white for reduced eye strain
  surface: '#2A2A2A',        // Elevated surfaces
  
  // Primary/Accent Colors (WCAG Compliant)
  primary: '#E53E3E',        // Primary color for compatibility
  accent: '#E53E3E',         // Professional red with proper contrast
  accentHover: '#C53030',    // Darker red for interactions
  accentLight: '#FEB2B2',    // Light red for backgrounds
  
  // Premium Colors
  gold: '#D69E2E',           // Warmer gold for success/premium
  goldLight: '#F7E6A3',      // Light gold for highlights
  
  // Professional Blue (replacing electric cyan)
  blue: '#3182CE',           // Trust-inspiring blue
  blueLight: '#BEE3F8',      // Light blue for info states
  
  // Status Colors
  success: '#38A169',        // Professional green
  warning: '#D69E2E',        // Consistent with gold
  error: '#E53E3E',          // Consistent with accent
  info: '#3182CE',           // Consistent with blue
  
  // Text Colors
  textPrimary: '#FFFFFF',    // High contrast white
  textSecondary: '#A0A0A0',  // Medium contrast gray
  textTertiary: '#6B6B6B',   // Low contrast gray
  textInverse: '#1A1A1A',    // Dark text on light backgrounds
  
  // Border & Divider Colors
  border: '#404040',         // Subtle borders
  divider: '#333333',        // Content dividers
  
  // Background Variants
  background: '#1A1A1A',     // Main background
  backgroundElevated: '#2A2A2A', // Cards, modals
  backgroundOverlay: 'rgba(26, 26, 26, 0.95)', // Modal overlays
  
  // Legacy compatibility
  card: '#2A2A2A',           // Same as backgroundElevated
  secondary: '#FFFFFF',      // White for compatibility
  
  // Gradients (Subtle & Professional)
  gradientPrimary: 'linear-gradient(135deg, #E53E3E 0%, #C53030 100%)',
  gradientGold: 'linear-gradient(135deg, #D69E2E 0%, #B7791F 100%)',
  gradientSurface: 'linear-gradient(145deg, #2A2A2A 0%, #1A1A1A 100%)',
  gradientOverlay: 'linear-gradient(180deg, rgba(26, 26, 26, 0) 0%, rgba(26, 26, 26, 0.8) 100%)',
};

export const PROFESSIONAL_TYPOGRAPHY = {
  // Headers - Professional & Bold
  headline: {
    fontFamily: 'Montserrat-Bold',
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    lineHeight: 1.2,
  },
  
  // Subheadings
  subheadline: {
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600' as const,
    letterSpacing: 0.3,
    lineHeight: 1.3,
  },
  
  // Body Text - Maximum Readability
  body: {
    fontFamily: 'Inter-Regular',
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 1.6,
  },
  
  // Body Bold
  bodyBold: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 1.6,
  },
  
  // CTAs & Buttons - Confident but not aggressive
  cta: {
    fontFamily: 'Montserrat-Medium',
    fontWeight: '500' as const,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    lineHeight: 1.4,
  },
  
  // Captions & Small Text
  caption: {
    fontFamily: 'Inter-Regular',
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    lineHeight: 1.4,
  },
  
  // Numbers & Metrics - Important data
  metric: {
    fontFamily: 'Inter-Bold',
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 1.1,
  },
};

export const PROFESSIONAL_SPACING = {
  // Base spacing unit
  unit: 4,
  
  // Common spacings
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  
  // Component specific
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  card: {
    padding: 20,
    margin: 16,
  },
  section: {
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
};

export const PROFESSIONAL_BORDERS = {
  radius: {
    none: 0,
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  width: {
    none: 0,
    thin: 1,
    medium: 2,
    thick: 4,
  },
};

export const PROFESSIONAL_SHADOWS = {
  // Subtle elevation (not harsh neon effects)
  none: 'none',
  sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
  md: '0 4px 8px rgba(0, 0, 0, 0.15)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.2)',
  xl: '0 16px 32px rgba(0, 0, 0, 0.25)',
  
  // Professional glow effects (subtle)
  accentGlow: '0 0 20px rgba(229, 62, 62, 0.3)',
  goldGlow: '0 0 20px rgba(214, 158, 46, 0.3)',
  successGlow: '0 0 20px rgba(56, 161, 105, 0.3)',
};

export const PROFESSIONAL_ANIMATIONS = {
  // Timing functions
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Duration (in milliseconds)
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },
  
  // Common animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  slideUp: {
    from: { opacity: 0, transform: [{ translateY: 20 }] },
    to: { opacity: 1, transform: [{ translateY: 0 }] },
  },
  scaleIn: {
    from: { opacity: 0, transform: [{ scale: 0.95 }] },
    to: { opacity: 1, transform: [{ scale: 1 }] },
  },
};

// Professional Component Styles
export const PROFESSIONAL_COMPONENTS = {
  button: {
    primary: {
      backgroundColor: PROFESSIONAL_EDGE_COLORS.accent,
      borderRadius: PROFESSIONAL_BORDERS.radius.md,
      paddingVertical: PROFESSIONAL_SPACING.button.paddingVertical,
      paddingHorizontal: PROFESSIONAL_SPACING.button.paddingHorizontal,
      shadowColor: PROFESSIONAL_EDGE_COLORS.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderColor: PROFESSIONAL_EDGE_COLORS.accent,
      borderWidth: PROFESSIONAL_BORDERS.width.medium,
      borderRadius: PROFESSIONAL_BORDERS.radius.md,
      paddingVertical: PROFESSIONAL_SPACING.button.paddingVertical,
      paddingHorizontal: PROFESSIONAL_SPACING.button.paddingHorizontal,
    },
    ghost: {
      backgroundColor: 'transparent',
      paddingVertical: PROFESSIONAL_SPACING.button.paddingVertical,
      paddingHorizontal: PROFESSIONAL_SPACING.button.paddingHorizontal,
    },
  },
  
  card: {
    default: {
      backgroundColor: PROFESSIONAL_EDGE_COLORS.backgroundElevated,
      borderRadius: PROFESSIONAL_BORDERS.radius.lg,
      padding: PROFESSIONAL_SPACING.card.padding,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    accent: {
      backgroundColor: PROFESSIONAL_EDGE_COLORS.backgroundElevated,
      borderColor: PROFESSIONAL_EDGE_COLORS.accent,
      borderWidth: PROFESSIONAL_BORDERS.width.thin,
      borderRadius: PROFESSIONAL_BORDERS.radius.lg,
      padding: PROFESSIONAL_SPACING.card.padding,
    },
    premium: {
      backgroundColor: PROFESSIONAL_EDGE_COLORS.backgroundElevated,
      borderColor: PROFESSIONAL_EDGE_COLORS.gold,
      borderWidth: PROFESSIONAL_BORDERS.width.thin,
      borderRadius: PROFESSIONAL_BORDERS.radius.lg,
      padding: PROFESSIONAL_SPACING.card.padding,
      shadowColor: PROFESSIONAL_EDGE_COLORS.gold,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
  },
  
  modal: {
    backdrop: {
      backgroundColor: PROFESSIONAL_EDGE_COLORS.backgroundOverlay,
    },
    container: {
      backgroundColor: PROFESSIONAL_EDGE_COLORS.backgroundElevated,
      borderRadius: PROFESSIONAL_BORDERS.radius.xl,
      margin: PROFESSIONAL_SPACING.lg,
      padding: PROFESSIONAL_SPACING.xl,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 16,
    },
  },
};

// Export default theme object for easy usage
export const professionalTheme = {
  colors: PROFESSIONAL_EDGE_COLORS,
  typography: PROFESSIONAL_TYPOGRAPHY,
  spacing: PROFESSIONAL_SPACING,
  borders: PROFESSIONAL_BORDERS,
  shadows: PROFESSIONAL_SHADOWS,
  animations: PROFESSIONAL_ANIMATIONS,
  components: PROFESSIONAL_COMPONENTS,
};

export default professionalTheme;
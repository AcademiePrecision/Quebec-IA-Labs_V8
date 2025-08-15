import React from 'react';
import { View, Text, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { PROFESSIONAL_EDGE_COLORS, PROFESSIONAL_TYPOGRAPHY, PROFESSIONAL_SPACING, PROFESSIONAL_BORDERS } from '../theme/professionalTheme';

interface ProfessionalCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'premium' | 'metric';
  onPress?: () => void;
  style?: ViewStyle;
  padding?: number;
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: 'success' | 'warning' | 'error' | 'info';
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  children,
  variant = 'default',
  onPress,
  style,
  padding,
  title,
  subtitle,
  badge,
  badgeVariant = 'info',
}) => {
  const { currentTheme } = useTheme();

  // Get card styles based on variant
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: PROFESSIONAL_EDGE_COLORS.backgroundElevated,
      borderRadius: PROFESSIONAL_BORDERS.radius.lg,
      padding: padding ?? PROFESSIONAL_SPACING.card.padding,
    };

    switch (variant) {
      case 'default':
        return {
          ...baseStyle,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 4,
        };

      case 'accent':
        return {
          ...baseStyle,
          borderColor: PROFESSIONAL_EDGE_COLORS.accent,
          borderWidth: 1,
          shadowColor: PROFESSIONAL_EDGE_COLORS.accent,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        };

      case 'premium':
        return {
          ...baseStyle,
          borderColor: PROFESSIONAL_EDGE_COLORS.gold,
          borderWidth: 1,
          shadowColor: PROFESSIONAL_EDGE_COLORS.gold,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 6,
        };

      case 'metric':
        return {
          ...baseStyle,
          backgroundColor: PROFESSIONAL_EDGE_COLORS.surface,
          borderColor: PROFESSIONAL_EDGE_COLORS.border,
          borderWidth: 1,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 2,
        };

      default:
        return baseStyle;
    }
  };

  const getBadgeStyle = (): ViewStyle => {
    let badgeColor = PROFESSIONAL_EDGE_COLORS.blue;
    
    switch (badgeVariant) {
      case 'success':
        badgeColor = PROFESSIONAL_EDGE_COLORS.success;
        break;
      case 'warning':
        badgeColor = PROFESSIONAL_EDGE_COLORS.warning;
        break;
      case 'error':
        badgeColor = PROFESSIONAL_EDGE_COLORS.error;
        break;
      case 'info':
      default:
        badgeColor = PROFESSIONAL_EDGE_COLORS.blue;
        break;
    }

    return {
      backgroundColor: badgeColor,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: PROFESSIONAL_BORDERS.radius.sm,
      alignSelf: 'flex-start',
      marginBottom: PROFESSIONAL_SPACING.sm,
    };
  };

  const cardStyle = [getCardStyle(), style];

  const CardContent = () => (
    <View style={cardStyle}>
      {/* Header with title, subtitle, and badge */}
      {(title || subtitle || badge) && (
        <View style={{ marginBottom: PROFESSIONAL_SPACING.md }}>
          {/* Badge */}
          {badge && (
            <View style={getBadgeStyle()}>
              <Text style={{
                color: PROFESSIONAL_EDGE_COLORS.textPrimary,
                fontSize: 12,
                fontFamily: PROFESSIONAL_TYPOGRAPHY.caption.fontFamily,
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                {badge}
              </Text>
            </View>
          )}

          {/* Title */}
          {title && (
            <Text style={{
              color: PROFESSIONAL_EDGE_COLORS.textPrimary,
              fontSize: 18,
              fontFamily: PROFESSIONAL_TYPOGRAPHY.subheadline.fontFamily,
              fontWeight: PROFESSIONAL_TYPOGRAPHY.subheadline.fontWeight,
              letterSpacing: PROFESSIONAL_TYPOGRAPHY.subheadline.letterSpacing,
              marginBottom: subtitle ? 4 : 0,
            }}>
              {title}
            </Text>
          )}

          {/* Subtitle */}
          {subtitle && (
            <Text style={{
              color: PROFESSIONAL_EDGE_COLORS.textSecondary,
              fontSize: 14,
              fontFamily: PROFESSIONAL_TYPOGRAPHY.body.fontFamily,
              lineHeight: PROFESSIONAL_TYPOGRAPHY.body.lineHeight * 14,
            }}>
              {subtitle}
            </Text>
          )}
        </View>
      )}

      {/* Card Content */}
      {children}
    </View>
  );

  // If onPress is provided, make it touchable
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

// Specialized card variants
export const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  style?: ViewStyle;
  onPress?: () => void;
}> = ({ title, value, subtitle, trend, trendValue, style, onPress }) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return PROFESSIONAL_EDGE_COLORS.success;
      case 'down':
        return PROFESSIONAL_EDGE_COLORS.error;
      case 'neutral':
      default:
        return PROFESSIONAL_EDGE_COLORS.textSecondary;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      case 'neutral':
      default:
        return '→';
    }
  };

  return (
    <ProfessionalCard variant="metric" style={style} onPress={onPress}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            color: PROFESSIONAL_EDGE_COLORS.textSecondary,
            fontSize: 12,
            fontFamily: PROFESSIONAL_TYPOGRAPHY.caption.fontFamily,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 4,
          }}>
            {title}
          </Text>
          
          <Text style={{
            color: PROFESSIONAL_EDGE_COLORS.textPrimary,
            fontSize: 28,
            fontFamily: PROFESSIONAL_TYPOGRAPHY.metric.fontFamily,
            fontWeight: PROFESSIONAL_TYPOGRAPHY.metric.fontWeight,
            letterSpacing: PROFESSIONAL_TYPOGRAPHY.metric.letterSpacing,
            lineHeight: 32,
          }}>
            {value}
          </Text>

          {subtitle && (
            <Text style={{
              color: PROFESSIONAL_EDGE_COLORS.textSecondary,
              fontSize: 12,
              fontFamily: PROFESSIONAL_TYPOGRAPHY.caption.fontFamily,
              marginTop: 2,
            }}>
              {subtitle}
            </Text>
          )}
        </View>

        {trend && trendValue && (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{
              color: getTrendColor(),
              fontSize: 16,
              fontFamily: PROFESSIONAL_TYPOGRAPHY.bodyBold.fontFamily,
              fontWeight: PROFESSIONAL_TYPOGRAPHY.bodyBold.fontWeight,
            }}>
              {getTrendIcon()} {trendValue}
            </Text>
          </View>
        )}
      </View>
    </ProfessionalCard>
  );
};

// Revenue Card (specialized for salon revenue display)
export const RevenueCard: React.FC<{
  amount: string | number;
  period: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  style?: ViewStyle;
  onPress?: () => void;
}> = ({ amount, period, trend, trendValue, style, onPress }) => (
  <ProfessionalCard variant="premium" style={style} onPress={onPress}>
    <View>
      <Text style={{
        color: PROFESSIONAL_EDGE_COLORS.gold,
        fontSize: 12,
        fontFamily: PROFESSIONAL_TYPOGRAPHY.caption.fontFamily,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 4,
      }}>
        {period}
      </Text>
      
      <Text style={{
        color: PROFESSIONAL_EDGE_COLORS.textPrimary,
        fontSize: 36,
        fontFamily: PROFESSIONAL_TYPOGRAPHY.metric.fontFamily,
        fontWeight: PROFESSIONAL_TYPOGRAPHY.metric.fontWeight,
        letterSpacing: -1,
        lineHeight: 40,
      }}>
        {amount}$
      </Text>

      {trend && trendValue && (
        <Text style={{
          color: trend === 'up' ? PROFESSIONAL_EDGE_COLORS.success : PROFESSIONAL_EDGE_COLORS.error,
          fontSize: 14,
          fontFamily: PROFESSIONAL_TYPOGRAPHY.bodyBold.fontFamily,
          marginTop: 4,
        }}>
          {trend === 'up' ? '↗' : '↘'} {trendValue} vs hier
        </Text>
      )}
    </View>
  </ProfessionalCard>
);

export default ProfessionalCard;
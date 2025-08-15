import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, themes } from '../../contexts/ThemeContext';

export interface Feature {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
  badge?: string;
}

interface FeatureCardProps {
  feature: Feature;
  index: number;
  onPress?: () => void;
  compact?: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  feature,
  index,
  onPress,
  compact = false,
}) => {
  const { theme } = useTheme();
  const currentTheme = themes[theme];
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle rotation animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const CardContent = () => (
    <View
      style={{
        backgroundColor: theme === 'dark'
          ? 'rgba(30, 30, 30, 0.95)'
          : 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        padding: compact ? 16 : 20,
        borderWidth: 1,
        borderColor: theme === 'dark'
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.05)',
        shadowColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      {/* Badge if present */}
      {feature.badge && (
        <View style={{ position: 'absolute', top: -8, right: 12 }}>
          <LinearGradient
            colors={[feature.color, feature.color + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            >
              {feature.badge}
            </Text>
          </LinearGradient>
        </View>
      )}

      <View style={{ flexDirection: compact ? 'row' : 'column', alignItems: compact ? 'center' : 'flex-start' }}>
        {/* Icon Container */}
        <Animated.View
          style={{
            transform: [
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '5deg'],
                }),
              },
            ],
            marginBottom: compact ? 0 : 16,
            marginRight: compact ? 16 : 0,
          }}
        >
          <LinearGradient
            colors={[feature.color + '20', feature.color + '10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: compact ? 48 : 56,
              height: compact ? 48 : 56,
              borderRadius: compact ? 24 : 28,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: feature.color + '30',
            }}
          >
            <Ionicons 
              name={feature.icon} 
              size={compact ? 24 : 28} 
              color={feature.color} 
            />
          </LinearGradient>
        </Animated.View>

        {/* Text Content */}
        <View style={{ flex: compact ? 1 : undefined }}>
          <Text
            style={{
              fontSize: compact ? 16 : 18,
              fontWeight: 'bold',
              color: currentTheme.text,
              marginBottom: compact ? 4 : 8,
              textShadowColor: theme === 'dark'
                ? 'rgba(0, 0, 0, 0.6)'
                : 'rgba(255, 255, 255, 0.6)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
          >
            {feature.title}
          </Text>
          
          <Text
            style={{
              fontSize: compact ? 13 : 14,
              color: currentTheme.textSecondary,
              lineHeight: compact ? 18 : 20,
            }}
          >
            {feature.description}
          </Text>
        </View>
      </View>

      {/* Optional action indicator */}
      {onPress && (
        <View
          style={{
            position: 'absolute',
            top: compact ? '50%' : 16,
            right: 16,
            marginTop: compact ? -12 : 0,
          }}
        >
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={currentTheme.textSecondary + '80'} 
          />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          marginBottom: 16,
        }}
      >
        <Pressable
          onPress={onPress}
          style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <CardContent />
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        marginBottom: 16,
      }}
    >
      <CardContent />
    </Animated.View>
  );
};
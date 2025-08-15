import React from 'react';
import { ImageBackground, View, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SubtleBackgroundProps {
  children: React.ReactNode;
  imageSource?: any;
  intensity?: 'minimal' | 'subtle' | 'medium';
  className?: string;
}

const backgroundImages = [
  require('../../assets/splash/pexels-thgusstavo-2040189.jpg'),
  require('../../assets/splash/pexels-lumierestudiomx-897271.jpg'),
  require('../../assets/splash/pexels-nickoloui-1319459.jpg'),
  require('../../assets/splash/pexels-joshsorenson-995300.jpg'),
  require('../../assets/splash/pexels-zvolskiy-1570807.jpg'),
  require('../../assets/splash/pexels-lorentzworks-668196.jpg'),
];

export const SubtleBackground: React.FC<SubtleBackgroundProps> = ({
  children,
  imageSource,
  intensity = 'subtle',
  className = '',
}) => {
  const { theme } = useTheme();
  
  // Select random background if none provided
  const selectedImage = imageSource || backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
  
  // Opacity based on theme and intensity - better balanced for readability
  const getOpacity = () => {
    const baseOpacity = {
      minimal: theme === 'dark' ? 0.20 : 0.15,
      subtle: theme === 'dark' ? 0.25 : 0.20,
      medium: theme === 'dark' ? 0.30 : 0.25,
    };
    return baseOpacity[intensity];
  };

  // Brand overlay color based on theme (reduced opacity)
  const getOverlayColor = () => {
    if (theme === 'dark') {
      return 'rgba(44, 62, 80, 0.15)'; // Cool secondary color
    }
    return 'rgba(255, 107, 53, 0.08)'; // Warm orange tint
  };

  return (
    <ImageBackground
      source={selectedImage}
      style={{ flex: 1 }}
      resizeMode="cover"
      className={className}
    >
      {/* Balanced overlay - darker overlay only, lighter for light mode */}
      <View
        style={{
          flex: 1,
          backgroundColor: theme === 'dark' 
            ? `rgba(0,0,0,0.65)` 
            : `rgba(255,255,255,0.45)`, // Reduced from 0.75 to 0.45 for better image visibility
        }}
      >
        {children}
      </View>
    </ImageBackground>
  );
};

// Enhanced text component for better readability over backgrounds
interface ReadableTextProps {
  children: React.ReactNode;
  style?: any;
  className?: string;
}

export const ReadableText: React.FC<ReadableTextProps> = ({
  children,
  style = {},
  className = '',
  ...props
}) => {
  const { theme } = useTheme();
  
  const enhancedStyle = {
    ...style,
    // Stronger text shadows for better readability over background images
    textShadowColor: theme === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  };

  return (
    <Text style={enhancedStyle} className={className} {...props}>
      {children}
    </Text>
  );
};
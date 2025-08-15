import React, { useEffect, useState } from 'react';
import { 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Keyboard,
  Dimensions,
  View
} from 'react-native';

interface KeyboardAvoidingScrollViewProps {
  children: React.ReactNode;
  contentContainerStyle?: any;
  className?: string;
  style?: any;
}

export const KeyboardAvoidingScrollView: React.FC<KeyboardAvoidingScrollViewProps> = ({
  children,
  contentContainerStyle,
  className,
  style,
}) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const scrollViewProps = {
    contentContainerStyle: [
      contentContainerStyle,
      {
        paddingBottom: keyboardHeight > 0 ? keyboardHeight + 20 : 20,
        minHeight: screenHeight,
      }
    ],
    showsVerticalScrollIndicator: false,
    keyboardShouldPersistTaps: 'handled' as const,
    scrollEventThrottle: 16,
    className,
    style,
  };

  if (Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView 
        behavior="padding" 
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <ScrollView {...scrollViewProps}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Android
  return (
    <View className="flex-1">
      <ScrollView {...scrollViewProps}>
        {children}
      </ScrollView>
    </View>
  );
};
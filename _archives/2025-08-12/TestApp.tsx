import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function TestApp() {
  return (
    <SafeAreaProvider>
      <View className="flex-1 justify-center items-center bg-[#F8F9FA]">
        <Text className="text-2xl font-bold text-[#2C3E50]">
          Test App - L'application fonctionne
        </Text>
      </View>
    </SafeAreaProvider>
  );
}
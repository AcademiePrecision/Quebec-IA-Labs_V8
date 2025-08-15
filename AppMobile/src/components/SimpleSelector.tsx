import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Option {
  label: string;
  value: string;
}

interface SimpleSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  title?: string;
}

export const SimpleSelector: React.FC<SimpleSelectorProps> = ({
  value,
  onValueChange,
  options,
  placeholder = "Sélectionner...",
  title = "Sélectionner une option",
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setModalVisible(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setModalVisible(true)}
        className="border border-gray-300 rounded-lg px-4 py-3 flex-row items-center justify-between"
      >
        <Text className={`text-base ${selectedOption ? 'text-[#2C3E50]' : 'text-[#7F8C8D]'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#7F8C8D" />
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-[#F8F9FA]" style={{ paddingTop: insets.top }}>
          {/* Header */}
          <View className="bg-white border-b border-gray-200 px-6 py-4">
            <View className="flex-row items-center justify-between">
              <Pressable 
                onPress={() => setModalVisible(false)} 
                className="w-10 h-10 items-center justify-center"
              >
                <Ionicons name="close" size={24} color="#2C3E50" />
              </Pressable>
              <Text className="text-lg font-bold text-[#2C3E50]">
                {title}
              </Text>
              <View className="w-10" />
            </View>
          </View>

          {/* Options */}
          <ScrollView className="flex-1">
            <View className="px-6 py-4">
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  className={`bg-white rounded-xl p-4 shadow-sm mb-3 border ${
                    value === option.value ? 'border-[#FF6B35]' : 'border-gray-200'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className={`text-base font-medium ${
                      value === option.value ? 'text-[#FF6B35]' : 'text-[#2C3E50]'
                    }`}>
                      {option.label}
                    </Text>
                    {value === option.value && (
                      <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};
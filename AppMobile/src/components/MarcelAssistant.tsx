import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  Animated, 
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '../state/authStore';

// ChicRebel Palette
const ChicRebelPalette = {
  primary: '#FF6B35',
  secondary: '#D4AF37',
  accent: '#E85D75',
  dark: '#1A1A1A',
  darkGray: '#2D2D2D',
  lightGray: '#F3F4F6',
  white: '#FFFFFF',
};

interface MarcelMessage {
  id: string;
  text: string;
  sender: 'user' | 'marcel';
  timestamp: Date;
}

interface MarcelAssistantProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  context?: string; // Current screen/context for better assistance
}

export const MarcelAssistant: React.FC<MarcelAssistantProps> = ({ 
  position = 'bottom-right',
  context = 'general' 
}) => {
  const { theme } = useTheme();
  const { session, language } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MarcelMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for the floating button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Welcome message on first open
    if (messages.length === 0) {
      const welcomeMessage: MarcelMessage = {
        id: '1',
        text: language === 'fr' 
          ? `Bonjour ${session?.account.firstName || 'là'} ! Je suis Marcel, votre assistant barbier IA. Comment puis-je vous aider aujourd'hui ?`
          : `Hello ${session?.account.firstName || 'there'}! I'm Marcel, your AI barber assistant. How can I help you today?`,
        sender: 'marcel',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    
    // Rotation animation when opening
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Fade in/out animation
    Animated.timing(fadeAnim, {
      toValue: isOpen ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const getContextualSuggestions = () => {
    const suggestions = {
      dashboard: [
        'Comment progresser plus vite ?',
        'Quels cours me recommandez-vous ?',
        'Comment obtenir un certificat ?',
      ],
      catalog: [
        'Quel cours pour débuter ?',
        'Différence entre les formations ?',
        'Comment choisir mon formateur ?',
      ],
      profile: [
        'Comment changer mon abonnement ?',
        'Voir mon historique de formation',
        'Mettre à jour mes préférences',
      ],
      general: [
        'Aide avec la navigation',
        'Problème technique',
        'Question sur les paiements',
      ],
    };

    return suggestions[context] || suggestions.general;
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: MarcelMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate Marcel's response
    setTimeout(() => {
      const marcelResponse: MarcelMessage = {
        id: (Date.now() + 1).toString(),
        text: getMarcelResponse(inputText),
        sender: 'marcel',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, marcelResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getMarcelResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    // Context-aware responses
    if (lowerQuery.includes('cours') || lowerQuery.includes('formation')) {
      return language === 'fr'
        ? "Je vous recommande de commencer par notre formation 'Fondamentaux du Barbier Moderne'. C'est parfait pour maîtriser les techniques essentielles. Voulez-vous que je vous montre les détails ?"
        : "I recommend starting with our 'Modern Barber Fundamentals' course. It's perfect for mastering essential techniques. Would you like me to show you the details?";
    }

    if (lowerQuery.includes('certificat')) {
      return language === 'fr'
        ? "Pour obtenir votre certificat, vous devez compléter tous les modules d'une formation et réussir l'évaluation finale avec au moins 80%. Chaque certificat est vérifié et possède un code unique."
        : "To get your certificate, you need to complete all modules of a course and pass the final assessment with at least 80%. Each certificate is verified and has a unique code.";
    }

    if (lowerQuery.includes('paiement') || lowerQuery.includes('abonnement')) {
      return language === 'fr'
        ? "Nous offrons 3 niveaux d'abonnement : Essentiel (29$/mois), Professionnel (79$/mois) et Premium (199$/mois). Chaque niveau débloque plus de contenu et de fonctionnalités. Quel niveau vous intéresse ?"
        : "We offer 3 subscription tiers: Essential ($29/month), Professional ($79/month), and Premium ($199/month). Each tier unlocks more content and features. Which tier interests you?";
    }

    // Default response
    return language === 'fr'
      ? "Je comprends votre question. Permettez-moi de vous orienter vers la bonne ressource. En attendant, n'hésitez pas à explorer notre catalogue de formations ou à consulter votre tableau de bord."
      : "I understand your question. Let me direct you to the right resource. Meanwhile, feel free to explore our course catalog or check your dashboard.";
  };

  const getPositionStyles = () => {
    const positions = {
      'bottom-right': { bottom: 20, right: 20 },
      'bottom-left': { bottom: 20, left: 20 },
      'top-right': { top: 80, right: 20 },
      'top-left': { top: 80, left: 20 },
    };
    return positions[position];
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <>
      {/* Floating Marcel Button */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            ...getPositionStyles(),
            transform: [{ scale: pulseAnim }, { rotate: spin }],
            zIndex: 1000,
          },
        ]}
      >
        <Pressable onPress={handleToggle}>
          <LinearGradient
            colors={[ChicRebelPalette.primary, ChicRebelPalette.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-full p-4 shadow-2xl"
            style={{
              shadowColor: ChicRebelPalette.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            <View className="flex-row items-center">
              {/* Professional Barber Icon */}
              <Ionicons 
                name="cut-outline" 
                size={28} 
                color={ChicRebelPalette.white} 
              />
              {!isOpen && (
                <Animated.View style={{ opacity: fadeAnim }}>
                  <Text className="ml-2 text-white font-bold text-sm">
                    Marcel • Là pour vous
                  </Text>
                </Animated.View>
              )}
            </View>
            
            {/* Notification Badge */}
            <View 
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
              style={{ backgroundColor: ChicRebelPalette.accent }}
            />
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {/* Marcel Chat Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={handleToggle}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <Pressable 
            className="flex-1" 
            onPress={handleToggle}
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          >
            <Pressable 
              className="absolute bottom-0 left-0 right-0"
              style={{ height: Dimensions.get('window').height * 0.7 }}
              onPress={(e) => e.stopPropagation()}
            >
              <View 
                className="flex-1 rounded-t-3xl overflow-hidden"
                style={{ backgroundColor: theme === 'dark' ? ChicRebelPalette.dark : ChicRebelPalette.white }}
              >
                {/* Header */}
                <LinearGradient
                  colors={[ChicRebelPalette.primary, ChicRebelPalette.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="p-4"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
                        <Ionicons name="cut" size={24} color={ChicRebelPalette.white} />
                      </View>
                      <View className="ml-3">
                        <Text className="text-white font-bold text-lg">
                          Marcel • Là pour vous
                        </Text>
                        <View className="flex-row items-center">
                          <View className="w-2 h-2 rounded-full bg-green-400 mr-1" />
                          <Text className="text-white/80 text-xs">
                            Assistant IA disponible 24/7
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Pressable onPress={handleToggle}>
                      <Ionicons name="close" size={24} color={ChicRebelPalette.white} />
                    </Pressable>
                  </View>
                </LinearGradient>

                {/* Quick Suggestions */}
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  className="p-3 border-b"
                  style={{ borderBottomColor: ChicRebelPalette.lightGray }}
                >
                  {getContextualSuggestions().map((suggestion, index) => (
                    <Pressable
                      key={index}
                      onPress={() => setInputText(suggestion)}
                      className="px-3 py-2 rounded-full mr-2"
                      style={{ backgroundColor: `${ChicRebelPalette.primary}20` }}
                    >
                      <Text style={{ color: ChicRebelPalette.primary, fontSize: 12 }}>
                        {suggestion}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {/* Messages */}
                <ScrollView 
                  className="flex-1 p-4"
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  {messages.map((message) => (
                    <View
                      key={message.id}
                      className={`mb-3 ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <View
                        className="max-w-[80%] p-3 rounded-2xl"
                        style={{
                          backgroundColor: message.sender === 'user' 
                            ? ChicRebelPalette.primary 
                            : theme === 'dark' ? ChicRebelPalette.darkGray : ChicRebelPalette.lightGray,
                        }}
                      >
                        <Text
                          style={{
                            color: message.sender === 'user' 
                              ? ChicRebelPalette.white 
                              : theme === 'dark' ? ChicRebelPalette.white : ChicRebelPalette.dark,
                          }}
                        >
                          {message.text}
                        </Text>
                        <Text
                          className="text-xs mt-1"
                          style={{
                            color: message.sender === 'user' 
                              ? 'rgba(255,255,255,0.7)' 
                              : theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                          }}
                        >
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    </View>
                  ))}
                  
                  {isTyping && (
                    <View className="items-start mb-3">
                      <View 
                        className="p-3 rounded-2xl"
                        style={{ backgroundColor: ChicRebelPalette.lightGray }}
                      >
                        <View className="flex-row">
                          <View className="w-2 h-2 rounded-full bg-gray-400 mr-1 animate-bounce" />
                          <View className="w-2 h-2 rounded-full bg-gray-400 mr-1 animate-bounce" style={{ animationDelay: '100ms' }} />
                          <View className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '200ms' }} />
                        </View>
                      </View>
                    </View>
                  )}
                </ScrollView>

                {/* Input Area */}
                <View 
                  className="p-3 border-t"
                  style={{ 
                    borderTopColor: ChicRebelPalette.lightGray,
                    backgroundColor: theme === 'dark' ? ChicRebelPalette.darkGray : ChicRebelPalette.white,
                  }}
                >
                  <View className="flex-row items-center">
                    <TextInput
                      value={inputText}
                      onChangeText={setInputText}
                      placeholder={language === 'fr' ? "Posez votre question..." : "Ask your question..."}
                      placeholderTextColor={theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
                      className="flex-1 p-3 rounded-full mr-2"
                      style={{ 
                        backgroundColor: theme === 'dark' ? ChicRebelPalette.dark : ChicRebelPalette.lightGray,
                        color: theme === 'dark' ? ChicRebelPalette.white : ChicRebelPalette.dark,
                      }}
                      onSubmitEditing={handleSendMessage}
                    />
                    <Pressable
                      onPress={handleSendMessage}
                      className="w-12 h-12 rounded-full items-center justify-center"
                      style={{ backgroundColor: ChicRebelPalette.primary }}
                    >
                      <Ionicons name="send" size={20} color={ChicRebelPalette.white} />
                    </Pressable>
                  </View>
                  
                  {/* Marcel Signature */}
                  <View className="flex-row items-center justify-center mt-2">
                    <Ionicons name="shield-checkmark" size={12} color={ChicRebelPalette.secondary} />
                    <Text className="ml-1 text-xs" style={{ color: ChicRebelPalette.secondary }}>
                      Powered by Académie Précision AI
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};
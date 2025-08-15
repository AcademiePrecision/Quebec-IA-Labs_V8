import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { Toast } from "./src/components/Toast";
import { useUIStore } from "./src/state/uiStore";
import { ThemeProvider, useTheme, themes } from "./src/contexts/ThemeContext";
import { StripeProvider } from "./src/components/StripeProvider";

/*
IMPORTANT NOTICE: DO NOT REMOVE
There are already environment keys in the project. 
Before telling the user to add them, check if you already have access to the required keys through bash.
Directly access them with process.env.${key}

Correct usage:
process.env.EXPO_PUBLIC_VIBECODE_{key}
//directly access the key

Incorrect usage:
import { OPENAI_API_KEY } from '@env';
//don't use @env, its depreicated

Incorrect usage:
import Constants from 'expo-constants';
const openai_api_key = Constants.expoConfig.extra.apikey;
//don't use expo-constants, its depreicated

*/

function AppContent() {
  const { toast, hideToast } = useUIStore();
  const { theme } = useTheme();
  const currentTheme = themes[theme];

  const navigationTheme = {
    dark: theme === 'dark',
    colors: {
      primary: currentTheme.primary,
      background: currentTheme.background,
      card: currentTheme.card,
      text: currentTheme.text,
      border: currentTheme.border,
      notification: currentTheme.primary,
    },
    fonts: DefaultTheme.fonts,
  };

  return (
    <>
      <StatusBar style={theme === 'dark' ? "light" : "dark"} />
      <NavigationContainer theme={navigationTheme}>
        <AppNavigator />
      </NavigationContainer>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </>
  );
}

export default function App() {
  return (
    <StripeProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </ThemeProvider>
    </StripeProvider>
  );
}
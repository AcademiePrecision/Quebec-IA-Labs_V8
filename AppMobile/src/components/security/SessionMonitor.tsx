import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Alert, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../state/authStore';

interface SessionMonitorProps {
  maxInactivityMinutes?: number;
  warningMinutesBeforeTimeout?: number;
  onSessionExpire?: () => void;
  children?: React.ReactNode;
}

export const SessionMonitor: React.FC<SessionMonitorProps> = ({
  maxInactivityMinutes = 30,
  warningMinutesBeforeTimeout = 5,
  onSessionExpire,
  children,
}) => {
  const { session, logout } = useAuthStore();
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const [showWarning, setShowWarning] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  // Track app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  // Monitor session timeout
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      checkSessionTimeout();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [session, lastActivity]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground - check session
      checkSessionTimeout();
    }
    setAppState(nextAppState);
  };

  const checkSessionTimeout = useCallback(async () => {
    const now = new Date();
    const inactivityMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60);

    // Log security event
    await logSecurityEvent('session_check', {
      inactivityMinutes,
      userId: session?.account.id,
      timestamp: now.toISOString(),
    });

    if (inactivityMinutes >= maxInactivityMinutes) {
      // Session expired
      await logSecurityEvent('session_expired', {
        userId: session?.account.id,
        reason: 'inactivity_timeout',
        inactivityMinutes,
      });
      
      handleSessionExpire();
    } else if (inactivityMinutes >= (maxInactivityMinutes - warningMinutesBeforeTimeout) && !showWarning) {
      // Show warning
      setShowWarning(true);
      showTimeoutWarning(maxInactivityMinutes - inactivityMinutes);
    }
  }, [lastActivity, session, maxInactivityMinutes, warningMinutesBeforeTimeout, showWarning]);

  const handleSessionExpire = () => {
    Alert.alert(
      'Session Expirée',
      'Votre session a expiré pour des raisons de sécurité. Veuillez vous reconnecter.',
      [
        {
          text: 'OK',
          onPress: () => {
            logout();
            onSessionExpire?.();
          },
        },
      ],
      { cancelable: false }
    );
  };

  const showTimeoutWarning = (minutesRemaining: number) => {
    Alert.alert(
      'Session Bientôt Expirée',
      `Votre session expirera dans ${Math.ceil(minutesRemaining)} minutes. Souhaitez-vous continuer?`,
      [
        {
          text: 'Continuer',
          onPress: () => {
            setLastActivity(new Date());
            setShowWarning(false);
            logSecurityEvent('session_extended', {
              userId: session?.account.id,
            });
          },
        },
        {
          text: 'Se déconnecter',
          onPress: () => {
            logout();
            onSessionExpire?.();
          },
          style: 'cancel',
        },
      ]
    );
  };

  const updateActivity = () => {
    setLastActivity(new Date());
    setShowWarning(false);
  };

  // Log security events for audit trail
  const logSecurityEvent = async (eventType: string, data: any) => {
    try {
      const events = await AsyncStorage.getItem('security_events');
      const eventList = events ? JSON.parse(events) : [];
      
      eventList.push({
        type: eventType,
        timestamp: new Date().toISOString(),
        ...data,
      });

      // Keep only last 100 events
      const trimmedEvents = eventList.slice(-100);
      await AsyncStorage.setItem('security_events', JSON.stringify(trimmedEvents));
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  // Touch handler to reset activity
  const handleUserActivity = () => {
    updateActivity();
  };

  return (
    <View onTouchStart={handleUserActivity} style={{ flex: 1 }}>
      {children}
    </View>
  );
};
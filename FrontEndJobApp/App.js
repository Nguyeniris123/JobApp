import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { StatusBar } from 'react-native';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './contexts/AuthContext.js';
import { NotificationProvider } from './contexts/NotificationContext.js';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator.js';
import ProfileScreen from './screens/common/ProfileScreen.js';

// Custom theme with your brand colors
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1E88E5',
    accent: '#FFA000',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    error: '#D32F2F',
    text: '#212121',
    placeholder: '#9E9E9E',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <AuthProvider>
            <NotificationProvider>
              <StatusBar backgroundColor={theme.colors.primary} />
              <AppNavigator />
            </NotificationProvider>
          </AuthProvider>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
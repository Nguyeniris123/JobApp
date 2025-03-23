import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';


// Candidate Screens
import JobListScreen from '../screens/candidate/JobListScreen';
import JobDetailScreen from '../screens/candidate/JobDetailScreen';


import { AuthContext } from '../contexts/AuthContext';

const Stack = createStackNavigator();
const Tab = createMaterialBottomTabNavigator();

// Auth Navigator
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
  </Stack.Navigator>
);

// Admin Tab Navigator
const AdminTabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      activeColor={theme.colors.primary}
      barStyle={{ backgroundColor: theme.colors.surface }}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Verifications"
        component={VerificationRequestsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="check-decagram-outline" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Users"
        component={ManageUsersScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-cog-outline" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="bell-outline" color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main Navigator
const MainNavigator = () => {
  const { user } = useContext(AuthContext);

  return (
    <Stack.Navigator>
      {user.role === 'candidate' && (
        <>
          <Stack.Screen
            name="CandidateHome"
            component={CandidateTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="JobDetail" component={JobDetailScreen} />
          <Stack.Screen name="ChatDetail" component={ChatScreen} />
        </>
      )}

      {user.role === 'admin' && (
        <>
          <Stack.Screen
            name="AdminHome"
            component={AdminTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="ChatDetail" component={ChatScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
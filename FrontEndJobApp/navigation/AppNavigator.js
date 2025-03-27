import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { useTheme } from 'react-native-paper';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';

// Common Screens
// import ChatListScreen from '../screens/common/ChatListScreen';
// import ChatScreen from '../screens/common/ChatScreen';
import NotificationsScreen from '../screens/common/NotificationsScreen';
import ProfileScreen from '../screens/common/ProfileScreen';

// Candidate Screens
import ApplicationsScreen from '../screens/candidate/ApplicationsScreen';
import JobDetailScreen from '../screens/candidate/JobDetailScreen';
import JobListScreen from '../screens/candidate/JobListScreen';
import SavedJobsScreen from '../screens/candidate/SavedJobsScreen';

// Recruiter Screens
import ApplicantsScreen from '../screens/recruiter/ApplicantsScreen';
import CompanyProfileScreen from '../screens/recruiter/CompanyProfileScreen';
import ManageJobsScreen from '../screens/recruiter/ManageJobsScreen';
import PostJobScreen from '../screens/recruiter/PostJobScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
// import ManageUsersScreen from '../screens/admin/ManageUsersScreen';
import VerificationRequestsScreen from '../screens/admin/VerificationRequestsScreen';

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

// Candidate Tab Navigator
const CandidateTabNavigator = () => {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      initialRouteName="Jobs"
      activeColor={theme.colors.primary}
      barStyle={{ backgroundColor: theme.colors.surface }}
    >
      <Tab.Screen 
        name="Jobs" 
        component={JobListScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="briefcase-search" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen 
        name="Applications" 
        component={ApplicationsScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="file-document-outline" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen 
        name="Saved" 
        component={SavedJobsScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="bookmark-outline" color={color} size={24} />
          ),
        }}
      />
      {/* <Tab.Screen 
        name="Chat" 
        component={ChatListScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chat-outline" color={color} size={24} />
          ),
        }}
      /> */}
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-outline" color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Recruiter Tab Navigator
const RecruiterTabNavigator = () => {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      initialRouteName="ManageJobs"
      activeColor={theme.colors.primary}
      barStyle={{ backgroundColor: theme.colors.surface }}
    >
      <Tab.Screen 
        name="ManageJobs" 
        component={ManageJobsScreen} 
        options={{
          tabBarLabel: 'Jobs',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="briefcase-outline" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen 
        name="PostJob" 
        component={PostJobScreen} 
        options={{
          tabBarLabel: 'Post Job',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="plus-circle-outline" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen 
        name="Applicants" 
        component={ApplicantsScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-group-outline" color={color} size={24} />
          ),
        }}
      />
      {/* <Tab.Screen 
        name="Chat" 
        component={ChatListScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chat-outline" color={color} size={24} />
          ),
        }}
      /> */}
      <Tab.Screen 
        name="Company" 
        component={CompanyProfileScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="domain" color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

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
          {/* <Stack.Screen name="ChatDetail" component={ChatScreen} /> */}
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </>
      )}
      
      {user.role === 'recruiter' && (
        <>
          <Stack.Screen
            name="RecruiterHome"
            component={RecruiterTabNavigator}
            options={{ headerShown: false }}
          />
          {/* <Stack.Screen name="ChatDetail" component={ChatScreen} /> */}
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </>
      )}
      
      {user.role === 'admin' && (
        <>
          <Stack.Screen 
            name="AdminHome" 
            component={AdminTabNavigator} 
            options={{ headerShown: false }}
          />
          {/* <Stack.Screen name="ChatDetail" component={ChatScreen} /> */}
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
        <Stack.Screen name="Auth" component={AuthNavigator} options={{ animationEnabled: false }}/>
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
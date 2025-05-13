import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Text, View } from "react-native";

import EditProfileScreen from "../screen/common/EditProfileScreen";
import ApplicationListScreen from "../screen/recruiter/ApplicationListScreen";
import ChatListScreen from "../screen/recruiter/ChatListScreen";
import ChatScreen from "../screen/recruiter/ChatScreen";
import CompanyProfileScreen from "../screen/recruiter/CompanyProfileScreen";
import FavoriteCandidatesScreen from "../screen/recruiter/FavoriteCandidatesScreen";
import HomeScreen from "../screen/recruiter/HomeScreen";
import JobDetailScreen from "../screen/recruiter/JobDetailScreen";
import MyReviewsScreen from "../screen/recruiter/MyReviewsScreen"; // Thêm import này
import PostJobScreen from "../screen/recruiter/PostJobScreen";
import ReviewScreen from "../screen/recruiter/ReviewScreen";
import SettingsScreen from "../screen/recruiter/SettingsScreen";

const Tab = createBottomTabNavigator()
const TopTab = createMaterialTopTabNavigator()
const Stack = createStackNavigator()

// Custom TabBar Label with Icon
const TabBarLabel = ({ label, focused, color, icon }) => (
    <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8
    }}>
        <MaterialCommunityIcons 
            name={icon} 
            size={18} 
            color={color}
            style={{ marginRight: 6 }}
        />
        <Text style={{ 
            color, 
            fontSize: 14, 
            fontWeight: focused ? "600" : "400"
        }}>
            {label}
        </Text>
    </View>
);

const HomeStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="PostJob" component={PostJobScreen} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="Review" component={ReviewScreen} />
        </Stack.Navigator>
    )
}

// Tabbed view for Candidates and Messages
const CandidateTabs = () => {
    return (
        <TopTab.Navigator
            screenOptions={{
                tabBarActiveTintColor: "#1E88E5",
                tabBarInactiveTintColor: "#757575",
                tabBarIndicatorStyle: { backgroundColor: "#1E88E5" },
                tabBarLabelStyle: { 
                    textTransform: "none",
                    display: 'none' // Hide default labels
                },
                tabBarStyle: { 
                    elevation: 0,
                    shadowOpacity: 0,
                    backgroundColor: "#FFFFFF" 
                },
            }}
        >
            <TopTab.Screen 
                name="CandidateList" 
                component={ApplicationListScreen} 
                options={{ 
                    tabBarLabel: ({ focused, color }) => (
                        <TabBarLabel 
                            label="Hồ sơ ứng tuyển" 
                            focused={focused} 
                            color={color} 
                            icon="account-group" 
                        />
                    )
                }} 
            />
            <TopTab.Screen 
                name="ChatList" 
                component={ChatListScreen}
                options={{ 
                    tabBarLabel: ({ focused, color }) => (
                        <TabBarLabel 
                            label="Tin nhắn" 
                            focused={focused} 
                            color={color} 
                            icon="chat" 
                        />
                    )
                }} 
            />
        </TopTab.Navigator>
    )
};

const CandidateStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
            }}
        >
            <Stack.Screen 
                name="CandidateTabs" 
                component={CandidateTabs} 
                options={{
                    title: "Quản lý ứng viên",
                    headerStyle: { elevation: 0, shadowOpacity: 0 }
                }}
            />
            <Stack.Screen 
                name="FavoriteCandidates" 
                component={FavoriteCandidatesScreen} 
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen 
                name="Chat" 
                component={ChatScreen} 
                options={{
                    headerShown: false
                }}
            />
        </Stack.Navigator>
    )
}

const ProfileStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="MyReviews" component={MyReviewsScreen} />
        </Stack.Navigator>
    )
}

const RecruiterNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false, // Hide the tab navigation headers
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName

                    if (route.name === "HomeTab") {
                        iconName = focused ? "briefcase" : "briefcase-outline"
                    } else if (route.name === "CandidateTab") {
                        iconName = focused ? "account-group" : "account-group-outline"
                    } else if (route.name === "NotificationTab") {
                        iconName = focused ? "bell" : "bell-outline"
                    } else if (route.name === "ProfileTab") {
                        iconName = focused ? "domain" : "domain"
                    }

                    return <MaterialCommunityIcons name={iconName} size={size} color={color} />
                },
            })}
            tabBarOptions={{
                activeTintColor: "#1E88E5",
                inactiveTintColor: "gray",
            }}
        >
            <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: "Tin tuyển dụng" }} />
            <Tab.Screen name="CandidateTab" component={CandidateStack} options={{ tabBarLabel: "Ứng viên" }} />
            <Tab.Screen name="NotificationTab" component={FavoriteCandidatesScreen} options={{ tabBarLabel: "Thông báo" }} />
            <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ tabBarLabel: "Công ty" }} />
        </Tab.Navigator>
    )
}

export default RecruiterNavigator


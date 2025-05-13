import { MaterialCommunityIcons } from "@expo/vector-icons"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { Text, View } from "react-native"

// Screens
import ApplicationStatusScreen from "../screen/candidate/ApplicationStatusScreen"
import ApplyScreen from "../screen/candidate/ApplyScreen"
import ChatListScreen from "../screen/candidate/ChatListScreen"
import ChatScreen from "../screen/candidate/ChatScreen.new.js"
import CreateReviewScreen from "../screen/candidate/CreateReviewScreen"
import FollowingScreen from "../screen/candidate/FollowingScreen"
import HomeScreen from "../screen/candidate/HomeScreen"
import JobDetailScreen from "../screen/candidate/JobDetailScreen"
import MyReviewsScreen from "../screen/candidate/MyReviewsScreen"
import ProfileScreen from "../screen/candidate/ProfileScreen"
import SettingsScreen from "../screen/candidate/SettingsScreen"
import EditProfileScreen from "../screen/common/EditProfileScreen"

const Tab = createBottomTabNavigator()
const TopTab = createMaterialTopTabNavigator()
const Stack = createStackNavigator()

// Define a common navigationRef that can be used for direct navigation 
// from anywhere in the app, if needed in the future
import { createNavigationContainerRef } from '@react-navigation/native'
export const navigationRef = createNavigationContainerRef()

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

// Tabs for Notification section (Favorite and Chat)
const NotificationTabs = () => {
    return (
        <TopTab.Navigator
            screenOptions={{
                tabBarActiveTintColor: "#1E88E5",
                tabBarInactiveTintColor: "#757575",
                tabBarIndicatorStyle: { backgroundColor: "#1E88E5" },
                tabBarLabelStyle: { 
                    textTransform: "none",
                    display: 'none' // Hide default labels since we use custom ones
                },
                tabBarStyle: { 
                    elevation: 0,
                    shadowOpacity: 0,
                    backgroundColor: "#FFFFFF" 
                },
            }}
        >
            <TopTab.Screen 
                name="Favorite" 
                component={FollowingScreen} 
                options={{ 
                    tabBarLabel: ({ focused, color }) => (
                        <TabBarLabel 
                            label="Đã lưu" 
                            focused={focused} 
                            color={color} 
                            icon="heart" 
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
}

const HomeStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
            initialRouteName="Home"
        >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="Apply" component={ApplyScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="CreateReview" component={CreateReviewScreen} />
        </Stack.Navigator>
    )
}

const FavoriteStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="ApplicationStatus" component={ApplicationStatusScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
    )
}

const NotificationStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
            }}
        >
            <Stack.Screen 
                name="NotificationTabs" 
                component={NotificationTabs} 
                options={{
                    title: "Thông báo & Tin nhắn",
                    headerStyle: { elevation: 0, shadowOpacity: 0 }
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
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="MyReviews" component={MyReviewsScreen} />
        </Stack.Navigator>
    )
}

const CandidateNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false, // Hide the tab navigation headers
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName

                    if (route.name === "HomeTab") {
                        iconName = focused ? "home" : "home-outline"
                    } else if (route.name === "FavoriteTab") {
                        iconName = focused ? "heart" : "heart-outline"
                    } else if (route.name === "NotificationTab") {
                        iconName = focused ? "bell" : "bell-outline"
                    } else if (route.name === "ProfileTab") {
                        iconName = focused ? "account" : "account-outline"
                    }

                    return <MaterialCommunityIcons name={iconName} size={size} color={color} />
                },
            })}
            tabBarOptions={{
                activeTintColor: "#1E88E5",
                inactiveTintColor: "gray",
            }}
        >
            <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: "Trang chủ" }} />
            <Tab.Screen name="FavoriteTab" component={FavoriteStack} options={{ tabBarLabel: "Yêu thích" }} />
            <Tab.Screen name="NotificationTab" component={NotificationStack} options={{ tabBarLabel: "Thông báo" }} />
            <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ tabBarLabel: "Hồ sơ" }} />
        </Tab.Navigator>
    )
}

export default CandidateNavigator


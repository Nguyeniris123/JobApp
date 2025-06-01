import { MaterialCommunityIcons } from "@expo/vector-icons"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { useContext } from "react"
import { Text, View } from "react-native"
import { ApplicationContext } from "../contexts/ApplicationContext"

// Screens
import LoginScreen from "../screen/auth/LoginScreen"
import ApplicationDetailScreen from "../screen/candidate/ApplicationDetailScreen"
import ApplicationStatusScreen from "../screen/candidate/ApplicationStatusScreen"
import ApplyScreen from "../screen/candidate/ApplyScreen"
import ChatListScreenSimple from "../screen/candidate/ChatListScreenSimple"
import ChatScreenSimple from "../screen/candidate/ChatScreenSimple"
import CreateReviewScreen from "../screen/candidate/CreateReviewScreen"
import FollowingScreen from "../screen/candidate/FollowingScreen"
import HomeScreen from "../screen/candidate/HomeScreen"
import JobDetailScreen from "../screen/candidate/JobDetailScreen"
import MyReviewsScreen from "../screen/candidate/MyReviewsScreen"
import ProfileScreen from "../screen/candidate/ProfileScreen"
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
    const { loading: loadingApplications } = useContext(ApplicationContext);
    const isLoading = loadingApplications;
    return (
        <TopTab.Navigator
            screenOptions={({ route }) => ({
                tabBarActiveTintColor: "#1E88E5",
                tabBarInactiveTintColor: "#757575",
                tabBarIndicatorStyle: { backgroundColor: "#1E88E5" },
                // KHÔNG dùng tabBarShowLabel: false để label custom hoạt động
                tabBarStyle: {
                    elevation: 0,
                    shadowOpacity: 0,
                    backgroundColor: "#FFFFFF"
                },
                tabBarLabel: (props) => {
                    if (route.name === "ApplicationStatus") {
                        return <TabBarLabel label="Trạng thái" icon="application" {...props} />;
                    }
                    if (route.name === "ChatList") {
                        return <TabBarLabel label="Tin nhắn" icon="chat" {...props} />;
                    }
                    return null;
                },
                tabBarPressColor: isLoading ? "#E0E0E0" : undefined,
                tabBarPressOpacity: isLoading ? 1 : undefined,
            })}
            screenListeners={{
                tabPress: (e) => {
                    if (isLoading) {
                        e.preventDefault();
                    }
                }
            }}
        >
            <TopTab.Screen name="ApplicationStatus" component={ApplicationStatusScreen} />
            <TopTab.Screen name="ChatList" component={ChatListScreenSimple} />
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
            <Stack.Screen name="ApplyScreen" component={ApplyScreen} />
            <Stack.Screen name="Chat" component={ChatScreenSimple} />
            <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
    )
}


const FavoriteStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
            }}>
            <Stack.Screen name="Favorite" component={FollowingScreen} />
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
                    title: "Trạng thái & Tin nhắn",
                    headerStyle: { elevation: 0, shadowOpacity: 0 }
                }} />
            <Stack.Screen
                name="Chat"
                component={ChatScreenSimple}
                options={{
                    headerShown: false
                }} />
            <Stack.Screen name="CreateReview" component={CreateReviewScreen} />
            <Stack.Screen name="ApplicationDetail" component={ApplicationDetailScreen} />
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
                        iconName = focused ? "chat" : "chat-outline"
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
            <Tab.Screen name="FavoriteTab" component={FavoriteStack} options={{ tabBarLabel: "Đã lưu" }} />
            <Tab.Screen name="NotificationTab" component={NotificationStack} options={{ tabBarLabel: "Tin nhắn", unmountOnBlur: true }} />
            <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ tabBarLabel: "Hồ sơ" }} />
        </Tab.Navigator>
    )
}

export default CandidateNavigator


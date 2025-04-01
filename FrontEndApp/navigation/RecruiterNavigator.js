import { MaterialCommunityIcons } from "@expo/vector-icons"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"

import CandidateListScreen from "../screen/recruiter/CandidateListScreen"
import ChatScreen from "../screen/recruiter/ChatScreen"
import CompanyProfileScreen from "../screen/recruiter/CompanyProfileScreen"
import FavoriteCandidatesScreen from "../screen/recruiter/FavoriteCandidatesScreen"
import HomeScreen from "../screen/recruiter/HomeScreen"
import JobDetailScreen from "../screen/recruiter/JobDetailScreen"
import NotificationScreen from "../screen/recruiter/NotificationScreen"
import PostJobScreen from "../screen/recruiter/PostJobScreen"
import ReviewScreen from "../screen/recruiter/ReviewScreen"
import SettingsScreen from "../screen/recruiter/SettingsScreen"

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

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

const CandidateStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="CandidateList" component={CandidateListScreen} />
            <Stack.Screen name="FavoriteCandidates" component={FavoriteCandidatesScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
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
            <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
    )
}

const RecruiterNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
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
            <Tab.Screen name="NotificationTab" component={NotificationScreen} options={{ tabBarLabel: "Thông báo" }} />
            <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ tabBarLabel: "Công ty" }} />
        </Tab.Navigator>
    )
}

export default RecruiterNavigator


import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useEffect, useState } from "react";

// Screens
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import FavoriteScreen from "../screens/candidate/FavoriteScreen";
import HomeScreen from "../screens/candidate/HomeScreen";
import NotificationScreen from "../screens/candidate/NotificationScreen";
import OnboardingScreen from "../screens/common/OnboardingScreen";
import SettingScreen from "../screens/common/SettingScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 🔹 BOTTOM NAVIGATION
const BottomTabs = () => {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Favorite"
                component={FavoriteScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="heart" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Notification"
                component={NotificationScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="bell" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Setting"
                component={SettingScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="cog" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

// 🔹 STACK NAVIGATION
const AuthNavigator = () => {
    const [isFirstLaunch, setIsFirstLaunch] = useState(null);

    useEffect(() => {
        const checkOnboarding = async () => {
            const hasSeen = await AsyncStorage.getItem("hasSeenOnboarding");
            setIsFirstLaunch(hasSeen === null);
        };
        checkOnboarding();
    }, []);

    if (isFirstLaunch === null) return null; // Đợi kiểm tra AsyncStorage

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isFirstLaunch ? (
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            ) : (
                <Stack.Screen name="BottomTabs" component={BottomTabs} />
            )}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </Stack.Navigator>
    );
};

export default AuthNavigator;

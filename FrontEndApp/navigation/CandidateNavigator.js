import { MaterialCommunityIcons } from "@expo/vector-icons"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"

// Screens
// import ApplicationStatusScreen from "../screen/candidate/ApplicationStatusScreen"
// import ApplyScreen from "../screen/candidate/ApplyScreen"
// import ChatScreen from "../screen/candidate/ChatScreen"
import FavoriteScreen from "../screen/candidate/FavoriteScreen"
import HomeScreen from "../screen/candidate/HomeScreen"
import JobDetailScreen from "../screen/candidate/JobDetailScreen"
import NotificationScreen from "../screen/candidate/NotificationScreen"
import ProfileScreen from "../screen/candidate/ProfileScreen"
import SettingsScreen from "../screen/candidate/SettingsScreen"

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
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            {/* <Stack.Screen name="Apply" component={ApplyScreen} /> */}
            {/* <Stack.Screen name="ApplicationStatus" component={ApplicationStatusScreen} /> */}
            {/* <Stack.Screen name="Chat" component={ChatScreen} /> */}
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
        </Stack.Navigator>
    )
}

const CandidateNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
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
            <Tab.Screen name="FavoriteTab" component={FavoriteScreen} options={{ tabBarLabel: "Yêu thích" }} />
            <Tab.Screen name="NotificationTab" component={NotificationScreen} options={{ tabBarLabel: "Thông báo" }} />
            <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ tabBarLabel: "Hồ sơ" }} />
        </Tab.Navigator>
    )
}

export default CandidateNavigator


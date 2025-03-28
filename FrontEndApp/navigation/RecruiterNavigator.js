import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useMemo } from "react";

// Screens
// import ChatScreen from "../screens/recruiter/ChatScreen";
import NotificationScreen from "../screens/recruiter/NotificationScreen";
// import ReviewScreen from "../screens/recruiter/ReviewScreen";

const Tab = createBottomTabNavigator();
// const Stack = createStackNavigator();

// Component tái sử dụng cho Stack
// const StackScreen = ({ children }) => (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//         {children}
//     </Stack.Navigator>
// );

// Home Stack
// const HomeStack = () => (
//     <StackScreen>
//         <Stack.Screen name="Home" component={HomeScreen} />
//         <Stack.Screen name="PostJob" component={PostJobScreen} />
//         <Stack.Screen name="JobDetail" component={JobDetailScreen} />
//         {/* <Stack.Screen name="Review" component={ReviewScreen} /> */}
//     </StackScreen>
// );

// Candidate Stack
// const CandidateStack = () => (
//     <StackScreen>
//         <Stack.Screen name="CandidateList" component={CandidateListScreen} />
//         <Stack.Screen name="FavoriteCandidates" component={FavoriteCandidatesScreen} />
//         {/* <Stack.Screen name="Chat" component={ChatScreen} /> */}
//     </StackScreen>
// );

// Profile Stack
// const ProfileStack = () => (
//     <StackScreen>
//         <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} />
//         <Stack.Screen name="Settings" component={SettingsScreen} />
//     </StackScreen>
// );

// Recruiter Navigator
const RecruiterNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => {
                // Tối ưu `tabBarIcon` bằng `useMemo`
                const getIcon = useMemo(() => {
                    return {
                        Home: (focused) => (focused ? "briefcase" : "briefcase-outline"),
                        Candidates: (focused) => (focused ? "account-group" : "account-group-outline"),
                        Notifications: (focused) => (focused ? "bell" : "bell-outline"),
                        Company: () => "domain", // Không thay đổi khi focus
                    };
                }, []);

                return {
                    tabBarIcon: ({ focused, color, size }) => (
                        <MaterialCommunityIcons name={getIcon[route.name](focused)} size={size} color={color} />
                    ),
                    tabBarActiveTintColor: "#1E88E5",
                    tabBarInactiveTintColor: "gray",
                };
            }}
        >
            {/* <Tab.Screen name="Home" component={HomeStack} options={{ tabBarLabel: "Tin tuyển dụng" }} /> */}
            {/* <Tab.Screen name="Candidates" component={CandidateStack} options={{ tabBarLabel: "Ứng viên" }} /> */}
            <Tab.Screen name="Notifications" component={NotificationScreen} options={{ tabBarLabel: "Thông báo" }} />
            {/* <Tab.Screen name="Company" component={ProfileStack} options={{ tabBarLabel: "Công ty" }} /> */}
        </Tab.Navigator>
    );
};

export default RecruiterNavigator;

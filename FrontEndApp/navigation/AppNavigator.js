import { createStackNavigator } from "@react-navigation/stack";
import { useContext } from "react";
import { View } from "react-native";
import { AuthContext } from "../contexts/AuthContext";

// Navigators
import AuthNavigator from "./AuthNavigator";
import CandidateNavigator from "./CandidateNavigator";
import RecruiterNavigator from "./RecruiterNavigator";

// Screens
import SplashScreen from "../screen/common/SplashScreen";


const Stack = createStackNavigator();

const AppNavigator = () => {
    const { isAuthenticated, role, loading } = useContext(AuthContext);

    console.log("isAuthenticated:", isAuthenticated);
    console.log("role:", role);
    console.log("loading:", loading);

    if (loading) {
        return <SplashScreen />;    } 
    
    return (
        <View style={{ flex: 1 }}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                ) : role === "recruiter" ? (
                    <Stack.Screen name="Recruiter" component={RecruiterNavigator} />
                ) : (
                    <Stack.Screen name="Candidate" component={CandidateNavigator} />
                )}
            </Stack.Navigator>
        </View>
    );
};

export default AppNavigator;


import { createStackNavigator } from "@react-navigation/stack";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

// Navigators
import AuthNavigator from "./AuthNavigator";
import CandidateNavigator from "./CandidateNavigator";
// import RecruiterNavigator from "./RecruiterNavigator"

// Screens
import SplashScreen from "../screen/common/SplashScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
    const { isAuthenticated, user, loading } = useContext(AuthContext);

    if (loading) {
        return <SplashScreen />;
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
                <Stack.Screen name="Auth" component={AuthNavigator} />
            ) : user?.role === "Recruiter" ? (
                <Stack.Screen name="Recruiter" component={RecruiterNavigator} />
            ) : (
                <Stack.Screen name="Candidate" component={CandidateNavigator} />
            )}
        </Stack.Navigator>
    );
};

export default AppNavigator;

import { createStackNavigator } from "@react-navigation/stack";
import { useContext } from "react";
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
        return <SplashScreen />;
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
                <>
                    {console.log("Navigating to AuthNavigator")}
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                </>
            ) : role === "recruiter" ? (
                <>
                    {console.log("Navigating to RecruiterNavigator")}
                    <Stack.Screen name="Recruiter" component={RecruiterNavigator} />
                </>
            ) : (
                <>
                    {console.log("Navigating to CandidateNavigator")}
                    <Stack.Screen name="Candidate" component={CandidateNavigator} />
                </>
            )}
        </Stack.Navigator>
    );
};

export default AppNavigator;


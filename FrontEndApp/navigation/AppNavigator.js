// import { createStackNavigator } from "@react-navigation/stack";
// import React from "react";
// import ForgotPasswordScreen from "../screen/auth/ForgotPasswordScreen";
// import LoginScreen from "../screen/auth/LoginScreen";
// import RegisterScreen from "../screen/auth/RegisterScreen";
// import ApplicationsScreen from "../screen/candidate/ApplicationsScreen";
// import JobDetailScreen from "../screen/candidate/JobDetailScreen";
// import SettingScreen from "../screen/common/SettingScreen";

// const Stack = createStackNavigator();

// const AppNavigator = () => {
//     return (
//             <Stack.Navigator screenOptions={{ headerShown: false }}>
//                 <Stack.Screen name="Login" component={LoginScreen} />
//                 <Stack.Screen name="Setting" component={SettingScreen}/>
//                 <Stack.Screen name="Register" component={RegisterScreen} />
//                 <Stack.Screen name="Applications" component={ApplicationsScreen}/>
//                 <Stack.Screen name="JobDetail" component={JobDetailScreen}/>
//                 <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}/>
//             </Stack.Navigator>
//     );
// };

// export default AppNavigator;

import { createStackNavigator } from "@react-navigation/stack"
import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"

// Navigators
import AuthNavigator from "./AuthNavigator"
import CandidateNavigator from "./CandidateNavigator"
import RecruiterNavigator from "./RecruiterNavigator"

// Screens
import SplashScreen from "../screens/common/SplashScreen"

const Stack = createStackNavigator()

const AppNavigator = () => {
    const { state } = useContext(AuthContext)
    const { isLoading, userToken, userType } = state

    if (isLoading) {
        return <SplashScreen />
    }

    return (
        <Stack.Navigator headerMode="none">
            {userToken === null ? (
                <Stack.Screen name="Auth" component={AuthNavigator} />
            ) : userType === "candidate" ? (
                <Stack.Screen name="Candidate" component={CandidateNavigator} />
            ) : userType === "recruiter" ? (
                <Stack.Screen name="Recruiter" component={RecruiterNavigator} />
            ) : (
                <Stack.Screen name="Auth" component={AuthNavigator} />
            )}
        </Stack.Navigator>
    )
}

export default AppNavigator

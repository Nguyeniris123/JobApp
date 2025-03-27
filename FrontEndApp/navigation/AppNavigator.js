import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import ForgotPasswordScreen from "../screen/auth/ForgotPasswordScreen";
import LoginScreen from "../screen/auth/LoginScreen";
import RegisterScreen from "../screen/auth/RegisterScreen";
import ApplicationsScreen from "../screen/candidate/ApplicationsScreen";
import JobDetailScreen from "../screen/candidate/JobDetailScreen";
import SettingScreen from "../screen/common/SettingScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Setting" component={SettingScreen}/>
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Applications" component={ApplicationsScreen}/>
                <Stack.Screen name="JobDetail" component={JobDetailScreen}/>
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}/>
            </Stack.Navigator>
    );
};

export default AppNavigator;
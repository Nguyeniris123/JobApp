import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "./contexts/AuthContext";
import AppNavigator from "./navigation/AppNavigator";

const Stack = createStackNavigator();

const App = () => {
    return (
        <PaperProvider>
            <AuthProvider>
                <NavigationContainer>
                    <AppNavigator />
                </NavigationContainer>
            </AuthProvider>
        </PaperProvider>
    );
};

export default App;
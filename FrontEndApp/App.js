import { NavigationContainer } from "@react-navigation/native"
import { StatusBar } from "react-native"
import { Provider as PaperProvider } from "react-native-paper"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { AuthProvider } from "./contexts/AuthContext"
import { JobProvider } from "./contexts/JobContext"
import { NotificationProvider } from "./contexts/NotificationContext"
import AppNavigator from "./navigation/AppNavigator"
import { theme } from "./theme"


const App = () => {
    return (
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
                <AuthProvider>
                    <JobProvider>
                        <NotificationProvider>
                            <NavigationContainer>
                                <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
                                <AppNavigator />
                            </NavigationContainer>
                        </NotificationProvider>
                    </JobProvider>
                </AuthProvider>
            </PaperProvider>
        </SafeAreaProvider>
    )
};

export default App;
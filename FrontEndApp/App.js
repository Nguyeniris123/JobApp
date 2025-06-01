import { NavigationContainer } from "@react-navigation/native"
import { LogBox, StatusBar } from "react-native"
import { Provider as PaperProvider } from "react-native-paper"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { ApplicationProvider } from "./contexts/ApplicationContext"
import { AuthProvider } from "./contexts/AuthContext"
import { CompanyProvider } from "./contexts/CompanyContext"
import { JobProvider } from "./contexts/JobContext"
import AppNavigator from "./navigation/AppNavigator"
import { theme } from "./theme"

LogBox.ignoreLogs(['Text strings must be rendered within a <Text>']);

const App = () => {
    return (
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
                <AuthProvider>
                    <JobProvider>
                        <CompanyProvider>
                            <ApplicationProvider>
                                <NavigationContainer>
                                    <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
                                    <AppNavigator />
                                </NavigationContainer>
                            </ApplicationProvider>
                        </CompanyProvider>
                    </JobProvider>
                </AuthProvider>
            </PaperProvider>
        </SafeAreaProvider>
    )
};

export default App;
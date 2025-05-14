import { SafeAreaView, StatusBar, View } from 'react-native';

const ScreenContainer = ({ children, style, ...props }) => {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <StatusBar barStyle="dark-content" />
            <View style={[{ flex: 1 }, style]} {...props}>
                {children}
            </View>
        </SafeAreaView>
    );
};

export default ScreenContainer;
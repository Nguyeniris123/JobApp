import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const ScreenContainer = ({
    children,
    style,
    safeArea = true,
    statusBarColor = null,
    statusBarStyle = 'dark-content'
}) => {
    const theme = useTheme();
    const barColor = statusBarColor || theme.colors.background;

    const Container = safeArea ? SafeAreaView : View;

    return (
        <Container style={[styles.container, style]}>
            <StatusBar backgroundColor={barColor} barStyle={statusBarStyle} />
            {children}
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
});

export default ScreenContainer;
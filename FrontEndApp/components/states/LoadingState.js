import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

const LoadingState = ({
    message = 'Loading...',
    size = 'large',
    style,
}) => {
    const theme = useTheme();

    return (
        <View style={[styles.container, style]}>
            <ActivityIndicator size={size} color={theme.colors.primary} />
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    message: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
});

export default LoadingState;
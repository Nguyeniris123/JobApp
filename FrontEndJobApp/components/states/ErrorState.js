import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

const ErrorState = ({
    message = 'Something went wrong',
    onRetry,
    retryButtonText = 'Retry',
    icon = 'alert-circle-outline',
    iconSize = 60,
    iconColor = '#F44336',
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            <MaterialCommunityIcons name={icon} size={iconSize} color={iconColor} />
            <Text style={styles.message}>{message}</Text>
            {onRetry && (
                <Button
                    mode="contained"
                    onPress={onRetry}
                    style={styles.button}
                >
                    {retryButtonText}
                </Button>
            )}
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
        marginBottom: 20,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    button: {
        marginTop: 10,
    },
});

export default ErrorState;
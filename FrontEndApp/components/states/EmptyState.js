import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

const EmptyState = ({
    title = 'No data found',
    message = 'There is no data to display',
    icon = 'information-outline',
    iconSize = 60,
    iconColor = '#BDBDBD',
    buttonText,
    onButtonPress,
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            <MaterialCommunityIcons name={icon} size={iconSize} color={iconColor} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            {buttonText && onButtonPress && (
                <Button
                    mode="contained"
                    onPress={onButtonPress}
                    style={styles.button}
                >
                    {buttonText}
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
    title: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: 'bold',
    },
    message: {
        marginTop: 8,
        marginBottom: 20,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    button: {
        marginTop: 10,
    },
});

export default EmptyState;
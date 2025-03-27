import React from 'react';
import { StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';

const AppCard = ({
    style,
    contentStyle,
    onPress,
    children
}) => {
    return (
        <Card
            style={[styles.card, style]}
            onPress={onPress}
        >
            <Card.Content style={contentStyle}>
                {children}
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 8,
        elevation: 2,
    },
});

export default AppCard;
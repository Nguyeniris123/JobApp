import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, IconButton, Text } from 'react-native-paper';

const NotificationItem = ({
    notification,
    onPress,
    onDismiss,
    style,
}) => {
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'application_status':
                return 'file-document-outline';
            case 'new_message':
                return 'chat-outline';
            case 'new_job':
                return 'briefcase-outline';
            case 'company_verification':
                return 'check-decagram-outline';
            default:
                return 'bell-outline';
        }
    };

    return (
        <Card
            style={[
                styles.card,
                !notification.is_read && styles.unreadCard,
                style
            ]}
            onPress={onPress}
        >
            <Card.Content style={styles.cardContent}>
                <View style={styles.iconContainer}>
                    <Avatar.Icon
                        size={40}
                        icon={getNotificationIcon(notification.type)}
                        style={{ backgroundColor: notification.is_read ? '#e0e0e0' : '#1E88E5' }}
                    />
                    {!notification.is_read && <View style={styles.unreadDot} />}
                </View>

                <View style={styles.contentContainer}>
                    <Text style={styles.title}>{notification.title}</Text>
                    <Text style={styles.message}>{notification.message}</Text>
                    <Text style={styles.time}>
                        {new Date(notification.created_at).toLocaleString()}
                    </Text>
                </View>

                <IconButton
                    icon="close"
                    size={20}
                    onPress={onDismiss}
                    style={styles.closeButton}
                />
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 4,
        elevation: 1,
        borderRadius: 8,
    },
    unreadCard: {
        backgroundColor: '#f0f8ff',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        position: 'relative',
        marginRight: 12,
    },
    unreadDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'red',
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    closeButton: {
        margin: 0,
    },
});

export default NotificationItem;
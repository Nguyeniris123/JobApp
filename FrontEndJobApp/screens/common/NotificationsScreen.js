// screens/common/NotificationsScreen.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { API_URL } from '../../config';

// Import components
import NotificationItem from '../../components/business/NotificationItem';
import ScreenContainer from '../../components/layout/ScreenContainer';
import ScreenHeader from '../../components/layout/ScreenHeader';
import EmptyState from '../../components/states/EmptyState';
import ErrorState from '../../components/states/ErrorState';
import LoadingState from '../../components/states/LoadingState';

const NotificationsScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const theme = useTheme();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/notifications/`);
            setNotifications(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setError('Failed to load notifications. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.patch(`${API_URL}/api/notifications/${notificationId}/`, {
                is_read: true
            });

            // Update local state
            setNotifications(notifications.map(notification =>
                notification.id === notificationId
                    ? { ...notification, is_read: true }
                    : notification
            ));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleNotificationPress = (notification) => {
        // Mark as read
        if (!notification.is_read) {
            markAsRead(notification.id);
        }

        // Navigate based on notification type
        switch (notification.type) {
            case 'application_status':
                navigation.navigate('Applications');
                break;
            case 'new_message':
                if (notification.data?.room_id) {
                    navigation.navigate('ChatDetail', { roomId: notification.data.room_id });
                } else {
                    navigation.navigate('ChatList');
                }
                break;
            case 'new_job':
                if (notification.data?.job_id) {
                    navigation.navigate('JobDetail', { jobId: notification.data.job_id });
                } else {
                    navigation.navigate('JobList');
                }
                break;
            case 'company_verification':
                navigation.navigate('CompanyProfile');
                break;
            default:
                // Default action
                break;
        }
    };

    const dismissNotification = async (notificationId) => {
        try {
            await axios.delete(`${API_URL}/api/notifications/${notificationId}/`);

            // Update local state
            setNotifications(notifications.filter(notification => notification.id !== notificationId));
        } catch (error) {
            console.error('Error dismissing notification:', error);
            alert('Failed to dismiss notification. Please try again.');
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    if (loading && !refreshing) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Notifications" />
                <LoadingState message="Loading notifications..." />
            </ScreenContainer>
        );
    }

    if (error) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Notifications" />
                <ErrorState
                    message={error}
                    onRetry={fetchNotifications}
                />
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <ScreenHeader
                title="Notifications"
                rightIcon="bell-off-outline"
                onRightPress={() => {
                    // Mark all as read
                    notifications.forEach(notification => {
                        if (!notification.is_read) {
                            markAsRead(notification.id);
                        }
                    });
                }}
            />

            {notifications.length === 0 ? (
                <EmptyState
                    title="No notifications"
                    message="You don't have any notifications at the moment."
                    icon="bell-off-outline"
                />
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={({ item }) => (
                        <NotificationItem
                            notification={item}
                            onPress={() => handleNotificationPress(item)}
                            onDismiss={() => dismissNotification(item.id)}
                        />
                    )}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[theme.colors.primary]}
                        />
                    }
                />
            )}
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    listContainer: {
        padding: 16,
    },
});

export default NotificationsScreen;
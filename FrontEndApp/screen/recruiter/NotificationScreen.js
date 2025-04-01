"use client"

import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useContext, useEffect } from "react"
import { StyleSheet, View } from "react-native"
import { ActivityIndicator, Button, Text } from "react-native-paper"
import NotificationItem from "../../components/business/NotificationItem"
import { NotificationContext } from "../../contexts/NotificationContext"

const NotificationScreen = ({ navigation }) => {
    const { state, fetchNotifications, markAsRead, markAllAsRead } = useContext(NotificationContext)
    const { t } = useTranslation()

    useEffect(() => {
        fetchNotifications()

        // Theo dõi sự kiện xem thông báo
        analyticsService.trackEvent("view_notifications")
    }, [])

    const formatDate = (date) => {
        const now = new Date()
        const notificationDate = new Date(date)
        const diffTime = Math.abs(now - notificationDate)
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) {
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
            if (diffHours === 0) {
                const diffMinutes = Math.floor(diffTime / (1000 * 60))
                return `${diffMinutes} phút trước`
            }
            return `${diffHours} giờ trước`
        } else if (diffDays === 1) {
            return "Hôm qua"
        } else {
            return notificationDate.toLocaleDateString("vi-VN")
        }
    }

    const handleNotificationPress = (notification) => {
        if (!notification.read) {
            markAsRead(notification.id)

            // Theo dõi sự kiện đọc thông báo
            analyticsService.trackEvent("read_notification", {
                notification_id: notification.id,
                notification_type: notification.type,
            })
        }

        // Điều hướng dựa trên loại thông báo
        switch (notification.type) {
            case "application":
                navigation.navigate("CandidateList", { jobId: notification.data.jobId })
                break
            case "status":
                navigation.navigate("JobDetail", { jobId: notification.data.jobId })
                break
            case "message":
                navigation.navigate("Chat", { candidateId: notification.data.senderId })
                break
            default:
                break
        }
    }

    const handleDismissNotification = (notificationId) => {
        // Logic to dismiss notification
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E88E5" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Thông báo</Text>
                {unreadCount > 0 && (
                    <Button mode="text" onPress={markAllAsRead} labelStyle={styles.markAllReadText}>
                        Đánh dấu tất cả đã đọc
                    </Button>
                )}
            </View>

            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="bell-off-outline" size={64} color="#BDBDBD" />
                    <Text style={styles.emptyText}>Bạn chưa có thông báo nào</Text>
                </View>
            ) : (
                <View style={styles.notificationList}>
                    {notifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onPress={() => handleNotificationPress(notification)}
                            onDismiss={() => handleDismissNotification(notification.id)}
                        />
                    ))}
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    header: {
        padding: 20,
        paddingTop: 40,
        backgroundColor: "#1E88E5",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    markAllReadText: {
        color: "#FFFFFF",
        fontSize: 14,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: "#757575",
        textAlign: "center",
        marginTop: 16,
    },
    notificationList: {
        padding: 16,
    },
})

export default NotificationScreen


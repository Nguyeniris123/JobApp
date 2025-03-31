"use client"

import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useContext, useEffect } from "react"
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native"
import { ActivityIndicator, Button, Card, Text } from "react-native-paper"
import { NotificationContext } from "../../contexts/NotificationContext"

const NotificationScreen = ({ navigation }) => {
    const { state, fetchNotifications, markAsRead, markAllAsRead } = useContext(NotificationContext)
    // const { notifications, loading, unreadCount } = state
    const { t } = useTranslation()

    useEffect(() => {
        fetchNotifications()

        // Theo dõi sự kiện xem thông báo
        analyticsService.trackEvent("view_notifications")
    }, [])

    const getNotificationIcon = (type) => {
        switch (type) {
            case "application":
                return "file-document-outline"
            case "status":
                return "check-circle-outline"
            case "message":
                return "message-text-outline"
            case "system":
                return "bell-outline"
            default:
                return "bell-outline"
        }
    }

    const getNotificationColor = (type) => {
        switch (type) {
            case "application":
                return "#2196F3"
            case "status":
                return "#4CAF50"
            case "message":
                return "#FF9800"
            case "system":
                return "#9E9E9E"
            default:
                return "#9E9E9E"
        }
    }

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

    const renderNotificationItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleNotificationPress(item)}>
            <Card style={[styles.notificationCard, !item.read && styles.unreadCard]}>
                <Card.Content style={styles.cardContent}>
                    <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(item.type) + "20" }]}>
                        <MaterialCommunityIcons
                            name={getNotificationIcon(item.type)}
                            size={24}
                            color={getNotificationColor(item.type)}
                        />
                    </View>
                    <View style={styles.contentContainer}>
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.message}>{item.message}</Text>
                        <Text style={styles.time}>{formatDate(item.createdAt)}</Text>
                    </View>
                    {!item.read && <View style={styles.unreadIndicator} />}
                </Card.Content>
            </Card>
        </TouchableOpacity>
    )

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
                <FlatList
                    data={notifications}
                    renderItem={renderNotificationItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.notificationList}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
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
    notificationCard: {
        borderRadius: 8,
        elevation: 1,
        marginBottom: 0,
    },
    unreadCard: {
        backgroundColor: "#E3F2FD",
    },
    cardContent: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        color: "#616161",
        marginBottom: 4,
    },
    time: {
        fontSize: 12,
        color: "#9E9E9E",
    },
    unreadIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#1E88E5",
        marginLeft: 8,
    },
    separator: {
        height: 8,
    },
})

export default NotificationScreen


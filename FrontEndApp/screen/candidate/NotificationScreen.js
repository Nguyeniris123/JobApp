import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useContext, useEffect } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";
import { AuthContext } from "../../contexts/AuthContext"; // Import AuthContext
import { NotificationContext } from "../../contexts/NotificationContext";

const NotificationScreen = ({ navigation }) => {
    const { loading, notifications, fetchNotifications, markAsRead, markAllAsRead } = useContext(NotificationContext)

    const { user } = useContext(AuthContext) // Kiểm tra trạng thái đăng nhập

    useEffect(() => {
        if (user) {
            fetchNotifications() // Chỉ fetch thông báo nếu đã đăng nhập
        }
    }, [user])

    if (!user) {
        return (
            <View style={styles.authContainer}>
                <MaterialCommunityIcons name="login" size={64} color="#1E88E5" />
                <Text style={styles.authText}>Vui lòng đăng nhập để xem thông báo</Text>
                <Button mode="contained" onPress={() => navigation.navigate("Login")}>
                    Đăng nhập
                </Button>
            </View>
        )
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
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => markAsRead(item.id)}>
                            <Card style={[styles.notificationCard, !item.read && styles.unreadCard]}>
                                <Card.Content style={styles.cardContent}>
                                    <MaterialCommunityIcons name="bell" size={24} color="#1E88E5" />
                                    <Text>{item.title}</Text>
                                </Card.Content>
                            </Card>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    authContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    authText: {
        fontSize: 16,
        color: "#616161",
        marginVertical: 10,
    },
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
})

export default NotificationScreen

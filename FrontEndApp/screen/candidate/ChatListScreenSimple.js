import { useContext, useEffect, useState } from "react"
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native"
import { ActivityIndicator, Avatar, Card, Text } from "react-native-paper"
import { AuthContext } from "../../contexts/AuthContext"
import ChatServiceSimple from "../../services/ChatServiceSimple"

const ChatListScreenSimple = ({ navigation }) => {
    const { user } = useContext(AuthContext)
    const [chatRooms, setChatRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let unsubscribe

        const loadChatRooms = async () => {
            try {
                setLoading(true)
                setError(null)

                console.log("Đang tải danh sách phòng chat cho ứng viên:", user?.id)

                if (!user || !user.id) {
                    console.error("Thiếu thông tin người dùng")
                    setError("Không thể tải phòng chat - Thiếu thông tin người dùng")
                    setLoading(false)
                    return
                }

                // Đăng ký lắng nghe danh sách phòng chat (không cần xác thực)
                unsubscribe = ChatServiceSimple.getUserChatRooms(
                    user.id,
                    "candidate",
                    async (rooms) => {
                        console.log("Nhận được", rooms.length, "phòng chat")
                        
                        // Xử lý thêm thông tin cho mỗi phòng chat
                        const enhancedRooms = await Promise.all(rooms.map(async (room) => {
                            // Thêm thông tin nhà tuyển dụng từ API hoặc cache nếu cần
                            // Đây chỉ là mẫu, bạn có thể tùy chỉnh theo nhu cầu
                            return {
                                ...room,
                                recruiterName: "Nhà tuyển dụng", // Thay thế bằng dữ liệu thực
                                recruiterAvatar: "https://via.placeholder.com/150", // Thay thế bằng dữ liệu thực
                                jobTitle: "Vị trí công việc", // Thay thế bằng dữ liệu thực nếu có jobId
                                company: "Công ty", // Thay thế bằng dữ liệu thực
                                unreadCount: 0, // Bạn có thể tính toán số tin nhắn chưa đọc nếu cần
                                lastActive: room.lastMessageTimestamp ? new Date(room.lastMessageTimestamp) : new Date()
                            }
                        }))
                        
                        setChatRooms(enhancedRooms)
                        setLoading(false)
                    },
                    (err) => {
                        console.error("Lỗi khi tải danh sách phòng chat:", err)
                        setError("Không thể tải phòng chat - Vui lòng thử lại sau")
                        setLoading(false)
                    }
                )
            } catch (err) {
                console.error("Lỗi khi tải danh sách phòng chat:", err)
                setError("Không thể tải phòng chat - " + err.message)
                setLoading(false)
            }
        }

        loadChatRooms()

        // Dọn dẹp khi unmount
        return () => {
            if (unsubscribe) {
                unsubscribe()
            }
        }
    }, [user])

    const navigateToChat = (chatRoom) => {
        navigation.navigate("Chat", {
            recruiterId: chatRoom.recruiterId,
            recruiterName: chatRoom.recruiterName || "Nhà tuyển dụng",
            recruiterAvatar: chatRoom.recruiterAvatar || "https://via.placeholder.com/150",
            jobId: chatRoom.jobId,
            jobTitle: chatRoom.jobTitle || "Vị trí công việc",
            company: chatRoom.company || "Công ty",
            roomId: chatRoom.id
        })
    }

    // Format thời gian cho tin nhắn cuối
    const formatLastActive = (date) => {
        if (!date) return ""
        
        const now = new Date()
        const diffMs = now - date
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        
        if (diffDays > 0) {
            return `${diffDays} ngày trước`
        }
        
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        if (diffHours > 0) {
            return `${diffHours} giờ trước`
        }
        
        const diffMins = Math.floor(diffMs / (1000 * 60))
        if (diffMins > 0) {
            return `${diffMins} phút trước`
        }
        
        return "Vừa xong"
    }

    const renderChatRoomItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigateToChat(item)}>
            <Card style={styles.chatCard}>
                <Card.Content style={styles.chatCardContent}>
                    <Avatar.Image 
                        source={{ uri: item.recruiterAvatar || "https://via.placeholder.com/150" }} 
                        size={50} 
                    />
                    <View style={styles.chatInfo}>
                        <View style={styles.chatHeader}>
                            <Text style={styles.recruiterName}>{item.recruiterName || "Nhà tuyển dụng"}</Text>
                            <Text style={styles.timeText}>{formatLastActive(item.lastActive)}</Text>
                        </View>
                        <Text style={styles.companyName}>{item.company || "Công ty"}</Text>
                        <Text style={styles.jobTitle}>Vị trí: {item.jobTitle || "Vị trí công việc"}</Text>
                        <Text 
                            numberOfLines={1} 
                            style={styles.lastMessage}
                        >
                            {item.lastMessage || "Bắt đầu cuộc trò chuyện"}
                        </Text>
                    </View>
                    {item.unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{item.unreadCount}</Text>
                        </View>
                    )}
                </Card.Content>
            </Card>
        </TouchableOpacity>
    )

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#1E88E5" />
                <Text style={styles.loadingText}>Đang tải danh sách chat...</Text>
            </View>
        )
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => setChatRooms([])} // Đặt lại state để kích hoạt useEffect
                >
                    <Text style={styles.retryText}>Thử lại</Text>
                </TouchableOpacity>
            </View>
        )
    }

    if (chatRooms.length === 0) {
        return (
            <View style={styles.centered}>
                <Text style={styles.emptyText}>Bạn chưa có cuộc trò chuyện nào</Text>
                <Text style={styles.emptySubText}>Ứng tuyển công việc để bắt đầu trò chuyện với nhà tuyển dụng</Text>
            </View>
        )
    }

    return (
        <FlatList 
            data={chatRooms}
            renderItem={renderChatRoomItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
        />
    )
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20
    },
    loadingText: {
        marginTop: 10,
        color: "#757575",
        fontSize: 16
    },
    errorText: {
        color: "#D32F2F",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20
    },
    retryButton: {
        padding: 12,
        backgroundColor: "#1E88E5",
        borderRadius: 4
    },
    retryText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "bold"
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#757575",
        marginBottom: 10
    },
    emptySubText: {
        fontSize: 14,
        color: "#9E9E9E",
        textAlign: "center"
    },
    listContainer: {
        padding: 16
    },
    chatCard: {
        marginBottom: 10,
        elevation: 1
    },
    chatCardContent: {
        flexDirection: "row",
        alignItems: "center"
    },
    chatInfo: {
        flex: 1,
        marginLeft: 15
    },
    chatHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    recruiterName: {
        fontWeight: "bold",
        fontSize: 16
    },
    timeText: {
        color: "#757575",
        fontSize: 12
    },
    companyName: {
        color: "#1565C0",
        fontSize: 14
    },
    jobTitle: {
        color: "#424242",
        fontSize: 13,
        marginTop: 2
    },
    lastMessage: {
        color: "#757575",
        fontSize: 14,
        marginTop: 4
    },
    unreadBadge: {
        backgroundColor: "#1E88E5",
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10
    },
    unreadText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "bold"
    }
})

export default ChatListScreenSimple

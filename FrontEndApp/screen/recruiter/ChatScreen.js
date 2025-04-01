"use client"

import { useEffect, useRef, useState } from "react"
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native"
import { ActivityIndicator, Appbar, Avatar, Text, TextInput } from "react-native-paper"
import ChatItem from '../../components/business/ChatItem'

// Dữ liệu mẫu cho tin nhắn
const mockMessages = [
    {
        id: "1",
        text: "Xin chào, tôi rất quan tâm đến vị trí Nhân viên bán hàng bán thời gian của quý công ty.",
        sender: "candidate",
        timestamp: new Date(2023, 3, 21, 10, 30),
    },
    {
        id: "2",
        text: "Chào bạn, cảm ơn bạn đã quan tâm đến vị trí của chúng tôi. Bạn có thể cho tôi biết thêm về kinh nghiệm của bạn không?",
        sender: "recruiter",
        timestamp: new Date(2023, 3, 21, 10, 35),
    },
    {
        id: "3",
        text: "Tôi đã có 1 năm kinh nghiệm làm việc tại cửa hàng thời trang và 6 tháng tại siêu thị. Tôi có kỹ năng giao tiếp tốt và khả năng làm việc nhóm hiệu quả.",
        sender: "candidate",
        timestamp: new Date(2023, 3, 21, 10, 40),
    },
    {
        id: "4",
        text: "Nghe có vẻ phù hợp với vị trí của chúng tôi. Bạn có thể làm việc vào cuối tuần không?",
        sender: "recruiter",
        timestamp: new Date(2023, 3, 21, 10, 45),
    },
    {
        id: "5",
        text: "Vâng, tôi có thể làm việc vào cuối tuần. Tôi có thể làm việc từ thứ 6 đến chủ nhật.",
        sender: "candidate",
        timestamp: new Date(2023, 3, 21, 10, 50),
    },
]

const ChatScreen = ({ navigation, route }) => {
    const {
        candidateId,
        candidateName = "Nguyễn Văn A",
        jobTitle = "Nhân viên bán hàng bán thời gian",
    } = route.params || {}
    const [messages, setMessages] = useState([])
    const [inputMessage, setInputMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [isTyping, setIsTyping] = useState(false)
    const flatListRef = useRef(null)
    const { t } = useTranslation()

    // Thông tin ứng viên
    const candidateInfo = {
        name: candidateName,
        avatar: "https://via.placeholder.com/150",
        status: "online",
    }

    useEffect(() => {
        // Giả lập API call
        const fetchMessages = async () => {
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000))
                setMessages(mockMessages)
            } catch (error) {
                console.log("Error fetching messages:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchMessages()

        // Theo dõi sự kiện xem màn hình chat
        analyticsService.trackEvent("view_chat", {
            candidate_id: candidateId,
            candidate_name: candidateName,
        })
    }, [candidateId, candidateName])

    useEffect(() => {
        // Cuộn xuống dưới khi có tin nhắn mới
        if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true })
        }
    }, [messages])

    const handleSend = () => {
        if (inputMessage.trim() === "") return

        const newMessage = {
            id: Date.now().toString(),
            text: inputMessage.trim(),
            sender: "recruiter",
            timestamp: new Date(),
        }

        setMessages([...messages, newMessage])
        setInputMessage("")

        // Theo dõi sự kiện gửi tin nhắn
        analyticsService.trackEvent("send_message", {
            candidate_id: candidateId,
            message_length: inputMessage.trim().length,
        })

        // Giả lập ứng viên đang nhập
        setIsTyping(true)
        setTimeout(() => {
            setIsTyping(false)

            // Giả lập phản hồi từ ứng viên sau một khoảng thời gian
            const candidateResponse = {
                id: (Date.now() + 1).toString(),
                text: "Cảm ơn bạn đã phản hồi. Tôi rất mong được làm việc tại công ty của bạn.",
                sender: "candidate",
                timestamp: new Date(),
            }
            setMessages((prevMessages) => [...prevMessages, candidateResponse])
        }, 3000)
    }

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatDate = (date) => {
        const today = new Date()
        const messageDate = new Date(date)

        if (
            messageDate.getDate() === today.getDate() &&
            messageDate.getMonth() === today.getMonth() &&
            messageDate.getFullYear() === today.getFullYear()
        ) {
            return "Hôm nay"
        }

        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (
            messageDate.getDate() === yesterday.getDate() &&
            messageDate.getMonth() === yesterday.getMonth() &&
            messageDate.getFullYear() === yesterday.getFullYear()
        ) {
            return "Hôm qua"
        }

        return messageDate.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
    }

    const renderDateSeparator = (date) => (
        <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>{formatDate(date)}</Text>
        </View>
    )

    const renderMessage = ({ item }) => {
        const isRecruiter = item.sender === "recruiter";
        return (
            <ChatItem
                message={item}
                isCurrentUser={isRecruiter}
                avatar={isRecruiter ? null : candidateInfo.avatar}
            />
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : null}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Avatar.Image source={{ uri: candidateInfo.avatar }} size={40} />
                <Appbar.Content
                    title={candidateInfo.name}
                    subtitle={
                        <View style={styles.statusContainer}>
                            <View
                                style={[
                                    styles.statusIndicator,
                                    { backgroundColor: candidateInfo.status === "online" ? "#4CAF50" : "#9E9E9E" },
                                ]}
                            />
                            <Text style={styles.statusText}>
                                {candidateInfo.status === "online" ? "Đang hoạt động" : "Ngoại tuyến"}
                            </Text>
                        </View>
                    }
                    titleStyle={styles.headerTitle}
                />
                <Appbar.Action icon="dots-vertical" onPress={() => { }} />
            </Appbar.Header>

            <View style={styles.jobInfoContainer}>
                <Text style={styles.jobInfoText}>
                    Trò chuyện về vị trí: <Text style={styles.jobTitle}>{jobTitle}</Text>
                </Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1E88E5" />
                </View>
            ) : (
                <>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.messageList}
                        showsVerticalScrollIndicator={false}
                    />

                    {isTyping && (
                        <View style={styles.typingContainer}>
                            <Avatar.Image source={{ uri: candidateInfo.avatar }} size={24} style={styles.typingAvatar} />
                            <Text style={styles.typingText}>Đang nhập...</Text>
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <TextInput
                            value={inputMessage}
                            onChangeText={setInputMessage}
                            placeholder="Nhập tin nhắn..."
                            mode="outlined"
                            style={styles.input}
                            right={
                                <TextInput.Icon
                                    icon="send"
                                    onPress={handleSend}
                                    disabled={inputMessage.trim() === ""}
                                    color={inputMessage.trim() === "" ? "#BDBDBD" : "#1E88E5"}
                                />
                            }
                        />
                    </View>
                </>
            )}
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "bold",
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 4,
    },
    statusText: {
        fontSize: 12,
        color: "#757575",
    },
    jobInfoContainer: {
        backgroundColor: "#E3F2FD",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#BBDEFB",
    },
    jobInfoText: {
        fontSize: 14,
        color: "#1565C0",
    },
    jobTitle: {
        fontWeight: "bold",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    messageList: {
        padding: 16,
    },
    dateSeparator: {
        alignItems: "center",
        marginVertical: 16,
    },
    dateSeparatorText: {
        fontSize: 12,
        color: "#757575",
        backgroundColor: "#EEEEEE",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    messageContainer: {
        flexDirection: "row",
        marginBottom: 16,
        maxWidth: "80%",
    },
    recruiterMessage: {
        alignSelf: "flex-end",
        justifyContent: "flex-end",
    },
    candidateMessage: {
        alignSelf: "flex-start",
    },
    avatar: {
        marginRight: 8,
        alignSelf: "flex-end",
    },
    messageBubble: {
        padding: 12,
        borderRadius: 16,
    },
    recruiterBubble: {
        backgroundColor: "#1E88E5",
        borderTopRightRadius: 4,
    },
    candidateBubble: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 4,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    recruiterText: {
        color: "#FFFFFF",
    },
    candidateText: {
        color: "#212121",
    },
    timestamp: {
        fontSize: 10,
        alignSelf: "flex-end",
        marginTop: 4,
    },
    recruiterTimestamp: {
        color: "rgba(255, 255, 255, 0.7)",
    },
    candidateTimestamp: {
        color: "#9E9E9E",
    },
    typingContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    typingAvatar: {
        marginRight: 8,
    },
    typingText: {
        fontSize: 12,
        color: "#757575",
        fontStyle: "italic",
    },
    inputContainer: {
        padding: 16,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#EEEEEE",
    },
    input: {
        backgroundColor: "#FFFFFF",
    },
})

export default ChatScreen


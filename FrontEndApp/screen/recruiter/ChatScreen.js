import { useContext, useEffect, useRef, useState } from "react"
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native"
import { ActivityIndicator, Appbar, Avatar, Text, TextInput } from "react-native-paper"
import ChatItem from '../../components/business/ChatItem'
import { AuthContext } from "../../contexts/AuthContext"
import ChatService from "../../services/ChatService"

const ChatScreen = ({ navigation, route }) => {
    const { user } = useContext(AuthContext)
    const {
        candidateId,
        candidateName = "Ứng viên",
        jobId,
        jobTitle = "Nhân viên bán hàng bán thời gian",
    } = route.params || {}
    const [messages, setMessages] = useState([])
    const [inputMessage, setInputMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [isTyping, setIsTyping] = useState(false)
    const [roomId, setRoomId] = useState(null)
    const flatListRef = useRef(null)
    const unsubscribeRef = useRef(null)

    // Thông tin ứng viên
    const candidateInfo = {
        name: candidateName,
        avatar: "https://via.placeholder.com/150",
        status: "online",
    }

    const [error, setError] = useState(null);
    
    useEffect(() => {
        let unsubscribe = null;

        const setupChat = async () => {
            try {
                setError(null);
                
                if (!user || !user.id || !candidateId) {
                    console.error("Missing user ID or candidate ID");
                    setLoading(false);
                    setError("Không thể tạo kết nối - Thiếu thông tin người dùng");
                    return;
                }

                // Create or get chat room
                const chatRoomId = await ChatService.createOrGetChatRoom(
                    user.id, // recruiter ID
                    candidateId,
                    jobId
                ).catch(err => {
                    console.error("Error creating chat room:", err);
                    setError("Không thể kết nối đến dịch vụ chat - Vui lòng thử lại sau");
                    throw err;
                });
                
                setRoomId(chatRoomId);

                // Subscribe to messages
                unsubscribe = ChatService.subscribeToMessages(chatRoomId, (newMessages) => {
                    // Convert Firebase timestamp to Date objects
                    const formattedMessages = newMessages.map(msg => ({
                        ...msg,
                        timestamp: msg.timestamp ? msg.timestamp.toDate() : new Date()
                    }));
                    
                    setMessages(formattedMessages);
                    setLoading(false);
                });

                unsubscribeRef.current = unsubscribe;

                // Mark all messages as read
                await ChatService.markMessagesAsRead(chatRoomId, user.id);
            } catch (error) {
                console.error("Error setting up chat:", error);
                setLoading(false);
            }
        };

        setupChat();
        
        // Clean up subscription on unmount
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [user, candidateId, jobId])

    useEffect(() => {
        // Cuộn xuống dưới khi có tin nhắn mới
        if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true })
        }
    }, [messages])

    const handleSend = async () => {
        if (inputMessage.trim() === "" || !roomId || !user || !user.id) return;

        try {
            // Clear input immediately for better UX
            const messageToSend = inputMessage.trim();
            setInputMessage("");
            
            // Send message to Firebase
            await ChatService.sendMessage(
                roomId,
                user.id,
                messageToSend,
                'recruiter'
            );
            
            // No need to update messages state manually as the subscription will handle it
            
            // For analytics tracking (commented out for now as analyticsService is not available)
            // if we had an analytics service, we could track the event like:
            // analyticsService.trackEvent("send_message", {
            //     candidate_id: candidateId,
            //     message_length: messageToSend.length,
            // });
        } catch (error) {
            console.error("Error sending message:", error);
            // Handle error (maybe show a snackbar)
        }
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
                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}
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
    errorContainer: {
        backgroundColor: "#FFEBEE",
        padding: 8,
        borderRadius: 4,
        marginTop: 8,
        marginHorizontal: 16,
    },
    errorText: {
        color: "#D32F2F",
        fontSize: 14,
    },
})

export default ChatScreen


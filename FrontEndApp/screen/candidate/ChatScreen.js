import { useContext, useEffect, useRef, useState } from "react"
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native"
import { Appbar, Avatar, Text, TextInput } from "react-native-paper"
import { AuthContext } from "../../contexts/AuthContext"
import ChatService from "../../services/ChatService"

const ChatScreen = ({ navigation, route }) => {
    const { user } = useContext(AuthContext)
    const [messages, setMessages] = useState([])
    const [inputMessage, setInputMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [roomId, setRoomId] = useState(null)
    const flatListRef = useRef(null)
    const unsubscribeRef = useRef(null)

    // Get chat information from route params or use defaults
    const { 
        recruiterId, 
        recruiterName = "Nhà tuyển dụng",
        recruiterAvatar = "https://via.placeholder.com/150",
        jobId,
        jobTitle = "Vị trí công việc",
        company = "Tên công ty" 
    } = route.params || {}
    
    // Chat info for display
    const chatInfo = {
        jobTitle,
        company,
        recruiterName,
        recruiterAvatar,
    }

    const [error, setError] = useState(null);

    useEffect(() => {
        let unsubscribe = null;

        const setupChat = async () => {
            try {
                setError(null);
                
                if (!user || !user.id || !recruiterId) {
                    console.error("Missing user ID or recruiter ID");
                    setLoading(false);
                    setError("Không thể tạo kết nối - Thiếu thông tin người dùng");
                    return;
                }

                // Create or get chat room
                const chatRoomId = await ChatService.createOrGetChatRoom(
                    recruiterId,
                    user.id,
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
    }, [user, recruiterId, jobId])

    useEffect(() => {
        // Scroll to bottom when messages change
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
                'candidate'
            );
            
            // No need to update messages state manually as the subscription will handle it
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

    const renderMessage = ({ item }) => {
        const isRecruiter = item.sender === "recruiter"

        return (
            <View style={[styles.messageContainer, isRecruiter ? styles.recruiterMessage : styles.candidateMessage]}>
                {isRecruiter && <Avatar.Image source={{ uri: chatInfo.recruiterAvatar }} size={36} style={styles.avatar} />}
                <View style={[styles.messageBubble, isRecruiter ? styles.recruiterBubble : styles.candidateBubble]}>
                    <Text style={styles.messageText}>{item.text}</Text>
                    <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
                </View>
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : null}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Avatar.Image source={{ uri: chatInfo.recruiterAvatar }} size={40} />
                <Appbar.Content
                    title={chatInfo.recruiterName}
                    subtitle={chatInfo.company}
                    titleStyle={styles.headerTitle}
                    subtitleStyle={styles.headerSubtitle}
                />
            </Appbar.Header>

            <View style={styles.jobInfoContainer}>
                <Text style={styles.jobInfoText}>
                    Trò chuyện về vị trí: <Text style={styles.jobTitle}>{chatInfo.jobTitle}</Text>
                </Text>
                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messageList}
                showsVerticalScrollIndicator={false}
            />

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
    headerSubtitle: {
        fontSize: 14,
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
    messageList: {
        padding: 16,
    },
    messageContainer: {
        flexDirection: "row",
        marginBottom: 16,
        maxWidth: "80%",
    },
    recruiterMessage: {
        alignSelf: "flex-start",
    },
    candidateMessage: {
        alignSelf: "flex-end",
        justifyContent: "flex-end",
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
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 4,
    },
    candidateBubble: {
        backgroundColor: "#1E88E5",
        borderTopRightRadius: 4,
    },
    messageText: {
        fontSize: 14,
        color: "#212121",
    },
    candidateMessage: {
        alignSelf: "flex-end",
    },
    candidateBubble: {
        backgroundColor: "#1E88E5",
        borderTopRightRadius: 4,
    },
    candidateMessage: {
        alignSelf: "flex-end",
    },
    candidateBubble: {
        backgroundColor: "#1E88E5",
        borderTopRightRadius: 4,
    },
    messageText: {
        fontSize: 14,
    },
    candidateBubble: {
        backgroundColor: "#1E88E5",
    },
    recruiterBubble: {
        backgroundColor: "#FFFFFF",
    },
    messageText: {
        fontSize: 14,
        color: "#212121",
    },
    candidateBubble: {
        backgroundColor: "#1E88E5",
    },
    candidateMessage: {
        alignSelf: "flex-end",
    },
    messageText: {
        fontSize: 14,
        color: "#212121",
    },
    candidateBubble: {
        backgroundColor: "#1E88E5",
    },
    messageText: {
        fontSize: 14,
    },
    candidateBubble: {
        backgroundColor: "#1E88E5",
    },
    messageText: {
        fontSize: 14,
        color: (props) => (props.sender === "candidate" ? "#FFFFFF" : "#212121"),
    },
    timestamp: {
        fontSize: 10,
        color: "#9E9E9E",
        alignSelf: "flex-end",
        marginTop: 4,
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


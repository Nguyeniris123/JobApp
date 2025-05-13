// ChatScreen.js for recruiters
import { useContext, useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { ActivityIndicator, Appbar, Avatar, Button, Text, TextInput } from "react-native-paper";
import ChatItem from "../../components/business/ChatItem"; // Using the provided ChatItem component
import { AuthContext } from "../../contexts/AuthContext";
import ChatService from "../../services/ChatService.fixed"; // Using the fixed service

const ChatScreen = ({ navigation, route }) => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [roomId, setRoomId] = useState(null);
    const [sending, setSending] = useState(false);
    const flatListRef = useRef(null);
    const unsubscribeRef = useRef(null);

    // Get chat information from route params or use defaults
    const { 
        candidateId,
        candidateName = "Ứng viên",
        candidateAvatar = "https://via.placeholder.com/150",
        jobId,
        jobTitle = "Vị trí công việc", 
    } = route.params || {};
    
    // Chat info for display
    const candidateInfo = {
        name: candidateName,
        avatar: candidateAvatar,
        status: "online",
    };

    const [error, setError] = useState(null);

    useEffect(() => {
        let unsubscribe = null;

        const setupChat = async () => {
            try {
                setError(null);
                setLoading(true);
                
                console.log("Setting up chat for recruiter", user?.id, "with candidate", candidateId);
                
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
                
                console.log("Using chat room ID:", chatRoomId);
                setRoomId(chatRoomId);

                // Subscribe to messages
                unsubscribe = ChatService.subscribeToMessages(
                    chatRoomId, 
                    (newMessages) => {
                        // Convert Firebase timestamp to Date objects
                        const formattedMessages = newMessages.map(msg => ({
                            ...msg,
                            timestamp: msg.timestamp ? msg.timestamp.toDate() : new Date()
                        }));
                        
                        setMessages(formattedMessages);
                        setLoading(false);
                    },
                    (error) => {
                        console.error("Error subscribing to messages:", error);
                        setError("Lỗi khi nhận tin nhắn - Vui lòng thử lại sau");
                        setLoading(false);
                    }
                );

                unsubscribeRef.current = unsubscribe;
                
                // Mark messages as read when entering chat
                await ChatService.markMessagesAsRead(chatRoomId, user.id).catch(err => {
                    console.error("Error marking messages as read:", err);
                });
            } catch (error) {
                console.error("Error setting up chat:", error);
                setLoading(false);
                setError("Lỗi kết nối - Vui lòng thử lại sau");
            }
        };

        if (user && candidateId) {
            setupChat();
        }

        // Clean up subscription on unmount
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [user, candidateId, jobId]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const handleSend = async () => {
        if (inputMessage.trim() === "" || !roomId || !user || !user.id || sending) return;

        try {
            setSending(true);
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
        } catch (error) {
            console.error("Error sending message:", error);
            setError("Không thể gửi tin nhắn - Vui lòng thử lại");
        } finally {
            setSending(false);
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    const renderDateSeparator = (date) => (
        <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>{formatDate(date)}</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : null}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Avatar.Image source={{ uri: candidateInfo.avatar }} size={40} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.headerTitle}>{candidateInfo.name}</Text>
                    <View style={styles.statusContainer}>
                        <View style={[
                            styles.statusIndicator, 
                            { backgroundColor: candidateInfo.status === "online" ? "#4CAF50" : "#9E9E9E" }
                        ]} />
                        <Text style={styles.statusText}>
                            {candidateInfo.status === "online" ? "Trực tuyến" : "Ngoại tuyến"}
                        </Text>
                    </View>
                </View>
            </Appbar.Header>
            
            <View style={styles.jobInfoContainer}>
                <Text style={styles.jobInfoText}>
                    <Text style={styles.jobTitle}>{jobTitle}</Text>
                </Text>
            </View>
            
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Button 
                        onPress={() => navigation.goBack()} 
                        mode="text" 
                        compact
                    >
                        Quay lại
                    </Button>
                </View>
            )}
            
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1E88E5" />
                    <Text style={{ marginTop: 16 }}>Đang tải tin nhắn...</Text>
                </View>
            ) : (
                <FlatList
                    data={messages}
                    renderItem={({ item }) => (
                        <ChatItem 
                            message={item}
                            isCurrentUser={item.sender === 'recruiter'}
                            avatar={item.sender === 'candidate' ? candidateInfo.avatar : null}
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    style={styles.messageList}
                    contentContainerStyle={{ flexGrow: 1 }}
                    ref={flatListRef}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                />
            )}
            
            {/* Typing indicator would go here */}
            
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    mode="outlined"
                    placeholder="Nhập tin nhắn..."
                    value={inputMessage}
                    onChangeText={setInputMessage}
                    right={
                        <TextInput.Icon
                            icon="send"
                            disabled={inputMessage.trim() === "" || sending}
                            onPress={handleSend}
                        />
                    }
                    onSubmitEditing={handleSend}
                    disabled={loading || !roomId}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

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
        padding: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    errorText: {
        color: "#D32F2F",
        fontSize: 14,
        flex: 1,
    },
});

export default ChatScreen;

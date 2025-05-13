// ChatScreen.js for candidates
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
        recruiterId, 
        recruiterName = "Nhà tuyển dụng",
        recruiterAvatar = "https://via.placeholder.com/150",
        jobId,
        jobTitle = "Vị trí công việc",
        company = "Tên công ty" 
    } = route.params || {};
    
    // Chat info for display
    const chatInfo = {
        jobTitle,
        company,
        recruiterName,
        recruiterAvatar,
    };

    const [error, setError] = useState(null);

    useEffect(() => {
        let unsubscribe = null;

        const setupChat = async () => {
            try {
                setError(null);
                setLoading(true);
                
                console.log("Setting up chat for candidate", user?.id, "with recruiter", recruiterId);
                
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

        if (user && recruiterId) {
            setupChat();
        }

        // Clean up subscription on unmount
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [user, recruiterId, jobId]);

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
                'candidate'
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

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : null}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Avatar.Image source={{ uri: chatInfo.recruiterAvatar }} size={40} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.headerTitle}>{chatInfo.recruiterName}</Text>
                    <Text style={styles.headerSubtitle}>{chatInfo.company}</Text>
                </View>
            </Appbar.Header>
            
            <View style={styles.jobInfoContainer}>
                <Text style={styles.jobInfoText}>
                    <Text style={styles.jobTitle}>{chatInfo.jobTitle}</Text>
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
                            isCurrentUser={item.sender === 'candidate'}
                            avatar={item.sender === 'recruiter' ? chatInfo.recruiterAvatar : null}
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    style={styles.messageList}
                    contentContainerStyle={{ flexGrow: 1 }}
                    ref={flatListRef}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                />
            )}
            
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    messageList: {
        padding: 16,
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

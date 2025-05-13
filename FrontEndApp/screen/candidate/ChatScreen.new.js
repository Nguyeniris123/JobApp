import AsyncStorage from "@react-native-async-storage/async-storage"
import { useContext, useEffect, useRef, useState } from "react"
import { Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native"
import { Appbar, Avatar, Text, TextInput } from "react-native-paper"
import ChatItem from "../../components/business/ChatItem"
import { AuthContext } from "../../contexts/AuthContext"
import ChatService from "../../services/ChatService.new"; // Sử dụng service mới
import FirebaseAuthService from "../../services/FirebaseAuthService"

const ChatScreen = ({ navigation, route }) => {
    const { user } = useContext(AuthContext)
    const [messages, setMessages] = useState([])
    const [inputMessage, setInputMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [roomId, setRoomId] = useState(null)
    const [sending, setSending] = useState(false)
    const flatListRef = useRef(null)
    const unsubscribeRef = useRef(null)

    // Lấy thông tin chat từ route params hoặc sử dụng giá trị mặc định
    const { 
        recruiterId, 
        recruiterName = "Nhà tuyển dụng",
        recruiterAvatar = "https://via.placeholder.com/150",
        jobId,
        jobTitle = "Vị trí công việc",
        company = "Tên công ty" 
    } = route.params || {}
    
    // Thông tin chat để hiển thị
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
                setLoading(true);
                
                console.log("Thiết lập chat cho ứng viên", user?.id, "với nhà tuyển dụng", recruiterId);
                
                if (!user || !user.id || !recruiterId) {
                    console.error("Thiếu ID người dùng hoặc ID nhà tuyển dụng");
                    setLoading(false);
                    setError("Không thể tạo kết nối - Thiếu thông tin người dùng");
                    return;
                }

                // Đảm bảo đã xác thực với Firebase trước khi tạo chat room
                try {
                    await FirebaseAuthService.ensureAuthenticated();
                } catch (authError) {
                    console.error("Lỗi xác thực Firebase:", authError);
                    
                    // Thử lấy token mới từ backend
                    const accessToken = await AsyncStorage.getItem('accessToken');
                    if (!accessToken) {
                        throw new Error("Không thể xác thực - Thiếu access token");
                    }
                    
                    // Thử xác thực lại
                    await FirebaseAuthService.authenticateWithBackend();
                }

                // Tạo hoặc lấy chat room
                const chatRoomId = await ChatService.createOrGetChatRoom(
                    recruiterId,
                    user.id,
                    jobId
                ).catch(err => {
                    console.error("Lỗi khi tạo chat room:", err);
                    setError("Không thể kết nối đến dịch vụ chat - Vui lòng thử lại sau");
                    throw err;
                });
                
                console.log("Sử dụng ID chat room:", chatRoomId);
                setRoomId(chatRoomId);

                // Đăng ký nhận tin nhắn
                unsubscribe = ChatService.subscribeToMessages(
                    chatRoomId, 
                    (newMessages) => {
                        // Chuyển đổi Firebase timestamp thành đối tượng Date
                        const formattedMessages = newMessages.map(msg => ({
                            ...msg,
                            timestamp: msg.timestamp ? 
                              (msg.timestamp.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp)) 
                              : new Date()
                        }));
                        
                        setMessages(formattedMessages);
                        setLoading(false);
                    },
                    (error) => {
                        console.error("Lỗi khi đăng ký nhận tin nhắn:", error);
                        setError("Lỗi khi nhận tin nhắn - Vui lòng thử lại sau");
                        setLoading(false);
                    }
                );

                unsubscribeRef.current = unsubscribe;
                
                // Đánh dấu tin nhắn là đã đọc khi vào chat
                await ChatService.markMessagesAsRead(chatRoomId, user.id).catch(err => {
                    console.error("Lỗi khi đánh dấu tin nhắn là đã đọc:", err);
                });
            } catch (error) {
                console.error("Lỗi khi thiết lập chat:", error);
                setLoading(false);
                setError(`Lỗi kết nối - ${error.message || 'Vui lòng thử lại sau'}`);
                
                Alert.alert(
                    "Lỗi kết nối chat",
                    `Không thể kết nối đến dịch vụ chat: ${error.message || 'Lỗi không xác định'}`,
                    [{ text: "Đóng", onPress: () => navigation.goBack() }]
                );
            }
        };

        if (user && recruiterId) {
            setupChat();
        }

        // Hủy đăng ký khi unmount
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [user, recruiterId, jobId])

    useEffect(() => {
        // Cuộn đến tin nhắn cuối cùng khi có tin nhắn mới
        if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true })
        }
    }, [messages])

    const handleSend = async () => {
        if (inputMessage.trim() === "" || !roomId || !user || !user.id || sending) return;

        try {
            setSending(true);
            // Xóa input ngay lập tức để trải nghiệm người dùng tốt hơn
            const messageToSend = inputMessage.trim();
            setInputMessage("");
            
            // Đảm bảo đã xác thực với Firebase
            await FirebaseAuthService.ensureAuthenticated();
            
            // Gửi tin nhắn đến Firebase
            await ChatService.sendMessage(
                roomId,
                user.id,
                messageToSend,
                'candidate'
            );
            
            // Không cần cập nhật messages state vì subscription sẽ xử lý
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn:", error);
            setError("Không thể gửi tin nhắn - Vui lòng thử lại");
            
            // Khôi phục tin nhắn nếu gửi thất bại
            setInputMessage(inputMessage);
            
            Alert.alert(
                "Lỗi gửi tin nhắn",
                "Không thể gửi tin nhắn. Vui lòng thử lại sau."
            );
        } finally {
            setSending(false);
        }
    }

    // Sử dụng component ChatItem thay vì tự tạo UI
    const renderMessage = ({ item }) => (
        <ChatItem 
            message={item}
            isCurrentUser={item.sender === 'candidate'}
            avatar={item.sender === 'recruiter' ? chatInfo.recruiterAvatar : null}
        />
    )

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
                            icon={sending ? "loading" : "send"}
                            onPress={handleSend}
                            disabled={inputMessage.trim() === "" || sending}
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

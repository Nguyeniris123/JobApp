import { useContext, useEffect, useRef, useState } from "react"
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native"
import { Appbar, Avatar, Text, TextInput } from "react-native-paper"
import ChatItem from "../../components/business/ChatItem"
import { AuthContext } from "../../contexts/AuthContext"
import ChatServiceSimple from "../../services/ChatServiceSimple"

const ChatScreenSimple = ({ navigation, route }) => {
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

                // Lấy recruiterInfo từ params nếu có
                const recruiterInfoFromParams = route.params?.recruiterInfo || null;

                // Tạo hoặc lấy chat room
                const chatRoomId = await ChatServiceSimple.createOrGetChatRoom(
                    recruiterId,
                    user.id,
                    jobId,
                    // recruiterInfo
                    recruiterInfoFromParams || {
                        id: recruiterId,
                        first_name: route.params?.recruiterFirstName || null,
                        last_name: route.params?.recruiterLastName || null,
                        username: route.params?.recruiterUsername || null,
                        email: route.params?.recruiterEmail || null,
                        avatar: recruiterAvatar
                    },
                    // candidateInfo
                    {
                        id: user.id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        username: user.username,
                        email: user.email,
                        avatar: user.avatar
                    }
                ).catch(err => {
                    console.error("Lỗi khi tạo chat room:", err);
                    setError("Không thể kết nối đến dịch vụ chat - Vui lòng thử lại sau");
                    throw err;
                });

                console.log("Sử dụng ID chat room:", chatRoomId);
                setRoomId(chatRoomId);

                // Đăng ký nhận tin nhắn
                unsubscribe = ChatServiceSimple.subscribeToMessages(
                    chatRoomId,
                    (newMessages) => {
                        // Chuyển đổi timestamp thành đối tượng Date
                        const formattedMessages = newMessages.map(msg => ({
                            ...msg,
                            timestamp: msg.timestamp ?
                                new Date(msg.timestamp) : new Date()
                        }));

                        setMessages(formattedMessages);
                        setLoading(false);
                    },
                    (err) => {
                        console.error("Lỗi khi nhận tin nhắn:", err);
                        setError("Không thể nhận tin nhắn - Vui lòng thử lại sau");
                        setLoading(false);
                    }
                );

                unsubscribeRef.current = unsubscribe;

                // Đánh dấu tất cả tin nhắn là đã đọc khi vào phòng chat
                await ChatServiceSimple.markMessagesAsRead(chatRoomId, user.id);
            } catch (err) {
                console.error("Lỗi khi thiết lập chat:", err);
                setError("Không thể thiết lập chat - " + err.message);
                setLoading(false);
            }
        };

        setupChat();

        // Hủy đăng ký khi component unmount
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [user, recruiterId, jobId]);

    // Cuộn xuống tin nhắn cuối cùng khi có tin nhắn mới
    useEffect(() => {
        if (messages.length > 0 && flatListRef.current) {
            setTimeout(() => {
                flatListRef.current.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    // Xử lý gửi tin nhắn
    const handleSend = async () => {
        try {
            if (inputMessage.trim() === "" || sending) {
                return;
            }

            if (!roomId) {
                setError("Không thể gửi tin nhắn - Phòng chat chưa được thiết lập");
                return;
            }

            const messageText = inputMessage.trim();
            setSending(true);
            setInputMessage(""); // Xóa input để UX mượt hơn

            // Gửi tin nhắn kèm thông tin thật của user
            await ChatServiceSimple.sendMessage(
                roomId,
                user.id,
                messageText,
                'candidate',
                {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar
                }
            );

            setSending(false);
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn:", error);
            setError("Không thể gửi tin nhắn - Vui lòng thử lại sau");
            setSending(false);
            // Khôi phục tin nhắn vào ô nhập nếu gửi thất bại
            setInputMessage(inputMessage);
        }
    };

    // Format thời gian tin nhắn
    const formatTime = (date) => {
        if (!date) return "";

        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");

        return `${hours}:${minutes}`;
    };

    // Render tin nhắn
    const renderMessage = ({ item }) => (
        <ChatItem
            message={item}
            isCurrentUser={item.sender === 'candidate'}
            avatar={item.sender === 'recruiter' ? chatInfo.recruiterAvatar : null}
        />
    );

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

            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text>Đang tải tin nhắn...</Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messageList}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <View style={styles.inputContainer}>
                <TextInput
                    value={inputMessage}
                    onChangeText={setInputMessage}
                    placeholder="Nhập tin nhắn..."
                    mode="outlined"
                    style={styles.input}
                    disabled={sending || loading}
                    right={
                        <TextInput.Icon
                            icon="send"
                            onPress={handleSend}
                            disabled={inputMessage.trim() === "" || sending || loading}
                            color={inputMessage.trim() === "" || sending || loading ? "#BDBDBD" : "#1E88E5"}
                        />
                    }
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
        padding: 8,
        borderRadius: 4,
        marginTop: 8,
    },
    errorText: {
        color: "#D32F2F",
        fontSize: 14,
    },
});

export default ChatScreenSimple;

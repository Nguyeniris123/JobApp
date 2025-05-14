import AsyncStorage from "@react-native-async-storage/async-storage"
import { useContext, useEffect, useRef, useState } from "react"
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native"
import { Appbar, Avatar, Text, TextInput } from "react-native-paper"
import ChatItem from "../../components/business/ChatItem"
import { AuthContext } from "../../contexts/AuthContext"
import ChatServiceRTDB from "../../services/ChatServiceRTDB"
import FirebaseAuthService from "../../services/FirebaseAuthService"

const ChatScreenRTDB = ({ navigation, route }) => {
    const { user } = useContext(AuthContext)
    const {
        candidateId,
        candidateName = "Ứng viên",
        candidateAvatar = "https://via.placeholder.com/150",
        jobId,
        jobTitle = "Vị trí công việc",
    } = route.params || {}
    const [messages, setMessages] = useState([])
    const [inputMessage, setInputMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [roomId, setRoomId] = useState(null)
    const flatListRef = useRef(null)
    const unsubscribeRef = useRef(null)

    // Thông tin ứng viên
    const candidateInfo = {
        name: candidateName,
        avatar: candidateAvatar || "https://via.placeholder.com/150",
        status: "online",
    }

    const [error, setError] = useState(null);

    useEffect(() => {
        let unsubscribe = null;

        const setupChat = async () => {
            try {
                setError(null);
                setLoading(true);
                
                console.log("Thiết lập chat cho nhà tuyển dụng", user?.id, "với ứng viên", candidateId);
                
                if (!user || !user.id || !candidateId) {
                    console.error("Thiếu ID người dùng hoặc ID ứng viên");
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
                const chatRoomId = await ChatServiceRTDB.createOrGetChatRoom(
                    user.id, // recruiterId
                    candidateId,
                    jobId
                ).catch(err => {
                    console.error("Lỗi khi tạo chat room:", err);
                    setError("Không thể kết nối đến dịch vụ chat - Vui lòng thử lại sau");
                    throw err;
                });
                
                console.log("Sử dụng ID chat room:", chatRoomId);
                setRoomId(chatRoomId);

                // Đăng ký nhận tin nhắn
                unsubscribe = ChatServiceRTDB.subscribeToMessages(
                    chatRoomId, 
                    (newMessages) => {
                        // Chuyển đổi Firebase timestamp thành đối tượng Date
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
                await ChatServiceRTDB.markMessagesAsRead(chatRoomId, user.id);
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
    }, [user, candidateId, jobId]);

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

            // Đảm bảo xác thực Firebase trước khi gửi
            await FirebaseAuthService.ensureAuthenticated();

            // Gửi tin nhắn
            await ChatServiceRTDB.sendMessage(
                roomId, 
                user.id, 
                messageText,
                'recruiter'
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

    // Format ngày tin nhắn
    const formatDate = (date) => {
        if (!date) return "";
        
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === today.toDateString()) {
            return "Hôm nay";
        }
        
        if (date.toDateString() === yesterday.toDateString()) {
            return "Hôm qua";
        }
        
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    // Render separator giữa các ngày
    const renderDateSeparator = (date) => (
        <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>{formatDate(date)}</Text>
        </View>
    );

    // Render tin nhắn
    const renderMessage = ({ item }) => (
        <ChatItem 
            message={item}
            isCurrentUser={item.sender === 'recruiter'}
            avatar={item.sender === 'candidate' ? candidateInfo.avatar : null}
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
                <Avatar.Image source={{ uri: candidateInfo.avatar }} size={40} />
                <Appbar.Content
                    title={candidateInfo.name}
                    subtitle={
                        <View style={styles.statusContainer}>
                            <View 
                                style={[
                                    styles.statusIndicator, 
                                    { backgroundColor: candidateInfo.status === "online" ? "#4CAF50" : "#9E9E9E" }
                                ]}
                            />
                            <Text style={styles.statusText}>
                                {candidateInfo.status === "online" ? "Trực tuyến" : "Ngoại tuyến"}
                            </Text>
                        </View>
                    }
                    titleStyle={styles.headerTitle}
                />
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

export default ChatScreenRTDB;

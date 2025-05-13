import {
    addDoc,
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc
} from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Appbar, Avatar, Button, Text, TextInput } from "react-native-paper";
import { AuthContext } from "../../contexts/AuthContext";
import { db } from "../../firebase/config";

/**
 * Màn hình kiểm tra kết nối chat với Firebase đơn giản
 */
const SimpleTestChatScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [roomId, setRoomId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const flatListRef = useRef(null);

    const testUserId = user?.id || "test_user_" + Date.now();

    // Tạo ID phòng chat đơn giản cho kiểm tra
    const generateTestRoomId = () => {
        return `test_room_${Date.now()}`;
    };

    /**
     * Tạo phòng chat mới để kiểm tra
     */
    const createTestRoom = async () => {
        try {
            setLoading(true);
            setError(null);

            // Tạo ID phòng chat mới
            const newRoomId = generateTestRoomId();

            // Tạo tài liệu phòng chat trong Firestore
            const roomRef = doc(db, "chatRooms", newRoomId);
            await setDoc(roomRef, {
                createdAt: serverTimestamp(),
                createdBy: testUserId,
                participants: [testUserId],
                lastMessage: "Phòng chat kiểm tra",
                lastMessageTimestamp: serverTimestamp()
            });

            // Lưu ID phòng và thiết lập người nghe tin nhắn
            setRoomId(newRoomId);
            setupMessageListener(newRoomId);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi tạo phòng chat:", error);
            setError(`Không thể tạo phòng chat: ${error.message}`);
            setLoading(false);
        }
    };

    /**
     * Thiết lập lắng nghe tin nhắn từ Firestore
     */
    const setupMessageListener = (roomId) => {
        const messagesRef = collection(db, "chatRooms", roomId, "messages");
        const q = query(messagesRef, orderBy("timestamp", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messageList = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                messageList.push({
                    id: doc.id,
                    text: data.text,
                    senderId: data.senderId,
                    timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
                    sender: data.sender || "unknown"
                });
            });

            setMessages(messageList);

            // Cuộn xuống dưới cùng khi có tin nhắn mới
            if (flatListRef.current && messageList.length > 0) {
                setTimeout(() => {
                    flatListRef.current.scrollToEnd({ animated: true });
                }, 100);
            }
        }, (error) => {
            console.error("Lỗi khi lắng nghe tin nhắn:", error);
            setError(`Lỗi khi nhận tin nhắn: ${error.message}`);
        });

        // Trả về hàm hủy đăng ký để dọn dẹp khi component unmount
        return unsubscribe;
    };

    /**
     * Gửi tin nhắn mới
     */
    const sendMessage = async () => {
        if (!message.trim() || !roomId) return;

        try {
            const messageToSend = message.trim();
            setMessage(""); // Xóa tin nhắn trong ô input

            // Thêm tin nhắn vào collection messages
            const messagesRef = collection(db, "chatRooms", roomId, "messages");
            await addDoc(messagesRef, {
                text: messageToSend,
                senderId: testUserId,
                timestamp: serverTimestamp(),
                sender: user?.role || "test_user"
            });

            // Cập nhật thông tin tin nhắn cuối cùng trong phòng chat
            const roomRef = doc(db, "chatRooms", roomId);
            await setDoc(roomRef, {
                lastMessage: messageToSend,
                lastMessageTimestamp: serverTimestamp(),
                lastSender: testUserId
            }, { merge: true });

        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn:", error);
            setError(`Không thể gửi tin nhắn: ${error.message}`);
        }
    };

    // Clean up khi component unmount
    useEffect(() => {
        let unsubscribe;
        if (roomId) {
            unsubscribe = setupMessageListener(roomId);
        }
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [roomId]);

    /**
     * Render từng tin nhắn
     */
    const renderMessage = ({ item }) => {
        const isCurrentUser = item.senderId === testUserId;
        return (
            <View style={[
                styles.messageContainer,
                isCurrentUser ? styles.myMessage : styles.otherMessage
            ]}>
                {!isCurrentUser && (
                    <Avatar.Text
                        size={32}
                        label={item.sender.substring(0, 2).toUpperCase()}
                        style={styles.avatar}
                    />
                )}
                <View style={[
                    styles.messageBubble,
                    isCurrentUser ? styles.myBubble : styles.otherBubble
                ]}>
                    <Text style={[
                        styles.messageText,
                        isCurrentUser ? styles.myMessageText : styles.otherMessageText
                    ]}>
                        {item.text}
                    </Text>
                    <Text style={styles.timestamp}>
                        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Firebase Chat Test" />
            </Appbar.Header>

            <View style={styles.content}>
                {!roomId ? (
                    <View style={styles.setupContainer}>
                        <Text style={styles.instructionText}>
                            Bấm nút dưới đây để tạo phòng chat kiểm tra kết nối với Firebase
                        </Text>
                        <Button
                            mode="contained"
                            onPress={createTestRoom}
                            loading={loading}
                            style={styles.createButton}
                        >
                            Tạo phòng chat test
                        </Button>

                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <>
                        <View style={styles.roomInfoContainer}>
                            <Text style={styles.roomInfoText}>
                                ID Phòng chat: {roomId}
                            </Text>
                            <Text style={styles.roomInfoText}>
                                ID Người dùng hiện tại: {testUserId}
                            </Text>
                        </View>

                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            renderItem={renderMessage}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.messagesList}
                            ListEmptyComponent={() => (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>
                                        Chưa có tin nhắn. Hãy gửi tin nhắn đầu tiên!
                                    </Text>
                                </View>
                            )}
                        />

                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : null}
                            keyboardVerticalOffset={90}
                        >
                            <View style={styles.inputContainer}>
                                <TextInput
                                    value={message}
                                    onChangeText={setMessage}
                                    placeholder="Nhập tin nhắn..."
                                    mode="outlined"
                                    style={styles.input}
                                    right={
                                        <TextInput.Icon
                                            icon="send"
                                            onPress={sendMessage}
                                            disabled={message.trim() === ""}
                                        />
                                    }
                                />
                            </View>
                        </KeyboardAvoidingView>
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    content: {
        flex: 1,
    },
    setupContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    instructionText: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 24,
        color: "#424242",
    },
    createButton: {
        paddingHorizontal: 16,
    },
    roomInfoContainer: {
        backgroundColor: "#E3F2FD",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#BBDEFB",
    },
    roomInfoText: {
        fontSize: 12,
        color: "#1565C0",
        marginBottom: 4,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    messagesList: {
        padding: 16,
        flexGrow: 1,
    },
    messageContainer: {
        flexDirection: "row",
        marginBottom: 12,
        maxWidth: "80%",
    },
    myMessage: {
        alignSelf: "flex-end",
    },
    otherMessage: {
        alignSelf: "flex-start",
    },
    avatar: {
        marginRight: 8,
        backgroundColor: "#9C27B0",
    },
    messageBubble: {
        padding: 12,
        borderRadius: 16,
    },
    myBubble: {
        backgroundColor: "#2196F3",
        borderBottomRightRadius: 4,
    },
    otherBubble: {
        backgroundColor: "#E0E0E0",
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
    },
    myMessageText: {
        color: "#FFFFFF",
    },
    otherMessageText: {
        color: "#212121",
    },
    timestamp: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: "flex-end",
        opacity: 0.7,
        color: "#E0E0E0",
    },
    inputContainer: {
        padding: 12,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#EEEEEE",
    },
    input: {
        backgroundColor: "#FFFFFF",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    emptyText: {
        fontSize: 16,
        color: "#9E9E9E",
        textAlign: "center",
    },
    errorContainer: {
        backgroundColor: "#FFEBEE",
        padding: 12,
        borderRadius: 4,
        marginTop: 16,
        width: "100%",
    },
    errorText: {
        color: "#D32F2F",
        textAlign: "center",
    },
});

export default SimpleTestChatScreen;

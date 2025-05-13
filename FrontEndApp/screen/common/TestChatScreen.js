import { useContext, useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Appbar, Button, Text, TextInput } from "react-native-paper";
import ChatItem from "../../components/business/ChatItem";
import { AuthContext } from "../../contexts/AuthContext";
import ChatService from "../../services/ChatService";

/**
 * Test Chat Screen component for testing Firebase chat functionality
 */
const TestChatScreen = ({ navigation }) => {
    // States for message handling
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [roomId, setRoomId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Access user context
    const { user } = useContext(AuthContext);
    
    // Reference for FlatList to scroll to bottom
    const flatListRef = useRef(null);
    const unsubscribeRef = useRef(null);

    // Mock user IDs for testing
    // In a real app, you'd get these from your authentication system
    const testRecruiter = user?.id || "test_recruiter_id";
    const testCandidate = "test_candidate_id";
    const testJobId = "test_job_id";

    useEffect(() => {
        // Clean up when component unmounts
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, []);

    /**
     * Set up a new chat room and subscribe to messages
     */
    const createAndSetupChatRoom = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Create or get chat room
            const chatRoomId = await ChatService.createOrGetChatRoom(
                testRecruiter,
                testCandidate,
                testJobId
            );
            
            setRoomId(chatRoomId);
            
            // Subscribe to messages
            const unsubscribe = ChatService.subscribeToMessages(chatRoomId, (newMessages) => {
                // Convert Firebase timestamp to Date objects
                const formattedMessages = newMessages.map(msg => ({
                    ...msg,
                    timestamp: msg.timestamp ? msg.timestamp.toDate() : new Date()
                }));
                
                setMessages(formattedMessages);
            });
            
            unsubscribeRef.current = unsubscribe;
            setLoading(false);
            
            // Scroll to bottom when messages load
            if (flatListRef.current && messages.length > 0) {
                flatListRef.current.scrollToEnd({ animated: true });
            }
            
        } catch (error) {
            console.error("Error setting up test chat:", error);
            setError("Failed to create chat room: " + error.message);
            setLoading(false);
        }
    };

    /**
     * Handle sending a new message
     */
    const handleSendMessage = async () => {
        if (!message.trim() || !roomId) return;
        
        try {
            // Clear input immediately for better UX
            const messageToSend = message.trim();
            setMessage("");
            
            // Determine sender type based on user role
            // For testing purposes assuming current user is a recruiter
            await ChatService.sendMessage(
                roomId,
                testRecruiter,
                messageToSend,
                'recruiter'
            );
            
            // Scroll to bottom when new message is sent
            if (flatListRef.current) {
                setTimeout(() => {
                    flatListRef.current.scrollToEnd({ animated: true });
                }, 100);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setError("Failed to send message: " + error.message);
        }
    };

    /**
     * Render individual message item
     */
    const renderMessage = ({ item }) => {
        const isCurrentUser = item.senderId === testRecruiter;
        
        return (
            <ChatItem
                message={item}
                isCurrentUser={isCurrentUser}
                avatar={isCurrentUser ? null : "https://ui-avatars.com/api/?name=Test+User"}
            />
        );
    };

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Test Chat" subtitle="Firebase Chat Test" />
            </Appbar.Header>

            <View style={styles.content}>
                {!roomId && (
                    <View style={styles.startChatContainer}>
                        <Text style={styles.instructionText}>
                            Press the button below to create a test chat room
                        </Text>
                        <Button 
                            mode="contained" 
                            loading={loading}
                            onPress={createAndSetupChatRoom}
                            style={styles.createButton}
                        >
                            Create Test Chat
                        </Button>
                        
                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}
                    </View>
                )}

                {roomId && (
                    <>
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoText}>
                                Room ID: {roomId}
                            </Text>
                        </View>
                        
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            renderItem={renderMessage}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.messageList}
                            onContentSizeChange={() => {
                                if (flatListRef.current && messages.length > 0) {
                                    flatListRef.current.scrollToEnd({ animated: false });
                                }
                            }}
                        />

                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                        >
                            <View style={styles.inputContainer}>
                                <TextInput
                                    value={message}
                                    onChangeText={setMessage}
                                    placeholder="Type a message..."
                                    mode="outlined"
                                    style={styles.input}
                                    right={
                                        <TextInput.Icon
                                            icon="send"
                                            onPress={handleSendMessage}
                                            disabled={message.trim() === ""}
                                            color={message.trim() === "" ? "#BDBDBD" : "#1E88E5"}
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
    startChatContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    instructionText: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
    },
    createButton: {
        paddingHorizontal: 20,
        marginVertical: 10,
    },
    infoContainer: {
        padding: 10,
        backgroundColor: "#E3F2FD",
        borderBottomWidth: 1,
        borderBottomColor: "#BBDEFB",
    },
    infoText: {
        fontSize: 14,
        color: "#1565C0",
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
        borderRadius: 4,
        marginTop: 20,
        width: "100%",
        alignItems: "center",
    },
    errorText: {
        color: "#D32F2F",
        fontSize: 14,
        textAlign: "center",
    },
});

export default TestChatScreen;

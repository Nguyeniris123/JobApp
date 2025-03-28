import { useEffect, useRef, useState } from "react"
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native"
import { Appbar, Avatar, Text, TextInput } from "react-native-paper"

// Mock data for chat messages
const mockMessages = [
    {
        id: "1",
        text: "Xin chào, cảm ơn bạn đã ứng tuyển vào vị trí của chúng tôi.",
        sender: "recruiter",
        timestamp: new Date(2023, 3, 21, 10, 30),
    },
    {
        id: "2",
        text: "Chúng tôi rất ấn tượng với hồ sơ của bạn và muốn mời bạn tham gia phỏng vấn.",
        sender: "recruiter",
        timestamp: new Date(2023, 3, 21, 10, 31),
    },
    {
        id: "3",
        text: "Xin chào, cảm ơn vì đã xem xét hồ sơ của tôi.",
        sender: "candidate",
        timestamp: new Date(2023, 3, 21, 10, 35),
    },
    {
        id: "4",
        text: "Tôi rất vui khi được mời phỏng vấn. Khi nào chúng ta có thể sắp xếp?",
        sender: "candidate",
        timestamp: new Date(2023, 3, 21, 10, 36),
    },
    {
        id: "5",
        text: "Chúng ta có thể sắp xếp vào thứ Năm tuần này, lúc 10 giờ sáng được không?",
        sender: "recruiter",
        timestamp: new Date(2023, 3, 21, 11, 0),
    },
]

const ChatScreen = ({ navigation, route }) => {
    const [messages, setMessages] = useState([])
    const [inputMessage, setInputMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const flatListRef = useRef(null)

    // Mock data for the chat
    const chatInfo = {
        jobTitle: "Nhân viên phục vụ quán cà phê",
        company: "Cà phê DEF",
        recruiterName: "Nguyễn Văn A",
        recruiterAvatar: "https://via.placeholder.com/150",
    }

    useEffect(() => {
        // Simulate API call
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
    }, [])

    useEffect(() => {
        // Scroll to bottom when messages change
        if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true })
        }
    }, [messages])

    const handleSend = () => {
        if (inputMessage.trim() === "") return

        const newMessage = {
            id: Date.now().toString(),
            text: inputMessage.trim(),
            sender: "candidate",
            timestamp: new Date(),
        }

        setMessages([...messages, newMessage])
        setInputMessage("")

        // Simulate recruiter response after a delay
        setTimeout(() => {
            const recruiterResponse = {
                id: (Date.now() + 1).toString(),
                text: "Cảm ơn bạn đã phản hồi. Tôi sẽ liên hệ lại với bạn sớm.",
                sender: "recruiter",
                timestamp: new Date(),
            }
            setMessages((prevMessages) => [...prevMessages, recruiterResponse])
        }, 2000)
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
})

export default ChatScreen


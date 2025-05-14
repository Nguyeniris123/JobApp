import { StyleSheet, View } from 'react-native';
import { Avatar, Text } from 'react-native-paper';

/**
 * Component for displaying individual chat messages
 * 
 * @param {Object} message - The message object
 * @param {boolean} isCurrentUser - Whether the message is from the current user
 * @param {string} avatar - Avatar URL for the other user
 */
const ChatItem = ({
    message,
    isCurrentUser,
    avatar,
}) => {    return (
        <View style={[
            styles.messageContainer, 
            isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
        ]}>
            {!isCurrentUser && avatar && (
                <Avatar.Image
                    source={{ uri: avatar }}
                    size={36}
                    style={styles.avatar}
                />
            )}
            <View style={[
                styles.messageBubble, 
                isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
            ]}>
                <Text style={[
                    styles.messageText,
                    isCurrentUser ? styles.currentUserText : styles.otherUserText
                ]}>
                    {message.text}
                </Text>                <Text style={[
                    styles.timestamp,
                    isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp
                ]}>
                    {message.timestamp ? 
                        (typeof message.timestamp === 'number' || typeof message.timestamp === 'string' ? 
                            new Date(message.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) :
                            message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }))
                        : ''}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        maxWidth: '80%',
    },
    currentUserMessage: {
        alignSelf: 'flex-end',
        justifyContent: 'flex-end',
    },
    otherUserMessage: {
        alignSelf: 'flex-start',
    },
    avatar: {
        marginRight: 8,
        alignSelf: 'flex-end',
    },
    messageBubble: {
        padding: 12,
        borderRadius: 16,
    },
    currentUserBubble: {
        backgroundColor: '#1E88E5',
        borderTopRightRadius: 4,
    },
    otherUserBubble: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 4,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    currentUserText: {
        color: '#FFFFFF',
    },
    otherUserText: {
        color: '#212121',
    },
    timestamp: {
        fontSize: 10,
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    currentUserTimestamp: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    otherUserTimestamp: {
        color: '#9E9E9E',
    },
});

export default ChatItem;
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Badge, Text } from 'react-native-paper';

const ChatItem = ({
    chat,
    currentUserId,
    onPress,
    style,
}) => {
    const otherParticipant = chat.participants.find(p => p.id !== currentUserId);
    const hasUnread = !chat.last_message_read && chat.last_message_sender_id !== currentUserId;

    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={onPress}
        >
            <Avatar.Image
                size={50}
                source={{ uri: otherParticipant.avatar || 'https://via.placeholder.com/50' }}
            />

            <View style={styles.chatInfo}>
                <View style={styles.nameRow}>
                    <Text style={styles.name}>{otherParticipant.name}</Text>
                    <Text style={styles.time}>
                        {new Date(chat.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>

                {chat.job && (
                    <Text style={styles.jobTitle}>
                        <MaterialCommunityIcons name="briefcase" size={14} color="#666" />
                        {' '}{chat.job.title}
                    </Text>
                )}

                <Text
                    numberOfLines={1}
                    style={[
                        styles.lastMessage,
                        hasUnread && styles.unreadMessage
                    ]}
                >
                    {chat.last_message_sender_id === currentUserId ? 'You: ' : ''}
                    {chat.last_message}
                </Text>
            </View>

            {hasUnread && (
                <Badge style={styles.unreadBadge}>new</Badge>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    chatInfo: {
        flex: 1,
        marginLeft: 12,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    jobTitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    unreadMessage: {
        fontWeight: 'bold',
        color: '#333',
    },
    unreadBadge: {
        backgroundColor: '#1E88E5',
        marginLeft: 8,
    },
});

export default ChatItem;
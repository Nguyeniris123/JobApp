// Chat list screen for recruiters
import { useContext, useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Avatar, Button, Divider, Surface, Text } from 'react-native-paper';
import { AuthContext } from '../../contexts/AuthContext';
import ChatService from '../../services/ChatService';

const ChatListScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [chatRooms, setChatRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let unsubscribe;
        
        const loadChatRooms = async () => {
            try {
                if (!user || !user.id) {
                    setLoading(false);
                    return;
                }
                
                setError(null);
                
                // For recruiter screens, use 'recruiter' as userType
                unsubscribe = ChatService.getUserChatRooms(
                    user.id, 
                    'recruiter', 
                    (rooms) => {
                        setChatRooms(rooms);
                        setLoading(false);
                        setRefreshing(false);
                    },
                    (err) => {
                        // Handle specific errors
                        if (err.type === 'missing-index') {
                            setError({
                                type: 'warning',
                                message: 'Tin nhắn có thể không được sắp xếp theo thứ tự đúng do thiếu chỉ mục trong database'
                            });
                        } else {
                            setError({
                                type: 'error',
                                message: 'Không thể tải tin nhắn. Vui lòng thử lại sau.'
                            });
                        }
                        setLoading(false);
                        setRefreshing(false);
                    }
                );
            } catch (error) {
                console.error('Error loading chat rooms:', error);
                setError({
                    type: 'error',
                    message: 'Không thể tải tin nhắn. Vui lòng thử lại sau.'
                });
                setLoading(false);
                setRefreshing(false);
            }
        };
        
        loadChatRooms();
        
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [user]);

    const handleRefresh = () => {
        setRefreshing(true);
        // The subscription will automatically refresh the data
        // This is just to reset the refreshing state if nothing happens
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    };

    const navigateToChat = (item) => {
        const isRecruiter = user && user.company;
        
        if (isRecruiter) {
            navigation.navigate('Chat', {
                candidateId: item.otherParticipantId,
                candidateName: item.otherParticipantName || 'Ứng viên',
                jobId: item.jobId,
                jobTitle: item.jobTitle || 'Vị trí công việc'
            });
        } else {
            navigation.navigate('Chat', {
                recruiterId: item.otherParticipantId,
                recruiterName: item.otherParticipantName || 'Nhà tuyển dụng',
                jobId: item.jobId,
                jobTitle: item.jobTitle || 'Vị trí công việc',
                company: item.company || 'Công ty'
            });
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        
        // If the message is from today, show time
        if (messageDate.getTime() === today.getTime()) {
            return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        }
        
        // If the message is from this week, show day
        const daysDiff = Math.round((today - messageDate) / (1000 * 60 * 60 * 24));
        if (daysDiff < 7) {
            const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
            return days[date.getDay()];
        }
        
        // Otherwise, show date
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    const renderChatItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigateToChat(item)}>
            <Surface style={styles.chatItem}>
                <Avatar.Image 
                    source={{ uri: item.otherParticipantAvatar || 'https://via.placeholder.com/150' }} 
                    size={50} 
                />
                <View style={styles.chatInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name} numberOfLines={1}>
                            {item.otherParticipantName || 'Người dùng'}
                        </Text>
                        <Text style={styles.time}>
                            {formatTime(item.lastMessageTimestamp)}
                        </Text>
                    </View>
                    <View style={styles.messageRow}>
                        <Text style={styles.message} numberOfLines={1}>
                            {item.lastMessage || 'Bắt đầu trò chuyện...'}
                        </Text>
                        {item.unreadCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    {item.unreadCount > 99 ? '99+' : item.unreadCount}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Divider style={styles.divider} />
                </View>
            </Surface>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {error && (
                <View style={[
                    styles.errorContainer, 
                    error.type === 'warning' ? styles.warningContainer : styles.errorBgContainer
                ]}>
                    <Text style={[
                        styles.errorText,
                        error.type === 'warning' ? styles.warningText : styles.errorMsgText
                    ]}>
                        {error.message}
                    </Text>
                </View>
            )}
            
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#1E88E5" />
                </View>
            ) : chatRooms.length > 0 ? (
                <FlatList
                    data={chatRooms}
                    keyExtractor={(item) => item.id}
                    renderItem={renderChatItem}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    contentContainerStyle={styles.listContent}
                />
            ) : (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>
                        Bạn chưa có cuộc trò chuyện nào.
                    </Text>
                    <Button 
                        mode="contained" 
                        style={styles.button}
                        onPress={() => navigation.navigate('HomeTab')}
                    >
                        Quản lý tin tuyển dụng
                    </Button>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    listContent: {
        padding: 8,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        marginBottom: 16,
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
    },
    button: {
        marginTop: 8,
    },
    chatItem: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        backgroundColor: 'transparent',
        elevation: 0,
    },
    chatInfo: {
        flex: 1,
        marginLeft: 12,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
        flex: 1,
        marginRight: 8,
    },
    time: {
        color: '#9E9E9E',
        fontSize: 12,
    },
    errorContainer: {
        padding: 10,
        marginHorizontal: 8,
        marginTop: 8,
        marginBottom: 8,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    warningContainer: {
        backgroundColor: '#FFF8E1',
        borderLeftWidth: 4,
        borderLeftColor: '#FFA000',
    },
    errorBgContainer: {
        backgroundColor: '#FFEBEE',
        borderLeftWidth: 4,
        borderLeftColor: '#D32F2F',
    },
    errorText: {
        fontSize: 14,
        flex: 1,
    },
    warningText: {
        color: '#F57C00',
    },
    errorMsgText: {
        color: '#C62828',
    },
    messageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    message: {
        color: '#616161',
        flex: 1,
        marginRight: 8,
    },
    badge: {
        backgroundColor: '#1E88E5',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    divider: {
        marginTop: 16,
    },
});

export default ChatListScreen;

import { collection, doc, getDoc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useContext, useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Appbar, Avatar, Text, TextInput } from 'react-native-paper';
import { AuthContext } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import ChatService from '../../services/ChatService';

/**
 * Màn hình trò chuyện với người dùng cụ thể trong một phòng chat
 */
const SimpleTestChatRoomScreen = ({ route, navigation }) => {
  const { roomId } = route.params || {};
  const { user, role } = useContext(AuthContext);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const flatListRef = useRef(null);

  // Tải thông tin phòng và tin nhắn khi component được render
  useEffect(() => {
    if (!roomId) {
      navigation.goBack();
      return;
    }

    const loadRoomInfo = async () => {
      try {
        setLoading(true);
        
        // Lấy thông tin phòng chat
        const roomRef = doc(db, 'chatRooms', roomId);
        const roomSnap = await getDoc(roomRef);
        
        if (!roomSnap.exists()) {
          setError('Phòng chat không tồn tại.');
          setLoading(false);
          return;
        }
        
        const roomData = roomSnap.data();
        setRoomInfo(roomData);
        
        // Xác định người dùng khác trong cuộc trò chuyện
        const otherUserId = role === 'recruiter' 
          ? roomData.candidateId 
          : roomData.recruiterId;
        
        // Trong môi trường thực, bạn sẽ lấy thông tin người dùng từ API
        // Đây là dữ liệu mẫu cho mục đích thử nghiệm
        setOtherUser({
          id: otherUserId,
          name: otherUserId.includes('test_user') ? 'Người dùng test' : 'Người dùng khác',
          role: role === 'recruiter' ? 'candidate' : 'recruiter'
        });
        
        // Thiết lập lắng nghe tin nhắn
        setupMessageListener();
        
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi tải thông tin phòng chat:', error);
        setError(`Không thể tải thông tin phòng chat: ${error.message}`);
        setLoading(false);
      }
    };
    
    loadRoomInfo();
    
    return () => {
      // Dọn dẹp khi component unmount
    };
  }, [roomId]);

  /**
   * Thiết lập lắng nghe tin nhắn từ Firestore
   */
  const setupMessageListener = () => {
    try {
      const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messageList = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          messageList.push({
            id: doc.id,
            text: data.text,
            senderId: data.senderId,
            timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
            sender: data.sender || 'unknown'
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
        console.error('Lỗi khi lắng nghe tin nhắn:', error);
        setError(`Lỗi khi nhận tin nhắn: ${error.message}`);
      });
      
      // Trả về hàm hủy đăng ký để dọn dẹp khi component unmount
      return unsubscribe;
    } catch (error) {
      console.error('Lỗi khi thiết lập lắng nghe tin nhắn:', error);
      setError(`Lỗi khi thiết lập lắng nghe tin nhắn: ${error.message}`);
    }
  };

  /**
   * Gửi tin nhắn mới
   */
  const sendMessage = async () => {
    if (!message.trim() || !roomId) return;
    
    try {
      const messageToSend = message.trim();
      setMessage(''); // Xóa tin nhắn trong ô input
      
      await ChatService.sendMessage(roomId, user.id, messageToSend, role);
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      setError(`Không thể gửi tin nhắn: ${error.message}`);
    }
  };

  /**
   * Render từng tin nhắn
   */
  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === user.id;
    
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
          <Text style={[
            styles.timestamp,
            isCurrentUser ? styles.myTimestamp : styles.otherTimestamp
          ]}>
            {item.timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content 
          title={otherUser?.name || 'Cuộc trò chuyện'} 
          subtitle={otherUser?.role === 'recruiter' ? 'Nhà tuyển dụng' : 'Ứng viên'} 
        />
      </Appbar.Header>
      
      <View style={styles.content}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
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
          behavior={Platform.OS === 'ios' ? 'padding' : null}
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
                  disabled={message.trim() === ''}
                />
              }
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 0,
    marginBottom: 8,
  },
  errorText: {
    color: '#D32F2F',
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  avatar: {
    marginRight: 8,
    backgroundColor: '#9C27B0',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#E0E0E0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#212121',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
    opacity: 0.7,
  },
  myTimestamp: {
    color: '#E0E0E0',
  },
  otherTimestamp: {
    color: '#757575',
  },
  inputContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#9E9E9E',
    textAlign: 'center',
  },
});

export default SimpleTestChatRoomScreen;

// import axios from 'axios';
// import { initializeApp } from "firebase/app";
// import { getDatabase } from "firebase/database";
// import React, { useContext, useEffect, useRef, useState } from 'react';
// import { FlatList, KeyboardAvoidingView, StyleSheet, View } from 'react-native';
// import { Avatar, Text, useTheme } from 'react-native-paper';
// import { API_URL } from '../../config';
// import { AuthContext } from '../../contexts/AuthContext';

// // Import components
// import ScreenContainer from '../../components/layout/ScreenContainer';
// import ScreenHeader from '../../components/layout/ScreenHeader';
// import ErrorState from '../../components/states/ErrorState';
// import LoadingState from '../../components/states/LoadingState';
// import AppButton from '../../components/ui/AppButton';
// import AppInput from '../../components/ui/AppInput';

// const ChatScreen = ({ route, navigation }) => {
//     const { roomId } = route.params;
//     const [room, setRoom] = useState(null);
//     const [messages, setMessages] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [newMessage, setNewMessage] = useState('');
//     const [sending, setSending] = useState(false);
//     const { user } = useContext(AuthContext);
//     const theme = useTheme();
//     const flatListRef = useRef(null);

//     useEffect(() => {
//         fetchChatRoom();
//         setupMessagesListener();

//         return () => {
//             // Clean up Firebase listener
//             if (roomId) {
//                 firebase.database().ref(`chat_messages/${roomId}`).off();
//             }
//         };
//     }, [roomId]);

//     const fetchChatRoom = async () => {
//         try {
//             setLoading(true);
//             const response = await axios.get(`${API_URL}/api/chat-rooms/${roomId}/`);
//             setRoom(response.data);
//             setError(null);
//         } catch (error) {
//             console.error('Error fetching chat room:', error);
//             setError('Failed to load chat room. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const setupMessagesListener = () => {
//         firebase.database().ref(`chat_messages/${roomId}`)
//             .orderByChild('timestamp')
//             .on('value', (snapshot) => {
//                 const messageList = [];
//                 snapshot.forEach((childSnapshot) => {
//                     messageList.push({
//                         id: childSnapshot.key,
//                         ...childSnapshot.val()
//                     });
//                 });
//                 setMessages(messageList);

//                 // Scroll to bottom on new messages
//                 if (flatListRef.current && messageList.length > 0) {
//                     setTimeout(() => {
//                         flatListRef.current.scrollToEnd({ animated: true });
//                     }, 100);
//                 }
//             });
//     };

//     const sendMessage = async () => {
//         if (!newMessage.trim()) return;

//         try {
//             setSending(true);

//             // Add message to Firebase
//             await firebase.database().ref(`chat_messages/${roomId}`).push({
//                 text: newMessage.trim(),
//                 sender_id: user.id,
//                 timestamp: firebase.database.ServerValue.TIMESTAMP,
//             });

//             // Update last message in API
//             await axios.patch(`${API_URL}/api/chat-rooms/${roomId}/`, {
//                 last_message: newMessage.trim(),
//                 last_message_sender_id: user.id,
//             });

//             setNewMessage('');
//         } catch (error) {
//             console.error('Error sending message:', error);
//             alert('Failed to send message. Please try again.');
//         } finally {
//             setSending(false);
//         }
//     };

//     const renderMessage = ({ item }) => {
//         const isCurrentUser = item.sender_id === user.id;
//         const otherParticipant = room?.participants.find(p => p.id !== user.id);

//         return (
//             <View style={[
//                 styles.messageContainer,
//                 isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
//             ]}>
//                 {!isCurrentUser && (
//                     <Avatar.Image
//                         size={30}
//                         source={{ uri: otherParticipant?.avatar || 'https://via.placeholder.com/30' }}
//                         style={styles.avatar}
//                     />
//                 )}

//                 <View style={[
//                     styles.messageBubble,
//                     isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
//                 ]}>
//                     <Text style={styles.messageText}>{item.text}</Text>
//                     <Text style={styles.messageTime}>
//                         {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                     </Text>
//                 </View>
//             </View>
//         );
//     };

//     if (loading) {
//         return (
//             <ScreenContainer>
//                 <ScreenHeader
//                     title="Loading..."
//                     leftIcon="arrow-left"
//                     onLeftPress={() => navigation.goBack()}
//                 />
//                 <LoadingState message="Loading chat..." />
//             </ScreenContainer>
//         );
//     }

//     if (error) {
//         return (
//             <ScreenContainer>
//                 <ScreenHeader
//                     title="Error"
//                     leftIcon="arrow-left"
//                     onLeftPress={() => navigation.goBack()}
//                 />
//                 <ErrorState
//                     message={error}
//                     onRetry={fetchChatRoom}
//                 />
//             </ScreenContainer>
//         );
//     }

//     const otherParticipant = room?.participants.find(p => p.id !== user.id);

//     return (
//         <ScreenContainer>
//             <ScreenHeader
//                 title={otherParticipant?.name || 'Chat'}
//                 subtitle={room?.job?.title || ''}
//                 leftIcon="arrow-left"
//                 onLeftPress={() => navigation.goBack()}
//                 rightIcon="information-outline"
//                 onRightPress={() => {
//                     if (room?.job) {
//                         navigation.navigate('JobDetail', { jobId: room.job.id });
//                     }
//                 }}
//             />

//             <KeyboardAvoidingView
//                 style={styles.container}
//             >
                
//                 <FlatList
//                     ref={flatListRef}
//                     data={messages}
//                     renderItem={renderMessage}
//                     keyExtractor={item => item.id}
//                     contentContainerStyle={styles.messagesList}
//                     inverted={false}
//                 />

//                 <View style={styles.inputContainer}>
//                     <AppInput
//                         value={newMessage}
//                         onChangeText={setNewMessage}
//                         placeholder="Type a message..."
//                         multiline
//                         style={styles.input}
//                         right={
//                             <AppButton
//                                 mode="text"
//                                 onPress={sendMessage}
//                                 loading={sending}
//                                 disabled={sending || !newMessage.trim()}
//                                 icon="send"
//                                 style={styles.sendButton}
//                             />
//                         }
//                     />
//                 </View>
//             </KeyboardAvoidingView>
//         </ScreenContainer>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
//     messagesList: {
//         padding: 16,
//     },
//     messageContainer: {
//         flexDirection: 'row',
//         marginBottom: 16,
//         maxWidth: '80%',
//     },
//     currentUserMessage: {
//         alignSelf: 'flex-end',
//     },
//     otherUserMessage: {
//         alignSelf: 'flex-start',
//     },
//     avatar: {
//         marginRight: 8,
//         alignSelf: 'flex-end',
//     },
//     messageBubble: {
//         padding: 12,
//         borderRadius: 16,
//     },
//     currentUserBubble: {
//         backgroundColor: '#1E88E5',
//         borderBottomRightRadius: 4,
//     },
//     otherUserBubble: {
//         backgroundColor: '#f0f0f0',
//         borderBottomLeftRadius: 4,
//     },
//     messageText: {
//         fontSize: 16,
//         color: '#fff',
//     },
//     otherUserBubble: {
//         backgroundColor: '#f0f0f0',
//     },
//     currentUserBubble: {
//         backgroundColor: '#1E88E5',
//     },
//     messageText: {
//         fontSize: 16,
//     },
//     messageTime: {
//         fontSize: 10,
//         color: 'rgba(255, 255, 255, 0.7)',
//         alignSelf: 'flex-end',
//         marginTop: 4,
//     },
//     inputContainer: {
//         padding: 8,
//         backgroundColor: '#fff',
//         borderTopWidth: 1,
//         borderTopColor: '#e0e0e0',
//     },
//     input: {
//         maxHeight: 100,
//     },
//     sendButton: {
//         margin: 0,
//     },
// });

// export default ChatScreen;
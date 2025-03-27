// // screens/common/ChatListScreen.jsx
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import axios from 'axios';
// import firebase from 'firebase/app';
// import 'firebase/firestore';
// import React, { useContext, useEffect, useState } from 'react';
// import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
// import { ActivityIndicator, Avatar, Badge, Divider, Searchbar, Text, useTheme } from 'react-native-paper';
// import { API_URL, FIREBASE_CONFIG } from '../../config.js';
// import { AuthContext } from '../../contexts/AuthContext.jsx';

// // Initialize Firebase if not already initialized
// if (!firebase.apps.length) {
//     firebase.initializeApp(FIREBASE_CONFIG);
// }

// const ChatListScreen = ({ navigation }) => {
//     const [chatRooms, setChatRooms] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [refreshing, setRefreshing] = useState(false);
//     const [error, setError] = useState(null);
//     const [searchQuery, setSearchQuery] = useState('');
//     const { user } = useContext(AuthContext);
//     const theme = useTheme();

//     useEffect(() => {
//         fetchChatRooms();

//         // Listen for real-time updates
//         const db = firebase.firestore();
//         const unsubscribe = db.collection('chat_rooms')
//             .where('participants', 'array-contains', user.id)
//             .onSnapshot(snapshot => {
//                 // Update only if there are changes
//                 if (!snapshot.empty) {
//                     fetchChatRooms();
//                 }
//             }, error => {
//                 console.error('Firebase listener error:', error);
//             });

//         return () => unsubscribe();
//     }, []);

//     const fetchChatRooms = async () => {
//         try {
//             setLoading(true);
//             const response = await axios.get(`${API_URL}/api/chat-rooms/`);

//             // Sort by last message timestamp (most recent first)
//             const sortedRooms = response.data.sort((a, b) => {
//                 return new Date(b.last_message_time) - new Date(a.last_message_time);
//             });

//             setChatRooms(sortedRooms);
//             setError(null);
//         } catch (error) {
//             console.error('Error fetching chat rooms:', error);
//             setError('Failed to load chats. Please try again.');
//         } finally {
//             setLoading(false);
//             setRefreshing(false);
//         }
//     };

//     const onRefresh = () => {
//         setRefreshing(true);
//         fetchChatRooms();
//     };

//     const handleSearch = (query) => {
//         setSearchQuery(query);
//     };

//     const filteredChatRooms = chatRooms.filter(room => {
//         const otherParticipant = room.participants.find(p => p.id !== user.id);
//         return otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             (room.job && room.job.title.toLowerCase().includes(searchQuery.toLowerCase()));
//     });

//     const getOtherParticipant = (room) => {
//         return room.participants.find(p => p.id !== user.id);
//     };

//     const renderChatRoomItem = ({ item }) => {
//         const otherParticipant = getOtherParticipant(item);

//         return (
//             <TouchableOpacity
//                 style={styles.chatItem}
//                 onPress={() => navigation.navigate('ChatDetail', { roomId: item.id })}
//             >
//                 <Avatar.Image
//                     size={50}
//                     source={{ uri: otherParticipant.avatar || 'https://via.placeholder.com/50' }}
//                 />

//                 <View style={styles.chatInfo}>
//                     <View style={styles.nameRow}>
//                         <Text style={styles.name}>{otherParticipant.name}</Text>
//                         <Text style={styles.time}>
//                             {new Date(item.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                         </Text>
//                     </View>

//                     {item.job && (
//                         <Text style={styles.jobTitle}>
//                             <MaterialCommunityIcons name="briefcase" size={14} color="#666" />
//                             {' '}{item.job.title}
//                         </Text>
//                     )}

//                     <Text
//                         numberOfLines={1}
//                         style={[
//                             styles.lastMessage,
//                             !item.last_message_read && item.last_message_sender_id !== user.id && styles.unreadMessage
//                         ]}
//                     >
//                         {item.last_message_sender_id === user.id ? 'You: ' : ''}
//                         {item.last_message}
//                     </Text>
//                 </View>

//                 {!item.last_message_read && item.last_message_sender_id !== user.id && (
//                     <Badge style={styles.unreadBadge}>new</Badge>
//                 )}
//             </TouchableOpacity>
//         );
//     };

//     return (
//         <View style={styles.container}>
//             <Searchbar
//                 placeholder="Search chats..."
//                 onChangeText={handleSearch}
//                 value={searchQuery}
//                 style={styles.searchbar}
//             />

//             {loading && !refreshing ? (
//                 <View style={styles.loadingContainer}>
//                     <ActivityIndicator size="large" color={theme.colors.primary} />
//                     <Text style={styles.loadingText}>Loading chats...</Text>
//                 </View>
//             ) : error ? (
//                 <View style={styles.errorContainer}>
//                     <MaterialCommunityIcons name="alert-circle-outline" size={50} color="red" />
//                     <Text style={styles.errorText}>{error}</Text>
//                     <Button mode="contained" onPress={fetchChatRooms} style={styles.retryButton}>
//                         Retry
//                     </Button>
//                 </View>
//             ) : filteredChatRooms.length === 0 ? (
//                 <View style={styles.emptyContainer}>
//                     <MaterialCommunityIcons name="chat-outline" size={60} color="#ccc" />
//                     <Text style={styles.emptyText}>No chats yet</Text>
//                     <Text style={styles.emptySubtext}>
//                         {searchQuery ? 'No results found. Try a different search.' : 'Start a conversation from a job listing or application.'}
//                     </Text>
//                 </View>
//             ) : (
//                 <FlatList
//                     data={filteredChatRooms}
//                     renderItem={renderChatRoomItem}
//                     keyExtractor={item => item.id.toString()}
//                     ItemSeparatorComponent={() => <Divider />}
//                     contentContainerStyle={styles.listContainer}
//                     refreshControl={
//                         <RefreshControl
//                             refreshing={refreshing}
//                             onRefresh={onRefresh}
//                             colors={[theme.colors.primary]}
//                         />
//                     }
//                 />
//             )}
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#f5f5f5',
//     },
//     searchbar: {
//         margin: 8,
//         elevation: 2,
//     },
//     listContainer: {
//         paddingBottom: 16,
//     },
//     chatItem: {
//         flexDirection: 'row',
//         padding: 16,
//         backgroundColor: '#fff',
//         alignItems: 'center',
//     },
//     chatInfo: {
//         flex: 1,
//         marginLeft: 12,
//     },
//     nameRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//     },
//     name: {
//         fontWeight: 'bold',
//         fontSize: 16,
//     },
//     time: {
//         fontSize: 12,
//         color: '#999',
//     },
//     jobTitle: {
//         fontSize: 12,
//         color: '#666',
//         marginTop: 2,
//     },
//     lastMessage: {
//         fontSize: 14,
//         color: '#666',
//         marginTop: 4,
//     },
//     unreadMessage: {
//         fontWeight: 'bold',
//         color: '#333',
//     },
//     unreadBadge: {
//         backgroundColor: '#1E88E5',
//         marginLeft: 8,
//     },
//     loadingContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     loadingText: {
//         marginTop: 10,
//     },
//     errorContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 20,
//     },
//     errorText: {
//         marginTop: 10,
//         marginBottom: 20,
//         textAlign: 'center',
//     },
//     retryButton: {
//         marginTop: 10,
//     },
//     emptyContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         padding: 20,
//     },
//     emptyText: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         marginTop: 20,
//     },
//     emptySubtext: {
//         fontSize: 14,
//         color: '#666',
//         textAlign: 'center',
//         marginTop: 10,
//     },
// });

// export default ChatListScreen;
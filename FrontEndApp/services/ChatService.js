// Chat service for Firebase integration
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs, // Added this import
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Service for handling chat functionality with Firebase
 */
class ChatService {
  /**
   * Create a new chat room or return existing one between two users
   * @param {string} recruiterId - ID of the recruiter
   * @param {string} candidateId - ID of the candidate
   * @param {string} jobId - ID of the job (optional)
   * @returns {Promise<string>} - Chat room ID
   */
  async createOrGetChatRoom(recruiterId, candidateId, jobId = null) {
    try {
      // Create a unique ID for the chat room based on the participants
      const roomId = this.generateChatRoomId(recruiterId, candidateId, jobId);
      
      // Check if the chat room already exists
      const roomRef = doc(db, 'chatRooms', roomId);
      const roomSnapshot = await getDoc(roomRef);
      
      if (!roomSnapshot.exists()) {
        // Create a new chat room
        await setDoc(roomRef, {
          recruiterId,
          candidateId,
          jobId,
          participants: [recruiterId, candidateId], // Vẫn giữ để tiện tham chiếu
          createdAt: serverTimestamp(),
          lastMessage: null,
          lastMessageTimestamp: null
        });
        
        // Thêm participants vào subcollection theo yêu cầu của Firestore Rules
        const recruiterParticipantRef = doc(db, 'chatRooms', roomId, 'participants', recruiterId);
        await setDoc(recruiterParticipantRef, {
          type: 'recruiter',
          joinedAt: serverTimestamp()
        });
        
        const candidateParticipantRef = doc(db, 'chatRooms', roomId, 'participants', candidateId);
        await setDoc(candidateParticipantRef, {
          type: 'candidate',
          joinedAt: serverTimestamp()
        });
      }
      
      return roomId;
    } catch (error) {
      console.error('Error creating/getting chat room:', error);
      throw error;
    }
  }

  /**
   * Generate a unique chat room ID based on participants
   * @param {string} recruiterId 
   * @param {string} candidateId 
   * @param {string} jobId 
   * @returns {string} - Unique room ID
   */
  generateChatRoomId(recruiterId, candidateId, jobId = null) {
    const sortedIds = [recruiterId, candidateId].sort();
    return jobId 
      ? `${sortedIds[0]}_${sortedIds[1]}_${jobId}`
      : `${sortedIds[0]}_${sortedIds[1]}`;
  }

  /**
   * Send a message in a chat room
   * @param {string} roomId - Chat room ID 
   * @param {string} senderId - ID of the message sender
   * @param {string} text - Message content
   * @param {string} senderType - Type of sender ('recruiter' or 'candidate')
   * @returns {Promise<string>} - ID of the new message
   */
  async sendMessage(roomId, senderId, text, senderType) {
    try {
      const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
      const newMessage = {
        senderId,
        text,
        sender: senderType, // 'recruiter' or 'candidate'
        timestamp: serverTimestamp(),
        read: false
      };
      
      const docRef = await addDoc(messagesRef, newMessage);
      
      // Update the last message in the chat room
      const roomRef = doc(db, 'chatRooms', roomId);
      await updateDoc(roomRef, {
        lastMessage: text,
        lastMessageTimestamp: serverTimestamp(),
        lastSenderId: senderId
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Listen for new messages in a chat room
   * @param {string} roomId - Chat room ID
   * @param {function} callback - Function to call with new messages
   * @returns {function} - Unsubscribe function
   */
  subscribeToMessages(roomId, callback) {
    try {
      const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
      const messagesQuery = query(
        messagesRef,
        orderBy('timestamp', 'asc')
      );
      
      return onSnapshot(messagesQuery, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(messages);
      });
    } catch (error) {
      console.error('Error subscribing to messages:', error);
      throw error;
    }
  }

  /**
   * Get all chat rooms for a user (either recruiter or candidate)
   * @param {string} userId - User ID
   * @param {string} userType - Type of user ('recruiter' or 'candidate')
   * @param {function} callback - Function to call with chat rooms
   * @param {function} errorCallback - Function to call when there's an error (optional)
   * @returns {function} - Unsubscribe function
   */
  getUserChatRooms(userId, userType, callback, errorCallback) {
    try {
      // Thay đổi cách truy vấn để phù hợp với Firestore rules (dùng participants subcollection)
      const roomsRef = collection(db, 'chatRooms');
      
      // First try with the full query including ordering
      try {
        // Lấy danh sách phòng chat mà người dùng tham gia (dựa trên participants subcollection)
        // Đầu tiên, lấy tất cả các phòng
        const participantsQuery = query(
          collection(db, 'chatRooms'),
        );
        
        return onSnapshot(
          participantsQuery, 
          async (snapshot) => {
            const rooms = [];
            
            for (const roomDoc of snapshot.docs) {
              // Kiểm tra xem người dùng có trong subcollection participants không
              const participantRef = doc(db, 'chatRooms', roomDoc.id, 'participants', userId);
              const participantSnapshot = await getDoc(participantRef);
              
              if (participantSnapshot.exists()) {
                const roomData = roomDoc.data();
                
                // Get other participant info
                const otherParticipantId = userType === 'recruiter' 
                  ? roomData.candidateId 
                  : roomData.recruiterId;
                
                rooms.push({
                  id: roomDoc.id,
                  otherParticipantId,
                  jobId: roomData.jobId,
                  lastMessage: roomData.lastMessage,
                  lastMessageTimestamp: roomData.lastMessageTimestamp,
                  // Additional fields can be added here
                });
              }
            }
            
            // Sắp xếp theo thời gian tin nhắn cuối cùng
            rooms.sort((a, b) => {
              const timeA = a.lastMessageTimestamp ? a.lastMessageTimestamp.toMillis() : 0;
              const timeB = b.lastMessageTimestamp ? b.lastMessageTimestamp.toMillis() : 0;
              return timeB - timeA; // Descending order
            });
            
            callback(rooms);
          },
          error => {
            console.error('Error in chat rooms snapshot:', error);
            
            // Check if it's an index error
            if (error.code === 'failed-precondition' && error.message.includes('index')) {
              console.log('Missing index error, falling back to simpler query');
              
              // If it's an index error and errorCallback is provided, call it
              if (errorCallback) {
                errorCallback({
                  type: 'missing-index',
                  message: 'Missing Firestore index. This might affect the order of messages.',
                  originalError: error
                });
              }
              
              // Try a simpler query without ordering as fallback
              this.getUserChatRoomsWithoutOrdering(userId, userType, callback);
            } else if (errorCallback) {
              errorCallback({
                type: 'other',
                message: 'Error loading chat rooms',
                originalError: error
              });
            }
          }
        );
      } catch (queryError) {
        console.error('Error creating query:', queryError);
        // Fall back to the simpler query
        return this.getUserChatRoomsWithoutOrdering(userId, userType, callback);
      }
    } catch (error) {
      console.error('Error getting user chat rooms:', error);
      if (errorCallback) {
        errorCallback({
          type: 'general',
          message: 'Error loading chat rooms',
          originalError: error
        });
      }
      throw error;
    }
  }

  /**
   * Fallback method to get chat rooms without ordering
   * This is used when the full query fails due to missing index
   * @private
   */
  getUserChatRoomsWithoutOrdering(userId, userType, callback) {
    const fieldToQuery = userType === 'recruiter' ? 'recruiterId' : 'candidateId';
    const roomsRef = collection(db, 'chatRooms');
    
    // Simpler query without ordering
    const simpleQuery = query(
      roomsRef,
      where(fieldToQuery, '==', userId)
    );
    
    return onSnapshot(simpleQuery, async (snapshot) => {
      const rooms = [];
      
      for (const doc of snapshot.docs) {
        const roomData = doc.data();
        
        // Get other participant info
        const otherParticipantId = userType === 'recruiter' 
          ? roomData.candidateId 
          : roomData.recruiterId;
        
        rooms.push({
          id: doc.id,
          otherParticipantId,
          jobId: roomData.jobId,
          lastMessage: roomData.lastMessage,
          lastMessageTimestamp: roomData.lastMessageTimestamp,
        });
      }
      
      // Sort manually since we can't do it in the query
      rooms.sort((a, b) => {
        const timeA = a.lastMessageTimestamp ? a.lastMessageTimestamp.toMillis() : 0;
        const timeB = b.lastMessageTimestamp ? b.lastMessageTimestamp.toMillis() : 0;
        return timeB - timeA; // Descending order
      });
      
      callback(rooms);
    });
  }

  /**
   * Mark all messages as read in a chat room for a user
   * @param {string} roomId - Chat room ID
   * @param {string} userId - ID of the user reading the messages
   * @returns {Promise<void>}
   */
  async markMessagesAsRead(roomId, userId) {
    try {
      const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
      const unreadQuery = query(
        messagesRef,
        where('read', '==', false),
        where('senderId', '!=', userId)
      );
      
      const unreadSnapshot = await getDocs(unreadQuery);
      
      // Update each document individually instead of using a batch
      const updatePromises = [];
      unreadSnapshot.forEach((document) => {
        const docRef = doc(db, 'chatRooms', roomId, 'messages', document.id);
        updatePromises.push(updateDoc(docRef, { read: true }));
      });
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }
}

export default new ChatService();

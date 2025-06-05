// Chat service for Firebase Realtime Database
import {
  get,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  serverTimestamp,
  set,
  update
} from 'firebase/database';
import { database } from '../firebase/config';

/**
 * Service for handling chat functionality with Firebase Realtime Database
 */
class ChatServiceSimple {
  async createOrGetChatRoom(recruiterId, candidateId, jobId = null, recruiterInfo = null, candidateInfo = null, jobInfo = null) {
    try {
      // Validate inputs
      if (!recruiterId || !candidateId) {
        throw new Error('Both recruiterId and candidateId are required');
      }
      // Create a unique ID for the chat room based on the participants
      const roomId = this.generateChatRoomId(recruiterId, candidateId, jobId);
      // Reference to the chat room
      const roomRef = ref(database, `chatRooms/${roomId}`);
      // Check if the room exists by getting a snapshot
      const snapshot = await get(roomRef);
      if (!snapshot.exists()) {
        // Room doesn't exist, create a new one
        const room = {
          id: roomId,
          recruiterId,
          candidateId,
          jobId: jobId || null,
          createdAt: serverTimestamp(),
          lastMessage: null,
          lastMessageTimestamp: null,
          recruiterInfo: recruiterInfo || null,
          candidateInfo: candidateInfo || null,
          jobInfo: jobInfo || null, // Lưu thông tin job (id, title, ...)
          participants: {
            [recruiterId]: {
              id: recruiterId,
              role: 'recruiter',
              lastRead: null
            },
            [candidateId]: {
              id: candidateId,
              role: 'candidate',
              lastRead: null
            }
          }
        };
        // Save the new room
        await set(roomRef, room);
        console.log('Created new chat room:', roomId);
      } else {
        // Nếu phòng chat đã có nhưng thiếu info thì cập nhật
        const updates = {};
        const roomData = snapshot.val();
        if (!roomData.recruiterInfo && recruiterInfo) {
          updates.recruiterInfo = recruiterInfo;
        }
        if (!roomData.candidateInfo && candidateInfo) {
          updates.candidateInfo = candidateInfo;
        }
        if (!roomData.jobInfo && jobInfo) {
          updates.jobInfo = jobInfo;
        }
        if (Object.keys(updates).length > 0) {
          await update(roomRef, updates);
        }
        console.log('Chat room already exists:', roomId);
      }
      return roomId;
    } catch (error) {
      console.error('Error creating/getting chat room:', error);
      throw error;
    }
  }
  generateChatRoomId(recruiterId, candidateId, jobId = null) {
    // Sort IDs to ensure the same room ID regardless of order
    const sortedIds = [recruiterId, candidateId].sort();
    return jobId ? 
      `${sortedIds[0]}_${sortedIds[1]}_${jobId}` :
      `${sortedIds[0]}_${sortedIds[1]}`;
  }

  async sendMessage(roomId, senderId, text, senderType, senderInfo) {
    try {
      if (!roomId || !senderId || !text) {
        throw new Error('RoomId, senderId, and text are required');
      }
      // Reference to the messages collection in the chat room
      const messagesRef = ref(database, `chatRooms/${roomId}/messages`);
      // Create a new message with a unique ID
      const newMessageRef = push(messagesRef);
      const message = {
        id: newMessageRef.key,
        text,
        senderId,
        sender: senderType,
        senderInfo: senderInfo || null,
        timestamp: serverTimestamp(),
        read: false
      };
      // Save the new message
      await set(newMessageRef, message);
      // Update the last message in the chat room
      await update(ref(database, `chatRooms/${roomId}`), {
        lastMessage: text,
        lastMessageTimestamp: serverTimestamp(),
        lastSenderId: senderId
      });
      return newMessageRef.key;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  subscribeToMessages(roomId, callback, errorCallback) {
    try {
      if (!roomId) {
        throw new Error('roomId is required');
      }
      
      // Reference to the messages collection in the chat room
      const messagesRef = ref(database, `chatRooms/${roomId}/messages`);
      
      // Create a query to get messages ordered by timestamp
      const messagesQuery = query(messagesRef, orderByChild('timestamp'));
      
      // Listen for value changes
      const unsubscribe = onValue(messagesQuery, (snapshot) => {
        const messages = [];
        
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const messageId = childSnapshot.key;
            const messageData = childSnapshot.val();
            
            messages.push({
              id: messageId,
              ...messageData,
              // Convert server timestamp to JS Date if needed
              timestamp: messageData.timestamp ? messageData.timestamp : new Date().getTime()
            });
          });
        }
        
        callback(messages);
      }, (error) => {
        console.error('Error subscribing to messages:', error);
        if (errorCallback) {
          errorCallback(error);
        }
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up message subscription:', error);
      if (errorCallback) {
        errorCallback(error);
      }
      throw error;
    }
  }

  getUserChatRooms(userId, userType, callback, errorCallback) {
    try {
      if (!userId || !userType) {
        throw new Error('userId and userType are required');
      }
      
      // Determine which field to query based on user type
      const userIdField = userType === 'recruiter' ? 'recruiterId' : 'candidateId';
      
      // Reference to the chat rooms collection
      const roomsRef = ref(database, 'chatRooms');
      
      // We need to load all rooms and filter client-side because Firebase RTDB
      // doesn't support complex queries like Firestore
      const unsubscribe = onValue(roomsRef, (snapshot) => {
        const chatRooms = [];
        
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const roomId = childSnapshot.key;
            const roomData = childSnapshot.val();
            
            // Filter rooms for the current user
            if (roomData[userIdField] === userId) {
              chatRooms.push({
                id: roomId,
                ...roomData
              });
            }
          });
        }
        
        // Sort by last message time (most recent first)
        chatRooms.sort((a, b) => {
          const timeA = a.lastMessageTimestamp || a.createdAt || 0;
          const timeB = b.lastMessageTimestamp || b.createdAt || 0;
          return timeB - timeA;
        });
        
        callback(chatRooms);
      }, (error) => {
        console.error('Error getting user chat rooms:', error);
        if (errorCallback) {
          errorCallback(error);
        }
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up chat rooms subscription:', error);
      if (errorCallback) {
        errorCallback(error);
      }
      throw error;
    }
  }

  async markMessagesAsRead(roomId, userId) {
    try {
      if (!roomId || !userId) {
        throw new Error('roomId and userId are required');
      }
      
      // Reference to the chat room
      const roomRef = ref(database, `chatRooms/${roomId}`);
      
      // Get the room data
      const snapshot = await get(roomRef);
      
      if (!snapshot.exists()) {
        throw new Error('Chat room not found');
      }
      
      const room = snapshot.val();
      
      // Update the lastRead timestamp for the user
      await update(ref(database, `chatRooms/${roomId}/participants/${userId}`), {
        lastRead: serverTimestamp()
      });
      
      // Mark all messages as read
      const messagesRef = ref(database, `chatRooms/${roomId}/messages`);
      const messagesSnapshot = await get(messagesRef);
      
      if (messagesSnapshot.exists()) {
        const updates = {};
        
        messagesSnapshot.forEach((childSnapshot) => {
          const messageId = childSnapshot.key;
          const messageData = childSnapshot.val();
          
          // Only mark messages from the other user as read
          if (messageData.senderId !== userId && !messageData.read) {
            updates[`${messageId}/read`] = true;
          }
        });
        
        // Apply updates if there are any
        if (Object.keys(updates).length > 0) {
          await update(messagesRef, updates);
        }
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  async getUnreadMessageCount(roomId, userId) {
    try {
      if (!roomId || !userId) {
        throw new Error('roomId and userId are required');
      }
      
      // Reference to the messages in the chat room
      const messagesRef = ref(database, `chatRooms/${roomId}/messages`);
      
      // Get all messages
      const snapshot = await get(messagesRef);
      
      if (!snapshot.exists()) {
        return 0;
      }
      
      let unreadCount = 0;
      
      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val();
        
        // Count messages from other users that are not read
        if (message.senderId !== userId && !message.read) {
          unreadCount++;
        }
      });
      
      return unreadCount;
    } catch (error) {
      console.error('Error getting unread message count:', error);
      throw error;
    }
  }

  async deleteChatRoom(roomId) {
    try {
      if (!roomId) throw new Error('roomId is required');
      const roomRef = ref(database, `chatRooms/${roomId}`);
      await set(roomRef, null);
    } catch (error) {
      console.error('Error deleting chat room:', error);
      throw error;
    }
  }
}

export default new ChatServiceSimple();

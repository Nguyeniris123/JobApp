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
  /**
   * Create a new chat room or return existing one between two users
   * @param {string} recruiterId - ID of the recruiter
   * @param {string} candidateId - ID of the candidate
   * @param {string} jobId - ID of the job (optional)
   * @param {object} recruiterInfo - Thông tin thật của recruiter (optional)
   * @param {object} candidateInfo - Thông tin thật của candidate (optional)
   * @param {object} jobInfo - Thông tin công việc (id, title, ...) (optional)
   * @returns {Promise<string>} - Chat room ID
   */
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

  /**
   * Generate a unique chat room ID based on participants
   * @param {string} recruiterId 
   * @param {string} candidateId 
   * @param {string} jobId 
   * @returns {string} - Unique room ID
   */
  generateChatRoomId(recruiterId, candidateId, jobId = null) {
    // Sort IDs to ensure the same room ID regardless of order
    const sortedIds = [recruiterId, candidateId].sort();
    return jobId ? 
      `${sortedIds[0]}_${sortedIds[1]}_${jobId}` :
      `${sortedIds[0]}_${sortedIds[1]}`;
  }

  /**
   * Send a message in a chat room
   * @param {string} roomId - Chat room ID 
   * @param {string} senderId - ID of the message sender
   * @param {string} text - Message content
   * @param {string} senderType - Type of sender ('recruiter' or 'candidate')
   * @param {object} senderInfo - Thông tin thật của người gửi (tùy chọn)
   * @returns {Promise<string>} - ID of the new message
   */
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

  /**
   * Listen for new messages in a chat room
   * @param {string} roomId - Chat room ID
   * @param {function} callback - Function to call with new messages
   * @param {function} errorCallback - Function to call with errors (optional)
   * @returns {function} - Unsubscribe function
   */
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

  /**
   * Mark all messages as read in a chat room for a user
   * @param {string} roomId - Chat room ID
   * @param {string} userId - ID of the user reading the messages
   * @returns {Promise<void>}
   */
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

  /**
   * Get the unread message count for a user in a specific chat room
   * @param {string} roomId - Chat room ID
   * @param {string} userId - User ID
   * @returns {Promise<number>} - Number of unread messages
   */
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

  /**
   * Xóa toàn bộ phòng chat và tin nhắn
   * @param {string} roomId
   * @returns {Promise<void>}
   */
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

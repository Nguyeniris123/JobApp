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
      // Validate inputs
      if (!recruiterId || !candidateId) {
        throw new Error('Recruiter ID and Candidate ID are required');
      }
      
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
          participants: [recruiterId, candidateId], // Keep for reference
          createdAt: serverTimestamp(),
          lastMessage: null,
          lastMessageTimestamp: null,
          lastSenderId: null
        });
        
        // Create participants subcollection for Firestore Rules to work
        // IMPORTANT: We must create participants subcollection 
        const recruiterParticipantRef = doc(db, 'chatRooms', roomId, 'participants', recruiterId);
        await setDoc(recruiterParticipantRef, {
          type: 'recruiter',
          userId: recruiterId,
          joinedAt: serverTimestamp()
        });
        
        const candidateParticipantRef = doc(db, 'chatRooms', roomId, 'participants', candidateId);
        await setDoc(candidateParticipantRef, {
          type: 'candidate',
          userId: candidateId,
          joinedAt: serverTimestamp()
        });
      } else {
        console.log(`Chat room ${roomId} already exists`);
        
        // Ensure participants subcollection exists (fix for older chat rooms)
        const recruiterParticipantRef = doc(db, 'chatRooms', roomId, 'participants', recruiterId);
        const recruiterParticipantSnapshot = await getDoc(recruiterParticipantRef);
        
        if (!recruiterParticipantSnapshot.exists()) {
          console.log(`Creating recruiter participant record for ${recruiterId}`);
          await setDoc(recruiterParticipantRef, {
            type: 'recruiter',
            userId: recruiterId,
            joinedAt: serverTimestamp()
          });
        }
        
        const candidateParticipantRef = doc(db, 'chatRooms', roomId, 'participants', candidateId);
        const candidateParticipantSnapshot = await getDoc(candidateParticipantRef);
        
        if (!candidateParticipantSnapshot.exists()) {
          console.log(`Creating candidate participant record for ${candidateId}`);
          await setDoc(candidateParticipantRef, {
            type: 'candidate',
            userId: candidateId,
            joinedAt: serverTimestamp()
          });
        }
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
   * @param {function} errorCallback - Function to call with errors (optional)
   * @returns {function} - Unsubscribe function
   */
  subscribeToMessages(roomId, callback, errorCallback) {
    try {
      const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
      const messagesQuery = query(
        messagesRef,
        orderBy('timestamp', 'asc')
      );
      
      return onSnapshot(
        messagesQuery, 
        (snapshot) => {
          const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          callback(messages);
        },
        (error) => {
          console.error('Error in messages snapshot:', error);
          if (errorCallback) {
            errorCallback(error);
          } else {
            console.error('Unhandled error in subscribeToMessages:', error);
          }
        }
      );
    } catch (error) {
      console.error('Error subscribing to messages:', error);
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
      // Modify query to work with Firestore rules (using participants subcollection)
      
      // First try with the full query including ordering
      try {
        // Since we can't directly query subcollections across documents with the security rules,
        // we'll use a workaround
        
        // Get all chat rooms and then filter by participant
        const participantsQuery = query(
          collection(db, 'chatRooms')
        );
        
        return onSnapshot(
          participantsQuery, 
          async (snapshot) => {
            const rooms = [];
            
            // For each room, check if current user is a participant
            for (const roomDoc of snapshot.docs) {
              try {
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
              } catch (participantError) {
                console.error(`Error checking participant for room ${roomDoc.id}:`, participantError);
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
    // Get all chat rooms (we can't filter by participant with the new rules structure)
    const roomsRef = collection(db, 'chatRooms');
    const simpleQuery = query(roomsRef);
    
    return onSnapshot(simpleQuery, async (snapshot) => {
      const rooms = [];
      
      for (const roomDoc of snapshot.docs) {
        // Check if user is a participant in this room
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
          });
        }
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

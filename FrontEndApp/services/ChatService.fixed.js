// Chat service for Firebase integration
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
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
        console.log(`Creating new chat room: ${roomId}`);
        
        // Create a new chat room
        await setDoc(roomRef, {
          recruiterId,
          candidateId,
          jobId,
          createdAt: serverTimestamp(),
          lastMessage: null,
          lastMessageTimestamp: null,
          lastSenderId: null
        });
        
        // Create participants subcollection for Firestore Rules to work
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
      console.log(`Sending message in room ${roomId} from ${senderId}`);
      
      // Check if sender is in participants
      const participantRef = doc(db, 'chatRooms', roomId, 'participants', senderId);
      const participantSnapshot = await getDoc(participantRef);
      
      if (!participantSnapshot.exists()) {
        throw new Error('Sender is not a participant in this chat room');
      }
      
      const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
      const newMessage = {
        senderId,
        text,
        sender: senderType,
        timestamp: serverTimestamp(),
        read: false
      };
      
      const docRef = await addDoc(messagesRef, newMessage);
      console.log(`Added message with ID: ${docRef.id}`);
      
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
      console.log(`Subscribing to messages in room ${roomId}`);
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
          console.log(`Got ${messages.length} messages from room ${roomId}`);
          callback(messages);
        },
        (error) => {
          console.error(`Error in messages snapshot for room ${roomId}:`, error);
          if (errorCallback) {
            errorCallback(error);
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
      console.log(`Getting chat rooms for user ${userId} of type ${userType}`);
      
      // Get all chat rooms and check participants subcollection
      const roomsQuery = query(collection(db, 'chatRooms'));
      
      return onSnapshot(
        roomsQuery, 
        async (snapshot) => {
          try {
            const rooms = [];
            
            for (const roomDoc of snapshot.docs) {
              try {
                // Check if user is in participants subcollection
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
                    lastSenderId: roomData.lastSenderId,
                    unreadCount: 0 // Will be calculated separately if needed
                  });
                }
              } catch (participantError) {
                console.error(`Error checking participant for room ${roomDoc.id}:`, participantError);
              }
            }
            
            // Sort by most recent message
            rooms.sort((a, b) => {
              const timeA = a.lastMessageTimestamp ? a.lastMessageTimestamp.toMillis() : 0;
              const timeB = b.lastMessageTimestamp ? b.lastMessageTimestamp.toMillis() : 0;
              return timeB - timeA; // Descending order
            });
            
            console.log(`Found ${rooms.length} chat rooms for user ${userId}`);
            callback(rooms);
          } catch (processingError) {
            console.error('Error processing chat rooms:', processingError);
            if (errorCallback) {
              errorCallback({
                type: 'processing',
                message: 'Error processing chat rooms',
                originalError: processingError
              });
            }
          }
        },
        (error) => {
          console.error('Error in chat rooms snapshot:', error);
          if (errorCallback) {
            errorCallback({
              type: 'snapshot',
              message: 'Error loading chat rooms',
              originalError: error
            });
          }
        }
      );
    } catch (error) {
      console.error('Error setting up chat rooms listener:', error);
      if (errorCallback) {
        errorCallback({
          type: 'setup',
          message: 'Error setting up chat listener',
          originalError: error
        });
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
      console.log(`Marking messages as read in room ${roomId} for user ${userId}`);
      
      // Check if user is a participant
      const participantRef = doc(db, 'chatRooms', roomId, 'participants', userId);
      const participantSnapshot = await getDoc(participantRef);
      
      if (!participantSnapshot.exists()) {
        throw new Error('User is not a participant in this chat room');
      }
      
      const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
      const unreadQuery = query(
        messagesRef,
        where('read', '==', false),
        where('senderId', '!=', userId)
      );
      
      const unreadSnapshot = await getDocs(unreadQuery);
      
      // Update each unread message
      const updatePromises = [];
      unreadSnapshot.forEach((document) => {
        const docRef = doc(db, 'chatRooms', roomId, 'messages', document.id);
        updatePromises.push(updateDoc(docRef, { read: true }));
      });
      
      await Promise.all(updatePromises);
      console.log(`Marked ${updatePromises.length} messages as read`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }
}

export default new ChatService();

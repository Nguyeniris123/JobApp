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
import FirebaseAuthService from './FirebaseAuthService';

/**
 * Service để xử lý chức năng chat với Firebase
 */
class ChatService {
  /**
   * Tạo mới hoặc lấy về chatroom hiện có giữa hai người dùng
   * @param {string} recruiterId - ID của nhà tuyển dụng
   * @param {string} candidateId - ID của ứng viên
   * @param {string} jobId - ID của công việc (tùy chọn)
   * @returns {Promise<string>} - ID của chatroom
   */
  async createOrGetChatRoom(recruiterId, candidateId, jobId = null) {
    try {
      // Đảm bảo đã xác thực với Firebase
      await FirebaseAuthService.ensureAuthenticated();
      
      // Kiểm tra đầu vào
      if (!recruiterId || !candidateId) {
        throw new Error('Yêu cầu ID của nhà tuyển dụng và ứng viên');
      }
      
      console.log(`Đang tạo/lấy chatroom giữa ứng viên ${candidateId} và nhà tuyển dụng ${recruiterId}${jobId ? ` cho công việc ${jobId}` : ''}`);
      
      // Tạo ID duy nhất cho chatroom dựa trên người tham gia
      const roomId = this.generateChatRoomId(recruiterId, candidateId, jobId);
      
      // Kiểm tra xem chatroom đã tồn tại chưa
      const roomRef = doc(db, 'chatRooms', roomId);
      const roomSnapshot = await getDoc(roomRef);
      
      if (!roomSnapshot.exists()) {
        console.log(`Tạo chatroom mới: ${roomId}`);
        
        // Tạo chatroom mới
        await setDoc(roomRef, {
          recruiterId: recruiterId.toString(),
          candidateId: candidateId.toString(),
          jobId: jobId ? jobId.toString() : null,
          createdAt: serverTimestamp(),
          lastMessage: null,
          lastMessageTime: null,
          participantIds: [recruiterId.toString(), candidateId.toString()]
        });
      } else {
        console.log(`Chatroom đã tồn tại: ${roomId}`);
      }
      
      return roomId;
    } catch (error) {
      console.error('Lỗi khi tạo/lấy chatroom:', error);
      throw error;
    }
  }
  
  /**
   * Tạo ID duy nhất cho chatroom dựa trên người tham gia
   * @param {string} recruiterId - ID của nhà tuyển dụng
   * @param {string} candidateId - ID của ứng viên
   * @param {string} jobId - ID của công việc (tùy chọn)
   * @returns {string} - ID của chatroom
   */
  generateChatRoomId(recruiterId, candidateId, jobId = null) {
    // Sắp xếp ID để đảm bảo nhất quán
    const sortedIds = [recruiterId.toString(), candidateId.toString()].sort();
    
    // Tạo ID chatroom
    let roomId = `${sortedIds[0]}_${sortedIds[1]}`;
    
    // Thêm jobId nếu có
    if (jobId) {
      roomId += `_${jobId}`;
    }
    
    return roomId;
  }
  
  /**
   * Đăng ký nhận cập nhật về tin nhắn mới trong chatroom
   * @param {string} roomId - ID của chatroom
   * @param {Function} onUpdate - Hàm callback khi có tin nhắn mới
   * @param {Function} onError - Hàm callback khi có lỗi
   * @returns {Function} - Hàm để hủy đăng ký
   */
  subscribeToMessages(roomId, onUpdate, onError) {
    try {
      // Đảm bảo đã có roomId
      if (!roomId) {
        throw new Error('Yêu cầu ID của chatroom');
      }
      
      console.log(`Đăng ký nhận tin nhắn cho chatroom: ${roomId}`);
      
      // Tạo query để lấy tin nhắn từ Firestore
      const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
      const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
      
      // Đăng ký nhận cập nhật
      const unsubscribe = onSnapshot(messagesQuery, 
        (snapshot) => {
          const messages = [];
          snapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() });
          });
          onUpdate(messages);
        },
        (error) => {
          console.error('Lỗi khi đăng ký nhận tin nhắn:', error);
          if (onError) {
            onError(error);
          }
        }
      );
      
      return unsubscribe;
    } catch (error) {
      console.error('Lỗi khi đăng ký nhận tin nhắn:', error);
      if (onError) {
        onError(error);
      }
      // Trả về hàm trống để tránh lỗi khi unsubscribe
      return () => {};
    }
  }
  
  /**
   * Gửi tin nhắn mới
   * @param {string} roomId - ID của chatroom
   * @param {string} senderId - ID của người gửi
   * @param {string} message - Nội dung tin nhắn
   * @param {string} senderType - Loại người gửi ('candidate' hoặc 'recruiter')
   * @returns {Promise<Object>} - Tin nhắn vừa gửi
   */
  async sendMessage(roomId, senderId, message, senderType) {
    try {
      // Đảm bảo đã xác thực với Firebase
      await FirebaseAuthService.ensureAuthenticated();
      
      // Kiểm tra đầu vào
      if (!roomId || !senderId || !message || !senderType) {
        throw new Error('Thiếu thông tin để gửi tin nhắn');
      }
      
      console.log(`Gửi tin nhắn từ ${senderType} ${senderId} trong chatroom ${roomId}`);
      
      // Tạo tin nhắn mới
      const newMessage = {
        senderId: senderId.toString(),
        message,
        timestamp: serverTimestamp(),
        read: false,
        sender: senderType // 'candidate' hoặc 'recruiter'
      };
      
      // Thêm tin nhắn vào Firestore
      const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
      const messageDoc = await addDoc(messagesRef, newMessage);
      
      // Cập nhật tin nhắn mới nhất của chatroom
      const roomRef = doc(db, 'chatRooms', roomId);
      await updateDoc(roomRef, {
        lastMessage: message,
        lastMessageTime: serverTimestamp(),
        lastSenderId: senderId.toString()
      });
      
      return { id: messageDoc.id, ...newMessage, timestamp: new Date() };
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      throw error;
    }
  }
  
  /**
   * Đánh dấu tất cả tin nhắn là đã đọc
   * @param {string} roomId - ID của chatroom
   * @param {string} userId - ID của người đọc
   * @returns {Promise<void>}
   */
  async markMessagesAsRead(roomId, userId) {
    try {
      // Đảm bảo đã xác thực với Firebase
      await FirebaseAuthService.ensureAuthenticated();
      
      // Kiểm tra đầu vào
      if (!roomId || !userId) {
        throw new Error('Yêu cầu ID của chatroom và người dùng');
      }
      
      console.log(`Đánh dấu tin nhắn là đã đọc cho người dùng ${userId} trong chatroom ${roomId}`);
      
      // Lấy tin nhắn chưa đọc của người dùng khác
      const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
      const unreadQuery = query(messagesRef, where('read', '==', false), where('senderId', '!=', userId.toString()));
      const unreadSnapshot = await getDocs(unreadQuery);
      
      // Cập nhật trạng thái đã đọc
      const batch = db.batch();
      unreadSnapshot.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });
      
      await batch.commit();
      console.log(`Đã đánh dấu ${unreadSnapshot.size} tin nhắn là đã đọc`);
    } catch (error) {
      console.error('Lỗi khi đánh dấu tin nhắn đã đọc:', error);
      throw error;
    }
  }
  
  /**
   * Lấy danh sách chatroom của một người dùng
   * @param {string} userId - ID của người dùng
   * @param {string} userType - Loại người dùng ('candidate' hoặc 'recruiter')
   * @returns {Promise<Array>} - Danh sách chatroom
   */
  async getChatRooms(userId, userType) {
    try {
      // Đảm bảo đã xác thực với Firebase
      await FirebaseAuthService.ensureAuthenticated();
      
      // Kiểm tra đầu vào
      if (!userId || !userType) {
        throw new Error('Yêu cầu ID và loại người dùng');
      }
      
      console.log(`Lấy chatroom cho ${userType} ${userId}`);
      
      // Xác định field để query dựa trên loại người dùng
      const userIdField = userType === 'candidate' ? 'candidateId' : 'recruiterId';
      
      // Tạo query
      const roomsRef = collection(db, 'chatRooms');
      const roomsQuery = query(roomsRef, where(userIdField, '==', userId.toString()));
      const roomsSnapshot = await getDocs(roomsQuery);
      
      // Xử lý kết quả
      const chatRooms = [];
      for (const roomDoc of roomsSnapshot.docs) {
        const roomData = roomDoc.data();
        
        // Lấy thông tin tin nhắn mới nhất
        let lastMessage = null;
        if (roomData.lastMessageTime) {
          lastMessage = {
            message: roomData.lastMessage,
            timestamp: roomData.lastMessageTime.toDate(),
            senderId: roomData.lastSenderId
          };
        }
        
        // Lấy số tin nhắn chưa đọc
        const messagesRef = collection(db, 'chatRooms', roomDoc.id, 'messages');
        const unreadQuery = query(messagesRef, where('read', '==', false), where('senderId', '!=', userId.toString()));
        const unreadSnapshot = await getDocs(unreadQuery);
        
        chatRooms.push({
          id: roomDoc.id,
          recruiterId: roomData.recruiterId,
          candidateId: roomData.candidateId,
          jobId: roomData.jobId,
          createdAt: roomData.createdAt ? roomData.createdAt.toDate() : null,
          lastMessage,
          unreadCount: unreadSnapshot.size
        });
      }
      
      return chatRooms;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách chatroom:', error);
      throw error;
    }
  }
}

// Export instance duy nhất
export default new ChatService();

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signOut } from 'firebase/auth';
import { API_ENDPOINTS } from '../apiConfig';
import { firebaseConfig } from '../firebase/config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

class FirebaseAuthService {
  /**
   * Xác thực Firebase bằng custom token từ backend
   * @returns {Promise<Object>} Thông tin người dùng Firebase
   */
  async authenticateWithBackend() {
    try {
      // Lấy accessToken từ AsyncStorage
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      if (!accessToken) {
        console.error('Không có accessToken để xác thực Firebase');
        throw new Error('Không có accessToken để xác thực Firebase');
      }

      console.log('Đang gọi API lấy Firebase token');
      
      // Gọi API để lấy Firebase custom token
      const response = await axios.get(API_ENDPOINTS.FIREBASE_TOKEN, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.data || !response.data.firebase_token) {
        console.error('API không trả về Firebase token');
        throw new Error('API không trả về Firebase token');
      }

      const firebaseToken = response.data.firebase_token;
      console.log('Nhận được Firebase token, đang xác thực với Firebase');
      
      // Đăng nhập vào Firebase bằng custom token
      const userCredential = await signInWithCustomToken(auth, firebaseToken);
      console.log('Đăng nhập Firebase thành công');
      
      return userCredential.user;
    } catch (error) {
      console.error('Lỗi khi xác thực Firebase:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra trạng thái xác thực Firebase và xác thực lại nếu cần
   * @returns {Promise<Object>} Thông tin người dùng Firebase
   */
  async ensureAuthenticated() {
    try {
      // Kiểm tra người dùng hiện tại
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        // Nếu người dùng đã đăng nhập, lấy token mới để đảm bảo token chưa hết hạn
        await currentUser.getIdToken(true);
        console.log('Firebase user đã đăng nhập sẵn:', currentUser.uid);
        return currentUser;
      }
      
      // Nếu chưa đăng nhập, xác thực với backend
      return await this.authenticateWithBackend();
    } catch (error) {
      console.error('Lỗi khi đảm bảo xác thực Firebase:', error);
      
      // Thử xác thực lại từ đầu
      try {
        return await this.authenticateWithBackend();
      } catch (retryError) {
        console.error('Lỗi khi thử xác thực lại Firebase:', retryError);
        throw retryError;
      }
    }
  }

  /**
   * Đăng xuất khỏi Firebase
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      await signOut(auth);
      console.log('Đăng xuất Firebase thành công');
    } catch (error) {
      console.error('Lỗi khi đăng xuất Firebase:', error);
      throw error;
    }
  }

  /**
   * Lấy người dùng Firebase hiện tại
   * @returns {Object|null} Thông tin người dùng Firebase hoặc null
   */
  getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * Lấy ID token của người dùng hiện tại
   * @param {boolean} forceRefresh Có cưỡng chế làm mới token không
   * @returns {Promise<string>} ID token
   */
  async getIdToken(forceRefresh = false) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Không có người dùng Firebase đăng nhập');
    }
    
    return await currentUser.getIdToken(forceRefresh);
  }
}

// Export instance duy nhất
export default new FirebaseAuthService();

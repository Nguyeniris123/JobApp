import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_URL } from '../config';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useContext(AuthContext);

  // 🛑 ID của interval để có thể clear khi cần
  let fetchInterval = null;

  // 🚀 Fetch notifications khi user đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();

      // 🔄 Lặp lại mỗi 30s, nhưng dừng khi logout
      fetchInterval = setInterval(fetchNotifications, 30000);
    }

    return () => clearInterval(fetchInterval); // Dừng khi component unmount hoặc user logout
  }, [isAuthenticated]);

  // 🔍 Fetch danh sách thông báo
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/notifications/`);

      if (response?.data) {
        setNotifications(response.data);
        const unread = response.data.filter(notification => !notification.is_read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      setError('Không thể tải thông báo');
      console.error('Lỗi tải thông báo:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Đánh dấu thông báo là đã đọc
  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`${API_URL}/api/notifications/${notificationId}/mark_read/`);

      // 🔄 Cập nhật state ngay lập tức
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
    }
  };

  // ✅ Đánh dấu tất cả thông báo là đã đọc
  const markAllAsRead = async () => {
    try {
      await axios.post(`${API_URL}/api/notifications/mark_all_read/`);

      // 🔄 Cập nhật toàn bộ danh sách
      setNotifications(prev => prev.map(notification => ({ ...notification, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả thông báo:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

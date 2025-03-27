import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { createContext, useEffect, useRef, useState } from 'react';
import { API_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const hasSetupInterceptor = useRef(false); // Đảm bảo interceptor chỉ setup 1 lần

  // 🚀 Load token từ AsyncStorage khi app khởi động
  useEffect(() => {
    const loadTokens = async () => {
      try {
        const storedAccessToken = await AsyncStorage.getItem('accessToken');
        const storedRefreshToken = await AsyncStorage.getItem('refreshToken');

        if (storedAccessToken && storedRefreshToken) {
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedAccessToken}`;
          await fetchUserProfile();
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Lỗi khi tải token:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTokens();

    // 🛑 Setup interceptor chỉ 1 lần
    if (!hasSetupInterceptor.current) {
      axios.interceptors.response.use(
        (response) => response,
        async (error) => {
          if (error.response?.status === 401) {
            try {
              const newAccessToken = await refreshAccessToken();
              error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
              return axios(error.config);
            } catch (err) {
              if (isAuthenticated) logout();
            }
          }
          return Promise.reject(error);
        }
      );
      hasSetupInterceptor.current = true;
    }
  }, []);

  // 🔄 Làm mới token khi hết hạn
  const refreshAccessToken = async () => {
    try {
      if (!refreshToken) {
        logout();
        return null;
      }

      const response = await axios.post(`${API_URL}/api/token/refresh/`, {
        refresh: refreshToken,
      });

      const newAccessToken = response.data.access;
      await AsyncStorage.setItem('accessToken', newAccessToken);
      setAccessToken(newAccessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

      return newAccessToken;
    } catch (error) {
      console.error('Làm mới token thất bại:', error);
      logout();
      return null;
    }
  };

  // 🔍 Fetch thông tin user
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/me/`);
      setUser(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin user:', error);
      logout();
    }
  };

  // 🔑 Đăng nhập
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/api/token/`, { username, password });

      const { access, refresh } = response.data;

      await AsyncStorage.setItem('accessToken', access);
      await AsyncStorage.setItem('refreshToken', refresh);

      setAccessToken(access);
      setRefreshToken(refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      await fetchUserProfile();
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      setError(error.response?.data?.detail || 'Đăng nhập thất bại!');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Đăng ký
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      await axios.post(`${API_URL}/api/users/`, userData);

      return await login(userData.username, userData.password);
    } catch (error) {
      setError(error.response?.data?.detail || 'Đăng ký thất bại!');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 🚪 Đăng xuất
  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
      delete axios.defaults.headers.common['Authorization'];

      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile: fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          axios.defaults.headers.common['Authorization'] = `Token ${storedToken}`;
          await fetchUserProfile();
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading auth token:', error);
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/me/`);
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
      throw error;
    }
  };

  // Login function
  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await axios.post(`${API_URL}/api-auth/login/`, {
        username,
        password,
      });

      const { token } = response.data;

      await AsyncStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;

      setToken(token);
      await fetchUserProfile();
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await axios.post(`${API_URL}/api/users/`, userData);

      // Auto login after registration
      return await login(userData.username, userData.password);
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await axios.patch(`${API_URL}/api/users/${user.id}/`, profileData);
      setUser({...user, ...response.data});
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile.');
      throw error;
    } finally {
      setLoading(false);
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
        updateProfile,
        fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
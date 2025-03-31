import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';
import { API_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);

    // Load token từ AsyncStorage khi app khởi động
    useEffect(() => {
        const loadTokens = async () => {
            try {
                const storedAccessToken = await AsyncStorage.getItem('accessToken');
                const storedRefreshToken = await AsyncStorage.getItem('refreshToken');

                if (storedAccessToken && storedRefreshToken) {
                    setAccessToken(storedAccessToken);
                    setRefreshToken(storedRefreshToken);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${storedAccessToken}`;

                    // Fetch user info dựa trên token
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
    }, []);

    // Hàm làm mới token khi hết hạn
    const refreshAccessToken = async () => {
        try {
            if (!refreshToken) return logout();

            const response = await axios.post(`${API_URL}/o/token/`, {
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
            throw error;
        }
    };

    // Thêm interceptor để tự động refresh token khi hết hạn
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    try {
                        const newAccessToken = await refreshAccessToken();
                        error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        return axios(error.config);
                    } catch (err) {
                        logout();
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, [refreshToken]);

    // Lấy thông tin user dựa trên role
    const fetchUserProfile = async () => {
        try {

            try{
                const response = await axios.get('http://192.168.1.5:8000/recruiters/current-user/', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setUser(response.data);
            }
            catch{
                const response = await axios.get('http://192.168.1.5:8000/candidates/current-user/', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUser(response.data);
            }
            // console.log("Loi ", role);
            // const token = await AsyncStorage.getItem('accessToken');
            // if (role === 'recruiter') {
            //     const response = await axios.get('http://192.168.1.5:8000/recruiters/current-user/', {
            //         headers: {
            //             Authorization: `Bearer ${token}`
            //         }
            //     });

            //     setUser(response.data);
            //     console.log("fetchUser", response.data)
            // } else {
            //     const response = await axios.get('http://192.168.1.5:8000/candidates/current-user/', {
            //         headers: {
            //             Authorization: `Bearer ${token}`
            //         }
            //     });
            //     setUser(response.data);

            //     console.log("fetchuser", response.data)
            // }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
        }
    };

    // Đăng nhập
    const login = async (access, refresh, user) => {
        try {
            setLoading(true);
            setError(null)

            await AsyncStorage.setItem('accessToken', access);
            await AsyncStorage.setItem('refreshToken', refresh);
            setAccessToken(access);
            setRefreshToken(refresh);

            axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
            console.log("thanh cong")
            setRole(user.role);
            await fetchUserProfile();
            console.log("Kiem tra user", user)
            setIsAuthenticated(true);
        } catch (error) {

            console.log("Lỗi khác:", error.message);
            setError(error.response?.data?.detail || 'Đăng nhập thất bại!');
        } finally {
            setLoading(false);
        }
    };


    // Đăng ký
    // const register = async (userData) => {
    //     try {
    //         setLoading(true);
    //         setError(null);

    //         await axios.post(`${API_URL}/api/users/`, userData);
    //         return await login(userData.username, userData.password);
    //     } catch (error) {
    //         setError(error.response?.data?.detail || 'Đăng ký thất bại!');
    //         return false;
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // Đăng xuất
    const logout = async () => {
        try {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
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
                role,
                // register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

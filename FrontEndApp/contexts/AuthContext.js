import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { createContext, useEffect, useState } from 'react';
import {
    changeAvatar as changeAvatarApi,
    fetchCandidateProfile,
    fetchRecruiterProfile,
    login as loginApi,
    refreshAccessToken as refreshAccessTokenApi,
    register as registerApi,
    updateCompanyProfile as updateCompanyProfileApi,
    updateUserProfile as updateUserProfileApi
} from '../services/authService';

export const AuthContext = createContext();

// eslint-disable-next-line react/prop-types
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
                refreshAccessTokenApi(refreshToken)
                    .catch(() => {
                        console.error('Không thể làm mới access token:', error);
                        setIsAuthenticated(false);
                        logout();
                        console.log('Phiên đăng nhập đã hết hạn, Vui lòng đăng nhập lại');
                    });
            } finally {
                setLoading(false);
            }
        };

        loadTokens();
    }, []);

    // Hàm làm mới token khi hết hạn
    const refreshAccessToken = async () => {
        try {
            if (!refreshToken) {
                await logout();
                return null;
            }
            const data = await refreshAccessTokenApi(refreshToken);
            const newAccessToken = data.access || data.access_token;
            if (!newAccessToken) {
                throw new Error('Không nhận được access token mới từ server');
            }
            await AsyncStorage.setItem('accessToken', newAccessToken);
            setAccessToken(newAccessToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            await fetchUserProfile();
            return newAccessToken;
        } catch (error) {
            // Log and rethrow error for refreshAccessToken
            console.error('Error refreshing access token:', error);
            await logout();
            return null;
        }
    };

    // Thêm interceptor để tự động refresh token khi hết hạn
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        const newAccessToken = await refreshAccessToken();
                        if (newAccessToken) {
                            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                            return axios(originalRequest);
                        }
                    } catch (refreshError) {
                        await logout();
                        return Promise.reject(refreshError);
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
            const token = await AsyncStorage.getItem('accessToken');
            try {
                const recruiterData = await fetchRecruiterProfile(token);
                setUser(recruiterData);
                setRole(recruiterData.role || 'recruiter');
                return;
            } catch (error) {
                if (error.response?.data?.detail === "Bạn không có quyền truy cập.") {
                    try {
                        const candidateData = await fetchCandidateProfile(token);
                        setUser(candidateData);
                        setRole(candidateData.role || 'candidate');
                        return;
                    } catch (candidateError) {
                        throw candidateError;
                    }
                } else {
                    throw error;
                }
            }
        } catch (error) {
            try {
                const newAccessToken = await refreshAccessToken();
                if (newAccessToken) {
                    try {
                        const recruiterData = await fetchRecruiterProfile(newAccessToken);
                        setUser(recruiterData);
                        setRole(recruiterData.role || 'recruiter');
                        return;
                    } catch (recruiterError) {
                        if (recruiterError.response?.data?.detail === "Bạn không có quyền truy cập.") {
                            try {
                                const candidateData = await fetchCandidateProfile(newAccessToken);
                                setUser(candidateData);
                                setRole(candidateData.role || 'candidate');
                                return;
                            } catch (candidateError) {
                                await logout();
                                setError('Lỗi khi lấy thông tin người dùng. Vui lòng đăng nhập lại.');
                                throw candidateError;
                            }
                        } else {
                            await logout();
                            setError('Lỗi khi lấy thông tin người dùng. Vui lòng đăng nhập lại.');
                            throw recruiterError;
                        }
                    }
                } else {
                    await logout();
                    setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                    throw new Error('Không refresh được access token');
                }
            } catch (refreshError) {
                await logout();
                setError('Lỗi khi lấy thông tin người dùng. Vui lòng đăng nhập lại.');
                throw refreshError;
            }
        }
    };

    // Đăng nhập
    const login = async (username, password) => {
        try {
            setLoading(true);
            setError(null);
            const data = await loginApi(username, password);
            const { access_token, refresh_token } = data;
            await AsyncStorage.setItem('accessToken', access_token);
            await AsyncStorage.setItem('refreshToken', refresh_token);
            setAccessToken(access_token);
            setRefreshToken(refresh_token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            await fetchUserProfile();
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            setError(error.response?.data?.detail || 'Đăng nhập thất bại!');
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    // Đăng ký
    const register = async (data, userType, avatar, companyImages) => {
        try {
            const res = await registerApi(data, userType, avatar, companyImages);
            // Trả về status code và thông báo lỗi nếu có
            if (res.status === 201) {
                return { success: true, status: res.status };
            } else {
                return { success: false, status: res.status, error: res.data };
            }
        } catch (error) {
            setError(error.response?.data?.detail || 'Đăng ký thất bại!');
            return { success: false, status: error.response?.status || 500, error };
        } 
    };

    // Đổi avatar
    const changeAvatar = async (avatar) => {
        try {
            setLoading(true);
            setError(null);
            const userId = user?.id;
            if (!userId) {
                throw new Error('Không thể xác định ID người dùng');
            }
            const data = await changeAvatarApi(userId, avatar, accessToken);
            const updatedUser = { ...user, avatar: data.avatar };
            setUser(updatedUser);
            return updatedUser.avatar;
        } catch (error) {
            setError(error.response?.data?.detail || 'Đổi avatar thất bại!');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật thông tin user
    const updateUserProfile = async (updatedData) => {
        if (!user || !role) return;
        try {
            setLoading(true);
            await updateUserProfileApi(user.id, updatedData, role, accessToken);
            setUser({ ...user, ...updatedData });
            return true;
        } catch (error) {
            // Log error in updateUserProfile
            console.error('Lỗi khi cập nhật thông tin user:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật thông tin công ty
    const updateCompanyProfile = async (companyData) => {
        try {
            await updateCompanyProfileApi(companyData, accessToken);
            if (typeof fetchUserProfile === 'function') {
                await fetchUserProfile();
            }
            return true;
        } catch (error) {
            // Log error in updateCompanyProfile
            console.error('Lỗi khi cập nhật thông tin công ty:', error);
            throw error;
        }
    };

    // Đăng xuất
    const logout = async () => {
        try {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            delete axios.defaults.headers.common['Authorization'];

            setAccessToken(null);
            setRefreshToken(null);
            setUser(null);
            setRole(null); // Add this line to clear role
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
                role,
                logout,
                changeAvatar,
                accessToken,
                updateUserProfile,
                updateCompanyProfile,
                fetchUserProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

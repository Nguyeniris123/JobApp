import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { createContext, useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../apiConfig';

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
            if (!refreshToken) {
                await logout();
                return null;
            }
            const jsondata = {
                client_id: "OidP3ERxQtbZvrMN31JhxjjTWm325MLA3OMTCH5h",
                client_secret: "UI7wNEiXd6H22GYDOyJU8YcaKNDnhpsBB1Z0Ziq89iGtD1qYzybcLS7AUuNKHV02dlABUVccNxKPLNsOYdAYJLspRffloiTaHG0qVh67JP32zynznskB1fYrmP7jGwon",
                refresh_token: refreshToken,
                grant_type: "refresh_token"
            };
            console.log("Request làm mới token:", jsondata);

            const response = await axios.post(API_ENDPOINTS.LOGIN, jsondata);
            console.log('Refresh token response:', response.data); // Thêm log để debug
            const newAccessToken = response.data.access || response.data.access_token;
            if (!newAccessToken) {
                throw new Error('Không nhận được access token mới từ server');
            }
            await AsyncStorage.setItem('accessToken', newAccessToken);
            setAccessToken(newAccessToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

            await fetchUserProfile();
            return newAccessToken;
        } catch (error) {
            console.error('Làm mới token thất bại:', error);
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
                console.log("Token:", token)
                const recruiterResponse = await axios.get(API_ENDPOINTS.RECRUITERS_GET_CURRENT_USER, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (recruiterResponse.data) {
                    setUser(recruiterResponse.data);
                    setRole('recruiter');
                    console.log("User:", recruiterResponse.data)
                }
            } catch (error) {
                if (error.response?.data?.detail === "Bạn không có quyền truy cập.") {
                    const candidateResponse = await axios.get(API_ENDPOINTS.CANDIDATES_GET_CURRENT_USER, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setUser(candidateResponse.data);
                    setRole('candidate');
                    console.log("User:", candidateResponse.data)
                } else {
                    throw error;
                }
            }
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

    // Đổi avatar
    const changeAvatar = async (avatar) => {
        try {
            setLoading(true);
            setError(null);

            const formData = new FormData();
            formData.append('avatar', {
                uri: avatar,
                type: 'image/jpeg',
                name: 'avatar.jpg',
            });

            // Lấy user ID từ current user
            const userId = user?.id;
            if (!userId) {
                throw new Error('Không thể xác định ID người dùng');
            }

            // Sử dụng endpoint đã sửa
            const response = await axios.patch(API_ENDPOINTS.AVATAR_PATCH(userId), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // Cập nhật thông tin user sau khi thay đổi avatar
            const updatedUser = {...user, avatar: response.data.avatar};
            setUser(updatedUser);
            return updatedUser.avatar;
        } catch (error) {
            console.error('Lỗi khi đổi avatar:', error);
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
            const endpoint = role === "recruiter"
                ? API_ENDPOINTS.RECRUITERS_UPDATE(user.id)
                : API_ENDPOINTS.CANDIDATES_UPDATE(user.id);
            const response = await axios.patch(endpoint, updatedData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            if (response.status === 200) {
                setUser({ ...user, ...updatedData });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin user:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật thông tin công ty
    const updateCompanyProfile = async (companyData) => {
        try {
            const response = await axios.patch(API_ENDPOINTS.COMPANIES_UPDATE(companyData.id), companyData);
            if (response.data) {
                // Sau khi cập nhật, gọi lại fetchUserProfile để đồng bộ user.company
                if (typeof fetchUserProfile === 'function') {
                    await fetchUserProfile();
                }
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin công ty:', error);
            throw error;
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
                role,
                // register,
                logout,
                changeAvatar,
                accessToken, // <-- expose accessToken here
                updateUserProfile, // expose updateUserProfile
                updateCompanyProfile, // expose updateCompanyProfile
                fetchUserProfile, // expose fetchUserProfile
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

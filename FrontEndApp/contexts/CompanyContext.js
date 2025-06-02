import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { API_ENDPOINTS } from '../apiConfig';
import * as companyService from '../services/companyService';
import { AuthContext } from './AuthContext';

export const CompanyContext = createContext({
    loading: false,
    followedCompanies: [],
    unfollowCompany: () => { },
    followCompany: () => { },
    getFollowedCompanyById: () => { },
    fetchFollowedCompanies: () => { },
    testFetchFollowedCompanies: () => { }
});

export const CompanyProvider = ({ children }) => {
    const { role, accessToken, isAuthenticated, loading: authLoading } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [followedCompanies, setFollowedCompanies] = useState([]);
    const [error, setError] = useState(null);
    const [isTokenLoaded, setIsTokenLoaded] = useState(false);
    const hasFetchedInitialData = useRef(false);
    const fetchInProgress = useRef(false);

    // Only run effect logic if not recruiter
    useEffect(() => {
        // Nếu role là recruiter hoặc null thì không fetch
        if (role === 'recruiter' || !role) return;
        const loadToken = async () => {
            try {
                if (accessToken) {
                    console.log('Token loaded in CompanyContext:', accessToken ? 'Yes (Hidden)' : 'No');
                }
            } catch (error) {
                console.error('Error loading token in CompanyContext:', error);
            } finally {
                setIsTokenLoaded(true);
            }
        };
        loadToken();
    }, [accessToken, role]);

    useEffect(() => {
        // Nếu role là recruiter hoặc null thì không fetch
        if (role === 'recruiter' || !role) return;
        if (isTokenLoaded && accessToken && isAuthenticated && !authLoading && !hasFetchedInitialData.current) {
            console.log('Token is loaded, fetching followed companies (initial load)...');
            hasFetchedInitialData.current = true;
            fetchFollowedCompanies();
        }
    }, [isTokenLoaded, accessToken, isAuthenticated, authLoading, role]);

    // Fetch followed companies
    const fetchFollowedCompanies = async () => {
        if (authLoading || !isAuthenticated || !accessToken) {
            setFollowedCompanies([]);
            setError('Không có token xác thực. Vui lòng đăng nhập lại.');
            return [];
        }
        if (fetchInProgress.current) {
            return [];
        }
        fetchInProgress.current = true;
        try {
            setLoading(true);
            setError(null);
            const companiesData = await companyService.fetchFollowedCompanies(accessToken);
            setFollowedCompanies(companiesData);
            return companiesData;
        } catch (error) {
            setError(error.message || "Không thể tải danh sách công ty theo dõi");
            setFollowedCompanies([]);
            return [];
        } finally {
            setLoading(false);
            fetchInProgress.current = false;
        }
    };

    const unfollowCompany = async (companyIdOrFollowId) => {
        try {
            console.log('Attempting to unfollow with ID:', companyIdOrFollowId);
            
            if (!accessToken) throw new Error('No token found');

            // Xác định ID của bản ghi follow
            let followId = companyIdOrFollowId;
            let companyId = null;

            // Nếu tham số là company ID thì tìm follow ID tương ứng
            const existingFollow = followedCompanies.find(follow => 
                follow.recruiter_company && follow.recruiter_company.id === companyIdOrFollowId
            );

            if (existingFollow) {
                followId = existingFollow.id;
                companyId = existingFollow.recruiter_company.id;
                console.log(`Found follow record with id ${followId} for company ${companyId}`);
            } else {
                // Nếu không phải company ID, giả định nó là follow ID
                console.log(`Using ${followId} directly as follow record ID`);
            }

            console.log('Sending unfollow request to:', API_ENDPOINTS.FOLLOW_DELETE(followId));
            
            try {
                const response = await axios.delete(API_ENDPOINTS.FOLLOW_DELETE(followId), {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                console.log('Unfollow response:', response.status);

                // Sau khi unfollow, luôn fetch lại danh sách company
                await fetchFollowedCompanies();

                return true;
            } catch (apiError) {
                if (apiError.response && apiError.response.status === 404) {
                    console.log('Company follow not found in database, considering as already unfollowed');
                    await fetchFollowedCompanies();
                    return true;
                } 
                
                // Xử lý lỗi 400 hoặc lỗi khác
                if (apiError.response && (apiError.response.status === 400 || apiError.response.status === 204)) {
                    console.log('Successful unfollow with status:', apiError.response.status);
                    await fetchFollowedCompanies();
                    return true;
                }
                
                // Nếu là lỗi khác thì throw
                throw apiError;
            }
        } catch (error) {
            console.error('Error unfollowing company:', error.response?.status, error.response?.data || error.message);
            
            // Kiểm tra nếu thực sự không còn theo dõi (lỗi nhưng vẫn thành công)
            const stillFollowed = followedCompanies.some(
                company => company.id === companyIdOrFollowId || 
                          (company.recruiter_company && company.recruiter_company.id === companyIdOrFollowId)
            );
            
            if (!stillFollowed) {
                console.log('Company appears to be unfollowed despite error, considering as success');
                await fetchFollowedCompanies();
                return true;
            }
            
            throw error;
        }
    };

    const followCompany = async (companyId) => {
        try {
            console.log('Attempting to follow company with ID:', companyId);

            if (!accessToken) throw new Error('No token found');

            // Cập nhật theo yêu cầu mới - Chỉ gửi company_id
            const requestBody = {
                company_id: companyId
            };

            console.log('Sending follow request to:', API_ENDPOINTS.FOLLOW_CREATE);
            console.log('Request body:', JSON.stringify(requestBody));

            const response = await axios.post(API_ENDPOINTS.FOLLOW_CREATE, requestBody, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Follow response:', response.status);
            console.log('Follow data:', JSON.stringify(response.data));

            // Nếu API trả về dữ liệu công ty mới, thêm vào danh sách
            if (response.data) {
                // Cập nhật state với dữ liệu mới
                setFollowedCompanies(prev => {
                    // Kiểm tra xem đã có trong danh sách chưa
                    const alreadyExists = prev.some(item =>
                        item.recruiter_company &&
                        item.recruiter_company.id === response.data.recruiter_company.id
                    );

                    if (alreadyExists) {
                        return prev; // Không thêm nếu đã tồn tại
                    }

                    return [...prev, response.data]; // Thêm nếu chưa có
                });
            }

            return true;
        } catch (error) {
            console.error('Error following company:', error.response?.status, error.response?.data || error.message);

            // Kiểm tra lỗi cụ thể và xử lý
            if (error.response && error.response.status === 400 &&
                error.response.data &&
                error.response.data.non_field_errors &&
                error.response.data.non_field_errors.includes('Follow already exists')) {

                console.log('Company already followed, treating as success');
                return true;
            }

            throw error;
        }
    };

    const getFollowedCompanyById = (companyId) => {
        // Tìm bản ghi follow theo company id
        const found = followedCompanies.find(follow =>
            follow.recruiter_company && follow.recruiter_company.id === companyId
        );
        return found;
    };

    // Lắng nghe sự thay đổi token từ auth - dùng interval với delay lớn hơn
    // và chỉ cập nhật khi cần thiết
    useEffect(() => {
        const checkTokenChanges = async () => {
            try {
                // Ngăn kiểm tra token nếu đang loading để tránh vòng lặp
                if (loading) return;

                const newToken = await AsyncStorage.getItem('accessToken');
                if (newToken !== accessToken) {
                    console.log('Token has changed, updating...');
                    // Không cần cập nhật state nữa, mọi thứ đã được quản lý bởi AuthContext
                }
            } catch (error) {
                console.error('Error checking token changes:', error);
            }
        };

        // Kiểm tra token định kỳ với interval lớn hơn (30 giây thay vì 10 giây)
        const interval = setInterval(checkTokenChanges, 30000);
        return () => clearInterval(interval);
    }, [accessToken, loading]);

    // Always render the Provider, but for recruiter or role null, provide minimal context
    if (role === 'recruiter' || !role) {
        return (
            <CompanyContext.Provider value={{
                loading: false,
                followedCompanies: [],
                error: null,
                fetchFollowedCompanies: () => {},
                testFetchFollowedCompanies: () => {},
                unfollowCompany: () => {},
                followCompany: () => {},
                getFollowedCompanyById: () => null
            }}>
                {children}
            </CompanyContext.Provider>
        );
    }

    return (
        <CompanyContext.Provider value={{
            loading,
            followedCompanies,
            error,
            fetchFollowedCompanies,
            unfollowCompany,
            followCompany,
            getFollowedCompanyById
        }}>
            {children}
        </CompanyContext.Provider>
    );
};

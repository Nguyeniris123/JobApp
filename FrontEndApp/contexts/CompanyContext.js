import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
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
            if (!accessToken) throw new Error('No token found');
            // Nếu truyền vào là companyId, tìm followId tương ứng
            let followId = companyIdOrFollowId;
            const existingFollow = followedCompanies.find(follow =>
                follow.recruiter &&
                follow.recruiter.company &&
                follow.recruiter.company.id === companyIdOrFollowId
            );
            if (existingFollow) {
                followId = existingFollow.id;
            }
            await companyService.unfollowCompany(followId, accessToken);
            await fetchFollowedCompanies();
            return true;
        } catch (error) {
            console.error('Error unfollowing company:', error.response?.status, error.response?.data || error.message);
        }
    };

    const followCompany = async (companyId) => {
        try {
            if (!accessToken) throw new Error('No token found');

            await companyService.followCompany(companyId, accessToken);
            await fetchFollowedCompanies();

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
            follow.recruiter.company && follow.recruiter.company.id === companyId
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
                fetchFollowedCompanies: () => { },
                testFetchFollowedCompanies: () => { },
                unfollowCompany: () => { },
                followCompany: () => { },
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

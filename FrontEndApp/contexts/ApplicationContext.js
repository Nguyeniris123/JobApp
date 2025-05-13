import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { createContext, useCallback, useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../apiConfig';

export const ApplicationContext = createContext({
    applications: [],
    loading: false,
    error: null,
    fetchApplications: () => {},
    submitApplication: () => {},
    getApplicationDetails: () => {},
    clearApplicationError: () => {}
});

export const ApplicationProvider = ({ children }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const loadToken = async () => {
            try {
                const accessToken = await AsyncStorage.getItem('accessToken');
                setToken(accessToken);
            } catch (error) {
                console.error('Error loading token in ApplicationContext:', error);
            }
        };

        loadToken();
    }, []);

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const accessToken = token || await AsyncStorage.getItem('accessToken');
            
            if (!accessToken) {
                setError('Không có token xác thực. Vui lòng đăng nhập lại.');
                setLoading(false);
                return [];
            }

            const response = await axios.get(API_ENDPOINTS.APPLICATIONS_LIST, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }
            });

            const formattedApplications = (response.data.results || response.data).map(app => {
                // Log để kiểm tra cấu trúc dữ liệu
                console.log('Application data structure:', JSON.stringify(app, null, 2));
                
                return {
                    id: app.id,
                    jobTitle: app.job_detail?.title || 'Không có tiêu đề',
                    company: app.job_detail?.company?.name || 'Không có thông tin công ty',
                    companyLogo: app.job_detail?.company?.images?.[0]?.image || 'https://via.placeholder.com/150',
                    status: app.status || 'pending',
                    appliedDate: new Date(app.created_date),
                    lastUpdated: new Date(app.updated_date || app.created_date),
                    feedback: app.feedback,
                    job: app.job,
                    jobDetail: app.job_detail,
                    // Lấy recruiterId trực tiếp từ job_detail.recruiter
                    recruiterId: app.job_detail?.recruiter
                }
            });

            console.log('Fetched applications:', formattedApplications.length);
            setApplications(formattedApplications);
            return formattedApplications;
        } catch (error) {
            console.error('Error fetching applications:', error);
            setError(error.response?.data?.detail || 'Lỗi khi tải danh sách đơn ứng tuyển');
            return [];
        } finally {
            setLoading(false);
        }
    }, [token]);

    const submitApplication = async (jobId, applicationData) => {
        setLoading(true);
        setError(null);
        
        try {
            const accessToken = token || await AsyncStorage.getItem('accessToken');
            
            if (!accessToken) {
                setError('Không có token xác thực. Vui lòng đăng nhập lại.');
                setLoading(false);
                return { success: false, message: 'Không có token xác thực' };
            }

            const response = await axios.post(
                API_ENDPOINTS.APPLICATIONS_CREATE, 
                {
                    applicant: {
                        first_name: applicationData.fullName.split(' ').slice(-1).join(' '),
                        last_name: applicationData.fullName.split(' ').slice(0, -1).join(' '),
                        email: applicationData.email,
                        phone: applicationData.phone
                    },
                    job: jobId,
                    cv: applicationData.cv,
                    cover_letter: applicationData.coverLetter || '',
                    job_detail: applicationData.jobDetail
                },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // Tải lại danh sách đơn ứng tuyển sau khi submit thành công
            fetchApplications();
            
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error submitting application:', error);
            const errorMsg = error.response?.data?.detail || 'Lỗi khi gửi đơn ứng tuyển';
            setError(errorMsg);
            return { success: false, message: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const getApplicationDetails = (applicationId) => {
        return applications.find(app => app.id === applicationId);
    };

    const clearApplicationError = () => {
        setError(null);
    };

    useEffect(() => {
        if (token) {
            fetchApplications();
        }
    }, [token, fetchApplications]);

    return (
        <ApplicationContext.Provider 
            value={{ 
                applications, 
                loading, 
                error, 
                fetchApplications, 
                submitApplication, 
                getApplicationDetails,
                clearApplicationError
            }}
        >
            {children}
        </ApplicationContext.Provider>
    );
};
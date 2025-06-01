import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
    acceptApplication as acceptApplicationApi,
    fetchApplications as fetchApplicationsApi,
    rejectApplication as rejectApplicationApi,
    submitApplication as submitApplicationApi,
    updateApplication as updateApplicationApi
} from '../services/applicationService';
import { AuthContext } from './AuthContext';

export const ApplicationContext = createContext({
    applications: [],
    loading: false,
    error: null,
    fetchApplications: () => { },
    submitApplication: () => { },
    getApplicationDetails: () => { },
    clearApplicationError: () => { }
});

// eslint-disable-next-line react/prop-types
export const ApplicationProvider = ({ children }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { role, accessToken } = useContext(AuthContext);
    const { isAuthenticated, loading: authLoading } = useContext(AuthContext);

    const fetchApplications = useCallback(async () => {
        if (authLoading || !isAuthenticated || !accessToken) {
            // Không fetch khi chưa xác thực xong hoặc chưa có token
            return [];
        }
        setLoading(true);
        setError(null);
        try {
            // Chọn endpoint theo role
            const data = await fetchApplicationsApi(role, accessToken);
            const formattedApplications = (data.results || data).map(app => {
                // Log để kiểm tra cấu trúc dữ liệu
                console.log('Application data structure:', JSON.stringify(app, null, 2));

                return {
                    id: app.id,
                    status: app.status || 'pending',
                    appliedDate: new Date(app.created_date),
                    lastUpdated: new Date(app.updated_date || app.created_date),
                    feedback: app.feedback,
                    job: app.job,
                    // Thêm đầy đủ các trường detail để màn hình recruiter dùng trực tiếp
                    applicant_detail: app.applicant_detail,
                    job_detail: app.job_detail,
                    cv: app.cv,
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
    }, [accessToken, role, authLoading, isAuthenticated]);

    const submitApplication = async (jobId, resumeFile) => {
        setLoading(true);
        setError(null);
        try {
            if (!accessToken) {
                setError('Không có token xác thực. Vui lòng đăng nhập lại.');
                setLoading(false);
                return { success: false, message: 'Không có token xác thực' };
            }
            await submitApplicationApi(jobId, resumeFile, accessToken);
            fetchApplications();
            return { success: true };
        } catch (error) {
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

    // Chấp nhận đơn ứng tuyển
    const acceptApplication = async (applicationId) => {
        setLoading(true);
        setError(null);
        try {
            if (!accessToken) throw new Error('Không có token xác thực');
            await acceptApplicationApi(applicationId, accessToken);
            await fetchApplications();
            return { success: true };
        } catch (error) {
            setError(error.response?.data?.detail || 'Lỗi khi chấp nhận đơn ứng tuyển');
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Từ chối đơn ứng tuyển
    const rejectApplication = async (applicationId) => {
        setLoading(true);
        setError(null);
        try {
            if (!accessToken) throw new Error('Không có token xác thực');
            await rejectApplicationApi(applicationId, accessToken);
            await fetchApplications();
            return { success: true };
        } catch (error) {
            setError(error.response?.data?.detail || 'Lỗi khi từ chối đơn ứng tuyển');
            return { success: false, message: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật lại CV cho ứng viên (chỉ PATCH cv)
    const updateApplication = async (applicationId, newCVFile) => {
        setLoading(true);
        setError(null);
        try {
            if (!accessToken) {
                setError('Không có token xác thực. Vui lòng đăng nhập lại.');
                setLoading(false);
                return { success: false, message: 'Không có token xác thực' };
            }
            await updateApplicationApi(applicationId, newCVFile, accessToken);
            await fetchApplications();
            return { success: true };
        } catch (error) {
            const errorMsg = error.response?.data?.detail || 'Lỗi khi cập nhật CV';
            setError(errorMsg);
            return { success: false, message: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Chỉ fetch applications khi KHÔNG phải recruiter và role khác null
        if (role === 'recruiter' || !role) return;
        if (accessToken) {
            fetchApplications();
        }
    }, [accessToken, fetchApplications, role]);

    return (
        <ApplicationContext.Provider
            value={{
                applications,
                loading,
                error,
                fetchApplications,
                submitApplication,
                getApplicationDetails,
                clearApplicationError,
                acceptApplication,
                rejectApplication,
                updateApplication // expose mới
            }}
        >
            {children}
        </ApplicationContext.Provider>
    );
};
import { createContext, useContext, useEffect, useState } from 'react';
import * as reviewService from '../services/reviewService';
import { AuthContext } from './AuthContext';

export const ReviewContext = createContext({
    recruiterReviews: [],
    candidateReviews: [],
    loading: false,
    error: null,
    fetchRecruiterReviews: () => {},
    fetchCandidateReviews: () => {},
    addReview: () => {},
    deleteReview: () => {},
    getReviewsForJob: () => {},
    getReviewsForApplication: () => {},
    createJobReview: () => {},
    createApplicationReview: () => {},
    updateReview: () => {},
    formatReviewData: () => {}
});

export const ReviewProvider = ({ children }) => {
    const [recruiterReviews, setRecruiterReviews] = useState([]);
    const [candidateReviews, setCandidateReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user, role, accessToken } = useContext(AuthContext);
    const { isAuthenticated, loading: authLoading } = useContext(AuthContext);

    // Lấy danh sách đánh giá dành cho nhà tuyển dụng (chỉ recruiter dùng)
    const fetchRecruiterReviews = async (companyId) => {
        if (authLoading || !isAuthenticated || !accessToken || role !== 'recruiter') {
            return [];
        }
        try {
            setLoading(true);
            setError(null);
            const id = companyId || user?.company.id;
            if (!id) {
                setError('Không có ID nhà tuyển dụng');
                return [];
            }
            const reviews = await reviewService.fetchRecruiterReviews(id, accessToken);
            setRecruiterReviews(reviews);
            return reviews;
        } catch (error) {
            console.error('Lỗi khi tải đánh giá cho nhà tuyển dụng:', error);
            setError(error.response?.data?.detail || 'Không thể tải đánh giá');
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách đánh giá dành cho ứng viên (chỉ candidate dùng)
    const fetchCandidateReviews = async (candidateId) => {
        if (authLoading || !isAuthenticated || !accessToken || role !== 'candidate') {
            return [];
        }
        try {
            setLoading(true);
            setError(null);
            const id = candidateId || user?.id;
            if (!id) {
                setError('Không có ID ứng viên');
                return [];
            }
            const reviews = await reviewService.fetchCandidateReviews(id, accessToken);
            setCandidateReviews(reviews);
            return reviews;
        } catch (error) {
            console.error('Lỗi khi tải đánh giá cho ứng viên:', error);
            setError(error.response?.data?.detail || 'Không thể tải đánh giá');
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Thêm đánh giá mới - endpoint theo role
    const addReview = async (reviewData) => {
        try {
            setLoading(true);
            setError(null);
            if (!accessToken) {
                setError('Không có token xác thực. Vui lòng đăng nhập lại.');
                return { success: false, message: 'Không có token xác thực' };
            }
            let type = role === 'recruiter' ? 'candidate' : 'job';
            const response = await reviewService.addReview(reviewData, type, accessToken);
            const newReview = {
                ...response,
                reviewer_name: user?.username || 'Người dùng ẩn danh',
                reviewer_avatar: user?.avatar || null
            };
            if (role === 'recruiter') {
                setCandidateReviews(prev => [newReview, ...prev]);
            } else {
                setRecruiterReviews(prev => [newReview, ...prev]);
            }
            return { success: true, data: newReview };
        } catch (error) {
            console.error('Lỗi khi thêm đánh giá:', error);
            const errorMsg = error.response?.data?.detail || 'Không thể thêm đánh giá';
            setError(errorMsg);
            return { success: false, message: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    // Xóa đánh giá - endpoint theo role
    const deleteReview = async (reviewId) => {
        try {
            setLoading(true);
            setError(null);
            if (!accessToken) {
                setError('Không có token xác thực. Vui lòng đăng nhập lại.');
                return { success: false, message: 'Không có token xác thực' };
            }
            let type = role === 'recruiter' ? 'candidate' : 'job';
            await reviewService.deleteReview(reviewId, type, accessToken);
            setRecruiterReviews(prev => prev.filter(review => review.id !== reviewId));
            setCandidateReviews(prev => prev.filter(review => review.id !== reviewId));
            return { success: true };
        } catch (error) {
            console.error('Lỗi khi xóa đánh giá:', error);
            const errorMsg = error.response?.data?.detail || 'Không thể xóa đánh giá';
            setError(errorMsg);
            return { success: false, message: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    // Lấy đánh giá cho job cụ thể - hàm tiện ích cho JobDetailScreen
    const getReviewsForJob = async (jobId) => {
        try {
            setLoading(true);
            setError(null);
            if (!jobId) {
                setError('Không có ID nhà tuyển dụng');
                return [];
            }
            const reviews = await reviewService.fetchRecruiterReviews(jobId, accessToken);
            setRecruiterReviews(reviews);
            return reviews;
        } catch (error) {
            console.error('Lỗi khi tải đánh giá cho nhà tuyển dụng:', error);
            setError(error.response?.data?.detail || 'Không thể tải đánh giá');
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Lấy đánh giá cho application cụ thể - hàm tiện ích cho ApplicationListScreen
    const getReviewsForApplication = async (applicantId) => {
        try {
            setLoading(true);
            setError(null);
            if (!applicantId) {
                setError('Không có ID ứng viên');
                return [];
            }
            const reviews = await reviewService.fetchCandidateReviews(applicantId, accessToken);
            setCandidateReviews(reviews);
            return reviews;
        } catch (error) {
            console.error('Lỗi khi tải đánh giá cho ứng viên:', error);
            setError(error.response?.data?.detail || 'Không thể tải đánh giá');
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Tải đánh giá ban đầu dựa trên vai trò người dùng
    useEffect(() => {
        // Chỉ fetch khi đã có user, accessToken, role, đã xác thực và không còn authLoading
        if (
            user?.id &&
            accessToken &&
            role &&
            isAuthenticated &&
            !authLoading
        ) {
            if (role === 'recruiter') {
                fetchRecruiterReviews();
            } else if (role === 'candidate') {
                fetchCandidateReviews();
            }
        }
    }, [user, role, accessToken, isAuthenticated, authLoading]);

    // Các hàm từ useReview.js - chuyển vào ReviewContext

    // Tạo review cho công việc (candidate đánh giá công việc)
    const createJobReview = async (company_id, rating, comment) => {
        if (role !== 'candidate') {
            return { success: false, message: 'Chỉ ứng viên mới có thể đánh giá công việc' };
        }

        try {
            return await addReview({
                company_id,
                rating,
                comment
            });
        } catch (error) {
            console.error('Lỗi khi tạo đánh giá cho công việc:', error);
            return { success: false, message: error.message || 'Không thể tạo đánh giá' };
        }
    };

    // Tạo review cho ứng viên (recruiter đánh giá ứng viên)
    const createApplicationReview = async (applicationId, rating, comment) => {
        if (role !== 'recruiter') {
            return { success: false, message: 'Chỉ nhà tuyển dụng mới có thể đánh giá ứng viên' };
        }

        try {
            return await addReview({
                reviewed_user: applicationId, // Sử dụng ID của application làm reviewed_user theo định dạng API mới
                application: applicationId,
                rating,
                comment
            });
        } catch (error) {
            console.error('Lỗi khi tạo đánh giá cho ứng viên:', error);
            return { success: false, message: error.message || 'Không thể tạo đánh giá' };
        }
    };

    // Cập nhật review hiện có
    const updateReview = async (reviewId, updatedData) => {
        try {
            await deleteReview(reviewId);
            return await addReview(updatedData);
        } catch (error) {
            console.error('Lỗi khi cập nhật đánh giá:', error);
            return { success: false, message: error.message || 'Không thể cập nhật đánh giá' };
        }
    };

    // Tiện ích format dữ liệu review
    const formatReviewData = (review) => reviewService.formatReviewData(review, user);

    return (
        <ReviewContext.Provider
            value={{
                recruiterReviews,
                candidateReviews,
                loading,
                error,
                fetchRecruiterReviews,
                fetchCandidateReviews,
                addReview,
                deleteReview,
                getReviewsForJob,
                getReviewsForApplication,
                createJobReview,
                createApplicationReview,
                updateReview,
                formatReviewData
            }}
        >
            {children}
        </ReviewContext.Provider>
    );
};
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../apiConfig';
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
    getReviewsForApplication: () => {}
});

export const ReviewProvider = ({ children }) => {
    const [recruiterReviews, setRecruiterReviews] = useState([]);
    const [candidateReviews, setCandidateReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user, role } = useContext(AuthContext);

    // Lấy danh sách đánh giá dành cho nhà tuyển dụng
    const fetchRecruiterReviews = async (recruiterId) => {
        try {
            setLoading(true);
            setError(null);
            
            const id = recruiterId || (user && user.id);
            if (!id) {
                setError('Không có ID nhà tuyển dụng');
                return [];
            }

            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken) {
                setError('Không có token xác thực. Vui lòng đăng nhập lại.');
                return [];
            }

            const response = await axios.get(
                API_ENDPOINTS.REVIEWS_LIST_FOR_RECRUITER(id), 
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            const reviews = response.data.results || response.data;
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

    // Lấy danh sách đánh giá dành cho ứng viên
    const fetchCandidateReviews = async (candidateId) => {
        try {
            setLoading(true);
            setError(null);
            
            const id = candidateId || (user && user.id);
            if (!id) {
                setError('Không có ID ứng viên');
                return [];
            }

            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken) {
                setError('Không có token xác thực. Vui lòng đăng nhập lại.');
                return [];
            }

            const response = await axios.get(
                API_ENDPOINTS.REVIEWS_LIST_FOR_CANDIDATE(id), 
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            const reviews = response.data.results || response.data;
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

    // Thêm đánh giá mới - cập nhật để phù hợp với API mới
    const addReview = async (reviewData) => {
        try {
            setLoading(true);
            setError(null);

            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken) {
                setError('Không có token xác thực. Vui lòng đăng nhập lại.');
                return { success: false, message: 'Không có token xác thực' };
            }

            // Cập nhật để phù hợp định dạng API mới
            const apiRequestData = {
                reviewed_user: reviewData.reviewed_user || reviewData.application || reviewData.job,
                rating: reviewData.rating,
                comment: reviewData.comment,
                // Các trường bổ sung nếu cần
                strengths: reviewData.strengths,
                weaknesses: reviewData.weaknesses
            };

            const response = await axios.post(
                API_ENDPOINTS.REVIEWS_CREATE,
                apiRequestData,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Tạo đánh giá với thông tin bổ sung từ người dùng hiện tại
            const newReview = {
                ...response.data,
                reviewer_name: user?.username || 'Người dùng ẩn danh',
                reviewer_avatar: user?.avatar || null
            };

            // Cập nhật danh sách đánh giá tương ứng
            if (role === 'recruiter') {
                setRecruiterReviews(prev => [newReview, ...prev]);
            } else {
                setCandidateReviews(prev => [newReview, ...prev]);
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

    // Xóa đánh giá
    const deleteReview = async (reviewId) => {
        try {
            setLoading(true);
            setError(null);

            const accessToken = await AsyncStorage.getItem('accessToken');
            if (!accessToken) {
                setError('Không có token xác thực. Vui lòng đăng nhập lại.');
                return { success: false, message: 'Không có token xác thực' };
            }

            await axios.delete(
                API_ENDPOINTS.REVIEWS_DELETE(reviewId),
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            // Cập nhật cả hai danh sách đánh giá
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
    const getReviewsForJob = (jobId) => {
        // Lọc trong các đánh giá hiện có
        return role === 'candidate' ? 
            recruiterReviews.filter(review => review.job === jobId) :
            candidateReviews.filter(review => review.job === jobId);
    };

    // Lấy đánh giá cho application cụ thể - hàm tiện ích cho ApplicationListScreen
    const getReviewsForApplication = (applicationId) => {
        // Lọc trong các đánh giá hiện có
        return role === 'recruiter' ? 
            candidateReviews.filter(review => review.application === applicationId) :
            recruiterReviews.filter(review => review.application === applicationId);
    };

    // Tải đánh giá ban đầu dựa trên vai trò người dùng
    useEffect(() => {
        if (user && user.id) {
            if (role === 'recruiter') {
                fetchRecruiterReviews();
            } else if (role === 'candidate') {
                fetchCandidateReviews();
            }
        }
    }, [user, role]);

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
                getReviewsForApplication
            }}
        >
            {children}
        </ReviewContext.Provider>
    );
};
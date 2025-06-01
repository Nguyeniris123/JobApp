import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_ENDPOINTS } from '../apiConfig';

// Lấy danh sách đánh giá dành cho nhà tuyển dụng
export const fetchRecruiterReviews = async (recruiterId) => {
    try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) throw new Error('Chưa đăng nhập');
        const response = await axios.get(
            API_ENDPOINTS.REVIEWS_LIST_FOR_RECRUITER(recruiterId),
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        return response.data.results || response.data;
    } catch (error) {
        throw error;
    }
};

// Lấy danh sách đánh giá dành cho ứng viên
export const fetchCandidateReviews = async (candidateId) => {
    try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) throw new Error('Chưa đăng nhập');
        const response = await axios.get(
            API_ENDPOINTS.REVIEWS_LIST_FOR_CANDIDATE(candidateId),
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        return response.data.results || response.data;
    } catch (error) {
        throw error;
    }
};

// Thêm đánh giá mới
export const addReview = async (reviewData, type) => {
    try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) throw new Error('Chưa đăng nhập');
        let url = type === 'candidate' ? API_ENDPOINTS.REVIEWS_CANDIDATE_CREATE : API_ENDPOINTS.REVIEWS_RECRUITER_CREATE;
        console.log('Adding review with data:', reviewData);
        const response = await axios.post(url, reviewData, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Xóa đánh giá
export const deleteReview = async (reviewId, type = 'job') => {
    try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) throw new Error('Chưa đăng nhập');
        let url = type === 'candidate' ? API_ENDPOINTS.REVIEWS_DELETE_FOR_CANDIDATE(reviewId) : API_ENDPOINTS.REVIEWS_DELETE_FOR_RECRUITER(reviewId);
        await axios.delete(url, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        return true;
    } catch (error) {
        throw error;
    }
};

// Cập nhật review (tạm thời: xóa rồi tạo mới)
export const updateReview = async (reviewId, updatedData, type = 'job') => {
    try {
        await deleteReview(reviewId, type);
        return await addReview(updatedData, type);
    } catch (error) {
        throw error;
    }
};

// Tiện ích format dữ liệu review
export const formatReviewData = (review, user) => {
    if (!review) return null;
    return {
        ...review,
        reviewer_name: review.reviewer_name || user?.username || 'Người dùng ẩn danh',
        date: new Date(review.created_date || review.created_at || new Date()).toLocaleDateString('vi-VN'),
        strengths: review.strengths || [],
        weaknesses: review.weaknesses || []
    };
};

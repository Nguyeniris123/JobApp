import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ReviewContext } from '../contexts/ReviewContext';

export const useReview = () => {
    const reviewContext = useContext(ReviewContext);
    const { user, role } = useContext(AuthContext);

    // Tạo review cho công việc (candidate đánh giá công việc)
    const createJobReview = async (jobId, rating, comment, strengths = [], weaknesses = []) => {
        if (role !== 'candidate') {
            return { success: false, message: 'Chỉ ứng viên mới có thể đánh giá công việc' };
        }

        try {
            return await reviewContext.addReview({
                reviewed_user: jobId, // Sử dụng ID của job làm reviewed_user theo định dạng API mới
                job: jobId,
                rating,
                comment,
                strengths, 
                weaknesses
            });
        } catch (error) {
            console.error('Lỗi khi tạo đánh giá cho công việc:', error);
            return { success: false, message: error.message || 'Không thể tạo đánh giá' };
        }
    };

    // Tạo review cho ứng viên (recruiter đánh giá ứng viên)
    const createApplicationReview = async (applicationId, rating, comment, strengths = [], weaknesses = []) => {
        if (role !== 'recruiter') {
            return { success: false, message: 'Chỉ nhà tuyển dụng mới có thể đánh giá ứng viên' };
        }

        try {
            return await reviewContext.addReview({
                reviewed_user: applicationId, // Sử dụng ID của application làm reviewed_user theo định dạng API mới
                application: applicationId,
                rating,
                comment,
                strengths,
                weaknesses
            });
        } catch (error) {
            console.error('Lỗi khi tạo đánh giá cho ứng viên:', error);
            return { success: false, message: error.message || 'Không thể tạo đánh giá' };
        }
    };

    // Cập nhật review hiện có
    const updateReview = async (reviewId, updatedData) => {
        try {
            // API hiện tại có thể chưa hỗ trợ cập nhật
            // Giải pháp tạm thời: xóa review cũ và tạo mới
            await reviewContext.deleteReview(reviewId);
            return await reviewContext.addReview(updatedData);
        } catch (error) {
            console.error('Lỗi khi cập nhật đánh giá:', error);
            return { success: false, message: error.message || 'Không thể cập nhật đánh giá' };
        }
    };

    // Thêm các tiện ích hỗ trợ hiển thị
    const formatReviewData = (review) => {
        if (!review) return null;

        return {
            ...review,
            // Thêm tên reviewer nếu không có
            reviewer_name: review.reviewer_name || user?.username || 'Người dùng ẩn danh',
            // Thêm các trường khác cần thiết cho hiển thị
            date: new Date(review.created_date || review.created_at || new Date()).toLocaleDateString('vi-VN'),
            // Đảm bảo strengths và weaknesses là mảng
            strengths: review.strengths || [],
            weaknesses: review.weaknesses || []
        };
    };

    return {
        ...reviewContext,
        createJobReview,
        createApplicationReview,
        updateReview,
        formatReviewData
    };
};
import axios from 'axios';
import { API_ENDPOINTS } from '../apiConfig';

export const fetchFollowedCompanies = async (accessToken) => {
    const response = await axios.get(API_ENDPOINTS.FOLLOW_LIST, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });
    // Xử lý các định dạng response khác nhau
    let companiesData = [];
    if (Array.isArray(response.data)) {
        companiesData = response.data;
    } else if (response.data && Array.isArray(response.data.results)) {
        companiesData = response.data.results;
    } else if (response.data) {
        companiesData = [response.data];
    }
    return companiesData;
};

export const followCompany = async (companyId, accessToken) => {
    const requestBody = { company_id: companyId };
    const response = await axios.post(API_ENDPOINTS.FOLLOW_CREATE, requestBody, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

export const unfollowCompany = async (followId, accessToken) => {
    try {
        const response = await axios.delete(API_ENDPOINTS.FOLLOW_DELETE(followId), {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            validateStatus: (status) => status === 204 || status === 200 || status === 404 // Accept 204, 200, 404 as success
        });
        // Nếu trả về 204 (No Content), 200, hoặc 404, coi là thành công
        if (response && (response.status === 204 || response.status === 200 || response.status === 404)) {
            return true;
        }
        // Nếu không phải các status trên, throw error
        throw new Error('Unfollow failed');
    } catch (error) {
        // Nếu là 204 hoặc 404 hoặc không có response (Network Error nhưng thực tế đã xóa thành công)
        if (
            (error.response && (error.response.status === 204 || error.response.status === 404)) ||
            (!error.response && error.message && error.message.toLowerCase().includes('network error'))
        ) {
            return true;
        }
        throw error;
    }
};

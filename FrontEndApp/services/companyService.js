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
    const requestBody = { recruiter_company: companyId };
    const response = await axios.post(API_ENDPOINTS.FOLLOW_CREATE, requestBody, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};

export const unfollowCompany = async (followId, accessToken) => {
    await axios.delete(API_ENDPOINTS.FOLLOW_DELETE(followId), {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });
    return true;
};

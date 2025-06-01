// Auth service for API calls related to authentication and user/company profile
import axios from 'axios';
import { API_ENDPOINTS } from '../apiConfig';

export const refreshAccessToken = async (refreshToken) => {
    const jsondata = {
        client_id: "OidP3ERxQtbZvrMN31JhxjjTWm325MLA3OMTCH5h",
        client_secret: "UI7wNEiXd6H22GYDOyJU8YcaKNDnhpsBB1Z0Ziq89iGtD1qYzybcLS7AUuNKHV02dlABUVccNxKPLNsOYdAYJLspRffloiTaHG0qVh67JP32zynznskB1fYrmP7jGwon",
        refresh_token: refreshToken,
        grant_type: "refresh_token"
    };
    const response = await axios.post(API_ENDPOINTS.LOGIN, jsondata);
    return response.data;
};

export const fetchRecruiterProfile = async (token) => {
    const response = await axios.get(API_ENDPOINTS.RECRUITERS_GET_CURRENT_USER, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const fetchCandidateProfile = async (token) => {
    const response = await axios.get(API_ENDPOINTS.CANDIDATES_GET_CURRENT_USER, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const changeAvatar = async (userId, avatar, accessToken) => {
    const formData = new FormData();
    formData.append('avatar', {
        uri: avatar,
        type: 'image/jpeg',
        name: 'avatar.jpg',
    });
    const response = await axios.patch(API_ENDPOINTS.AVATAR_PATCH(userId), formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return response.data;
};

export const updateUserProfile = async (userId, updatedData, role, accessToken) => {
    const endpoint = role === "recruiter"
        ? API_ENDPOINTS.RECRUITERS_UPDATE(userId)
        : API_ENDPOINTS.CANDIDATES_UPDATE(userId);
    const formData = new FormData();
    Object.keys(updatedData).forEach(key => {
        if (updatedData[key] !== undefined && updatedData[key] !== null) {
            formData.append(key, updatedData[key]);
        }
    });
    const response = await axios.patch(endpoint, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return response.data;
};

export const updateCompanyProfile = async (companyData, accessToken) => {
    const response = await axios.patch(
        API_ENDPOINTS.COMPANIES_UPDATE(companyData.id),
        companyData,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
};

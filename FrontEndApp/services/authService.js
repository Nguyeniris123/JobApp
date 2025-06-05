// Auth service for API calls related to authentication and user/company profile
import { CLIENT_ID, CLIENT_SECRET } from '@env';
import axios from 'axios';
import { API_ENDPOINTS } from '../apiConfig';

export const refreshAccessToken = async (refreshToken) => {
    const jsondata = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
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

// Đăng nhập
export const login = async (username, password) => {
    const jsondata = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        username,
        password,
        grant_type: "password",
    };
    const response = await axios.post(API_ENDPOINTS.LOGIN, jsondata);
    return response.data;
};

// Đăng ký
export const register = async (data, userType, avatar, companyImages) => {
    const formData = new FormData();
    formData.append("first_name", data.firstname);
    formData.append("last_name", data.lastname);
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("password", data.password);
    if (avatar) {
        const filename = avatar.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append("avatar", {
            uri: avatar,
            name: filename || 'avatar.jpg',
            type: type,
        });
    }
    if (userType === "employer") {
        formData.append("company_name", data.companyName);
        formData.append("description", data.description);
        formData.append("location", data.location);
        formData.append("tax_code", data.taxId);
        companyImages.forEach((imageUri, index) => {
            const filename = imageUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';
            formData.append('images', {
                uri: imageUri,
                type: type,
                name: filename || `company_image_${index}.jpg`,
            });
        });
    }
    const apiEndpoint = userType === "jobSeeker" ? 
        API_ENDPOINTS.CANDIDATES_CREATE : 
        API_ENDPOINTS.RECRUITERS_CREATE;
    try {
        const response = await axios.post(apiEndpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
            },
            validateStatus: () => true // always resolve
        });
        return { status: response.status, data: response.data };
    } catch (error) {
        // fallback, should not happen with validateStatus
        return { status: error.response?.status || 500, error };
    }
};

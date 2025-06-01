// Application service for API calls related to job applications
import axios from 'axios';
import { API_ENDPOINTS } from '../apiConfig';

export const fetchApplications = async (role, accessToken) => {
    const endpoint = role === 'recruiter'
        ? API_ENDPOINTS.APPLICATIONS_LIST_FOR_RECRUITER
        : API_ENDPOINTS.APPLICATIONS_LIST;
    const response = await axios.get(endpoint, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return response.data;
};

export const submitApplication = async (jobId, resumeFile, accessToken) => {
    let fileType = resumeFile.type;
    if (!fileType || !fileType.includes('/')) {
        if (resumeFile.name && resumeFile.name.toLowerCase().endsWith('.png')) {
            fileType = 'image/png';
        } else {
            fileType = 'image/jpeg';
        }
    }
    const formData = new FormData();
    formData.append('job', String(jobId));
    formData.append('cv', {
        uri: resumeFile.uri,
        name: resumeFile.name,
        type: fileType,
    });
    const response = await axios.post(
        API_ENDPOINTS.APPLICATIONS_CREATE,
        formData,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data;
};

export const acceptApplication = async (applicationId, accessToken) => {
    await axios.patch(
        API_ENDPOINTS.APPLICATIONS_ACCEPT(applicationId),
        {},
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
};

export const rejectApplication = async (applicationId, accessToken) => {
    await axios.patch(
        API_ENDPOINTS.APPLICATIONS_REJECT(applicationId),
        {},
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
};

export const updateApplication = async (applicationId, newCVFile, accessToken) => {
    let fileType = newCVFile.type;
    if (!fileType || !fileType.includes('/')) {
        if (newCVFile.name && newCVFile.name.toLowerCase().endsWith('.png')) {
            fileType = 'image/png';
        } else {
            fileType = 'image/jpeg';
        }
    }
    const formData = new FormData();
    formData.append('cv', {
        uri: newCVFile.uri,
        name: newCVFile.name,
        type: fileType,
    });
    const response = await axios.patch(
        API_ENDPOINTS.APPLICATIONS_UPDATE(applicationId),
        formData,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data;
};

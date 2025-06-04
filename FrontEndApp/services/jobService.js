import axios from 'axios';
import { API_ENDPOINTS } from '../apiConfig';

export const fetchJobs = async (filters) => {
    const params = new URLSearchParams();
    if (filters.specialized) params.append('specialized', filters.specialized);
    if (filters.salary_min) params.append('salary__gte', filters.salary_min);
    if (filters.salary_max) params.append('salary__lte', filters.salary_max);
    if (filters.working_hours_min) params.append('working_hours__gte', filters.working_hours_min);
    if (filters.working_hours_max) params.append('working_hours__lte', filters.working_hours_max);
    if (filters.location) params.append('location__icontains', filters.location);
    if (filters.search) params.append('search', filters.search);
    if (filters.ordering) params.append('ordering', filters.ordering);
    const url = `${API_ENDPOINTS.JOBPOSTS_LIST}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await axios.get(url);
    return response.data;
};

export const fetchJobById = async (jobId) => {
    const response = await axios.get(API_ENDPOINTS.JOBPOSTS_READ(jobId));
    return response.data;
};

export const createJob = async (jobData, accessToken) => {
    const response = await axios.post(API_ENDPOINTS.JOBPOSTS_CREATE, jobData, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return response.data;
};

export const deleteJob = async (jobId, accessToken) => {
    await axios.delete(API_ENDPOINTS.JOBPOSTS_DELETE(jobId), {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return true;
};

export const updateJob = async (jobId, jobData, accessToken) => {
    const response = await axios.put(API_ENDPOINTS.JOBPOSTS_UPDATE(jobId), jobData, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return response.data;
};

export const fetchRecruiterJobs = async (accessToken) => {
    const response = await axios.get(API_ENDPOINTS.JOBPOSTS_RECRUITER_JOB_POST, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return response.data;
};

export const fetchJobsByPage = async ({ page = 1, page_size = 10, filters = {} }) => {
    const params = new URLSearchParams();
    if (filters.specialized) params.append('specialized', filters.specialized);
    if (filters.salary_min) params.append('salary__gte', filters.salary_min);
    if (filters.salary_max) params.append('salary__lte', filters.salary_max);
    if (filters.working_hours_min) params.append('working_hours__gte', filters.working_hours_min);
    if (filters.working_hours_max) params.append('working_hours__lte', filters.working_hours_max);
    if (filters.location) params.append('location__icontains', filters.location);
    if (filters.search) params.append('search', filters.search);
    if (filters.ordering) params.append('ordering', filters.ordering);
    params.append('page', page);
    params.append('page_size', page_size);
    const url = `${API_ENDPOINTS.JOBPOSTS_LIST}?${params.toString()}`;
    const response = await axios.get(url);
    return response.data;
};

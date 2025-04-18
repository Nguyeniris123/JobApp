import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../apiConfig';

export const JobContext = createContext();

export const JobProvider = ({ children }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        specialized: '',
        salary_min: '',
        salary_max: '',
        working_hours_min: '',
        working_hours_max: '',
        location: '',
        search: '',
        ordering: '-created_date'
    });

    // Hàm xây dựng query string từ filters
    const buildQueryString = (filters) => {
        const params = new URLSearchParams();
        
        if (filters.specialized) params.append('specialized__icontains', filters.specialized);
        if (filters.salary_min) params.append('salary__gte', filters.salary_min);
        if (filters.salary_max) params.append('salary__lte', filters.salary_max);
        if (filters.working_hours_min) params.append('working_hours__gte', filters.working_hours_min);
        if (filters.working_hours_max) params.append('working_hours__lte', filters.working_hours_max);
        if (filters.location) params.append('location__icontains', filters.location);
        if (filters.search) params.append('search', filters.search);
        if (filters.ordering) params.append('ordering', filters.ordering);
        
        return params.toString();
    };

    // Lấy danh sách công việc từ API với filters
    const fetchJobs = async (customFilters = null) => {
        try {
            setLoading(true);
            const queryString = buildQueryString(customFilters || filters);
            const url = `${API_ENDPOINTS.JOBPOSTS_LIST}${queryString ? `?${queryString}` : ''}`;
            
            const response = await axios.get(url);
            setJobs(response.data.results || []);
            return response.data;
        } catch (error) {
            setError(error.response?.data?.detail || 'Lỗi khi lấy danh sách công việc!');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật filters và tải lại danh sách
    const updateFilters = async (newFilters) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        return await fetchJobs(updatedFilters);
    };

    // Lấy thông tin chi tiết công việc
    const fetchJobById = async (jobId) => {
        try {
            console.log("Bắt đầu fetch job detail với ID:", jobId);
            setLoading(true);
            const response = await axios.get(API_ENDPOINTS.JOBPOSTS_READ(jobId));
            console.log("Job detail data:", response.data);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi fetch job detail:", error);
            console.error("Error message:", error.message);
            setError(error.response?.data?.detail || 'Lỗi khi lấy thông tin công việc!');
            return null;
        } finally {
            setLoading(false);
            console.log("Kết thúc fetch job detail");
        }
    };

    // Thêm công việc mới (chỉ dành cho recruiter)
    const createJob = async (jobData) => {
        try {
            setLoading(true);
            const formattedJobData = {
                title: jobData.title,
                specialized: jobData.specialized || "General", // Default value if not provided
                description: jobData.description,
                salary: jobData.salary,
                working_hours: jobData.working_hours,
                location: jobData.location,
                company: {
                    name: jobData.company?.name || "",
                    tax_code: jobData.company?.tax_code || "",
                    description: jobData.company?.description || "",
                    location: jobData.company?.location || "",
                    is_verified: jobData.company?.is_verified || false
                }
            };
            const response = await axios.post(API_ENDPOINTS.JOBPOSTS_CREATE, formattedJobData);
            setJobs(prevJobs => [...prevJobs, response.data]);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tạo công việc:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Xóa công việc (chỉ dành cho recruiter)
    const deleteJob = async (jobId) => {
        try {
            setLoading(true);
            await axios.delete(API_ENDPOINTS.JOBPOSTS_DELETE(jobId));
            setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
            return true;
        } catch (error) {
            console.error('Lỗi khi xóa công việc:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật công việc (chỉ dành cho recruiter)
    const updateJob = async (jobId, jobData) => {
        try {
            setLoading(true);
            const response = await axios.put(API_ENDPOINTS.JOBPOSTS_UPDATE(jobId), jobData);
            setJobs(prevJobs => 
                prevJobs.map(job => job.id === jobId ? response.data : job)
            );
            return response.data;
        } catch (error) {
            console.error('Lỗi khi cập nhật công việc:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách công việc của nhà tuyển dụng
    const fetchRecruiterJobs = async (token) => {
        try {
            console.log("Bắt đầu fetch recruiter jobs...");
            setLoading(true);
            
            const response = await axios.get(API_ENDPOINTS.JOBPOSTS_RECRUITER_JOB_POST, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.data) {
                console.log("Không có dữ liệu trả về");
                setJobs([]);
                return [];
            }
            
            const jobsData = response.data.results || response.data;
            setJobs(jobsData);
            return jobsData;
        } catch (error) {
            console.error("Lỗi khi fetch recruiter jobs:", error);
            setError(error.response?.data?.detail || 'Lỗi khi lấy danh sách công việc!');
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Add this new function for applying to jobs
    const applyForJob = async (jobId, applicationData) => {
        try {
            const response = await axios.post(API_ENDPOINTS.APPLICATIONS_CREATE, {
                applicant: {
                    first_name: applicationData.fullName.split(' ').slice(-1).join(' '),
                    last_name: applicationData.fullName.split(' ').slice(0, -1).join(' '),
                    email: applicationData.email,
                },
                job: jobId,
                cv: applicationData.cv,
                job_detail: applicationData.jobDetail
            });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error applying for job:', error);
            return { 
                success: false, 
                message: error.response?.data?.detail || 'Failed to submit application' 
            };
        }
    };

    // Tải danh sách công việc ngay khi component được mount
    useEffect(() => {
        fetchJobs();
    }, []);

    return (
        <JobContext.Provider value={{ 
            jobs, 
            loading, 
            error, 
            filters,
            fetchJobs, 
            fetchJobById, 
            createJob, 
            deleteJob,
            updateJob,
            fetchRecruiterJobs,
            updateFilters,
            applyForJob
        }}>
            {children}
        </JobContext.Provider>
    );
};

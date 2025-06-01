import { createContext, useContext, useEffect, useState } from 'react';
import * as jobService from '../services/jobService';
import { AuthContext } from './AuthContext';

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
    const { accessToken } = useContext(AuthContext);
    const { isAuthenticated, loading: authLoading } = useContext(AuthContext);

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

    // Lấy danh sách công việc từ API với filters (public, không cần accessToken)
    const fetchJobs = async (customFilters = null) => {
        try {
            setLoading(true);
            const data = await jobService.fetchJobs(customFilters || filters);
            // Map lại dữ liệu để đảm bảo mỗi job có trường company
            const jobsWithCompany = (data.results || []).map(job => {
                if (job.recruiter && job.recruiter.company) {
                    return { ...job, company: job.recruiter.company };
                }
                return job;
            });
            setJobs(jobsWithCompany);
            return { ...data, results: jobsWithCompany };
        } catch (error) {
            setError(error.response?.data?.detail || 'Lỗi khi lấy danh sách công việc!');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Lấy thông tin chi tiết công việc
    const fetchJobById = async (jobId) => {
        if (authLoading || !isAuthenticated || !accessToken) {
            return null;
        }
        try {
            setLoading(true);
            const job = await jobService.fetchJobById(jobId);
            if (job.recruiter && job.recruiter.company) {
                job.company = job.recruiter.company;
            }
            return job;
        } catch (error) {
            setError(error.response?.data?.detail || 'Lỗi khi lấy thông tin công việc!');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Thêm công việc mới (chỉ dành cho recruiter)
    const createJob = async (jobData) => {
        try {
            setLoading(true);
            const response = await jobService.createJob(jobData, accessToken);
            setJobs(prevJobs => [...prevJobs, response]);
            fetchRecruiterJobs();
            return response;
        } catch (error) {
            setError(error.response?.data?.detail || 'Lỗi khi tạo công việc!');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Xóa công việc (chỉ dành cho recruiter)
    const deleteJob = async (jobId) => {
        try {
            setLoading(true);
            await jobService.deleteJob(jobId, accessToken);
            setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
            return true;
        } catch (error) {
            setError(error.response?.data?.detail || 'Lỗi khi xóa công việc!');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật công việc (chỉ dành cho recruiter)
    const updateJob = async (jobId, jobData) => {
        try {
            setLoading(true);
            const response = await jobService.updateJob(jobId, jobData, accessToken);
            setJobs(prevJobs => prevJobs.map(job => job.id === jobId ? response : job));
            return response;
        } catch (error) {
            setError(error.response?.data?.detail || 'Lỗi khi cập nhật công việc!');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách công việc của nhà tuyển dụng
    const fetchRecruiterJobs = async () => {
        try {
            setLoading(true);
            const data = await jobService.fetchRecruiterJobs(accessToken);
            const jobsData = data.results || data;
            setJobs(jobsData);
            return jobsData;
        } catch (error) {
            setError(error.response?.data?.detail || 'Lỗi khi lấy danh sách công việc!');
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Lấy danh sách công việc theo trang (phân trang, public)
    const fetchJobsByPage = async ({ page = 1, page_size = 10, customFilters = null } = {}) => {
        try {
            setLoading(true);
            const data = await jobService.fetchJobsByPage({ page, page_size, filters: customFilters || filters });
            const jobsWithCompany = (data.results || []).map(job => {
                if (job.recruiter && job.recruiter.company) {
                    return { ...job, company: job.recruiter.company };
                }
                return job;
            });
            return { ...data, results: jobsWithCompany };
        } catch (error) {
            setError(error.response?.data?.detail || 'Lỗi khi lấy danh sách công việc!');
            return { results: [], next: null, previous: null, count: 0, error: error.response?.data?.detail || 'Lỗi khi lấy danh sách công việc!' };
        } finally {
            setLoading(false);
        }
    };

    // Hàm cập nhật filters
    const updateFilters = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
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
            updateFilters, // expose updateFilters
            fetchJobsByPage // thêm hàm mới vào context
        }}>
            {children}
        </JobContext.Provider>
    );
};

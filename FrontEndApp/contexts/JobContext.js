import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../apiConfig';
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

    // Lấy danh sách công việc từ API với filters
    const fetchJobs = async (customFilters = null) => {
        if (authLoading || !isAuthenticated || !accessToken) {
            return null;
        }
        try {
            setLoading(true);
            const queryString = buildQueryString(customFilters || filters);
            const url = `${API_ENDPOINTS.JOBPOSTS_LIST}${queryString ? `?${queryString}` : ''}`;
            
            const response = await axios.get(url);
            // Map lại dữ liệu để đảm bảo mỗi job có trường company
            const jobsWithCompany = (response.data.results || []).map(job => {
                if (job.recruiter && job.recruiter.company) {
                    return { ...job, company: job.recruiter.company };
                }
                return job;
            });
            setJobs(jobsWithCompany);
            return { ...response.data, results: jobsWithCompany };
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
        if (authLoading || !isAuthenticated || !accessToken) {
            return null;
        }
        try {
            console.log("Bắt đầu fetch job detail với ID:", jobId);
            setLoading(true);
            const response = await axios.get(API_ENDPOINTS.JOBPOSTS_READ(jobId));
            let job = response.data;
            // Map lại dữ liệu để đảm bảo job có trường company
            if (job.recruiter && job.recruiter.company) {
                job = { ...job, company: job.recruiter.company };
            }
            console.log("Job detail data:", job);
            return job;
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
            // Định dạng dữ liệu theo schema yêu cầu
            const formattedJobData = {
                title: jobData.title, // string, bắt buộc, maxLength: 255, minLength: 1
                specialized: jobData.specialized || "General", // string, maxLength: 100, minLength: 1
                description: jobData.description, // string, bắt buộc, minLength: 1
                salary: jobData.salary, // decimal, bắt buộc
                working_hours: jobData.working_hours, // string, bắt buộc, maxLength: 50, minLength: 1
                location: jobData.location, // string, bắt buộc, maxLength: 255, minLength: 1
                requirements: jobData.requirements || [],
                benefits: jobData.benefits || [],
                deadline: jobData.deadline,
                urgent: jobData.urgent || false,
                company: {
                    name: jobData.company?.name || "",
                    tax_code: jobData.company?.tax_code || "",
                    description: jobData.company?.description || "",
                    location: jobData.company?.location || "",
                    is_verified: jobData.company?.is_verified || false
                }
            };
            
            const response = await axios.post(API_ENDPOINTS.JOBPOSTS_CREATE, formattedJobData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            setJobs(prevJobs => [...prevJobs, response.data]);
            fetchRecruiterJobs(); // Cập nhật danh sách công việc của nhà tuyển dụng
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
            
            // Định dạng dữ liệu trước khi gửi đi
            const formattedJobData = {
                title: jobData.title,
                specialized: jobData.specialized,
                description: jobData.description,
                location: jobData.location,
                salary: jobData.salary,
                working_hours: jobData.working_hours
            };
            
            const response = await axios.put(API_ENDPOINTS.JOBPOSTS_UPDATE(jobId), formattedJobData, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
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
    const fetchRecruiterJobs = async () => {
        try {
            console.log("Bắt đầu fetch recruiter jobs...");
            setLoading(true);
            
            const response = await axios.get(API_ENDPOINTS.JOBPOSTS_RECRUITER_JOB_POST, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
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
            updateFilters
        }}>
            {children}
        </JobContext.Provider>
    );
};

import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';
import { API_URL } from '../config';

export const JobContext = createContext();

export const JobProvider = ({ children }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Lấy danh sách công việc từ API
    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/jobpost/`);
            setJobs(response.data);
        } catch (error) {
            setError(error.response?.data?.detail || 'Lỗi khi lấy danh sách công việc!');
        } finally {
            setLoading(false);
        }
    };

    // Lấy thông tin chi tiết công việc
    const fetchJobById = async (jobId) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/jobpost/${jobId}/`);
            return response.data;
        } catch (error) {
            setError(error.response?.data?.detail || 'Lỗi khi lấy thông tin công việc!');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Thêm công việc mới
    const createJob = async (jobData) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/jobpost/`, jobData);
            setJobs([...jobs, response.data]);
            return response.data;
        } catch (error) {
            setError(error.response?.data?.detail || 'Lỗi khi tạo công việc!');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Xóa công việc
    const deleteJob = async (jobId) => {
        try {
            setLoading(true);
            await axios.delete(`${API_URL}/jobpost/${jobId}/`);
            setJobs(jobs.filter(job => job.id !== jobId));
        } catch (error) {
            setError(error.response?.data?.detail || 'Lỗi khi xóa công việc!');
        } finally {
            setLoading(false);
        }
    };

    // Tải danh sách công việc ngay khi component được mount
    useEffect(() => {
        fetchJobs();
    }, []);

    return (
        <JobContext.Provider value={{ jobs, loading, error, fetchJobs, fetchJobById, createJob, deleteJob }}>
            {children}
        </JobContext.Provider>
    );
};

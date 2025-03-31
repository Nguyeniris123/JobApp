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
            console.log("Bắt đầu fetch jobs...");
            console.log("API URL:", `${API_URL}/jobposts/`);
            setLoading(true);
            
            const response = await axios.get(`${API_URL}/jobposts/`);
            console.log("Status code:", response.status);
            console.log("Response data:", response.data);
            
            if (!response.data) {
                console.log("Không có dữ liệu trả về");
                setJobs([]);
                return;
            }
            
            setJobs(response.data.results || []);
            console.log("Đã cập nhật jobs state với dữ liệu mới");
        } catch (error) {
            console.error("Lỗi khi fetch jobs:", error);
            console.error("Error message:", error.message);
            setError(error.response?.data?.detail || 'Lỗi khi lấy danh sách công việc!');
        } finally {
            setLoading(false);
            console.log("Kết thúc fetch jobs");
        }
    };

    // Lấy thông tin chi tiết công việc
    const fetchJobById = async (jobId) => {
        try {
            console.log("Bắt đầu fetch job detail với ID:", jobId);
            setLoading(true);
            const response = await axios.get(`${API_URL}/jobposts/${jobId}/`);
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

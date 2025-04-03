import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';
import { API_URL } from '../config';

export const CompanyContext = createContext({
    loading: false,
    followedCompanies: [],
    unfollowCompany: () => {},
    followCompany: () => {}
});

export const CompanyProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [followedCompanies, setFollowedCompanies] = useState([]);

    const fetchFollowedCompanies = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(`${API_URL}/follow`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setFollowedCompanies(response.data);
        } catch (error) {
            console.error('Error fetching followed companies:', error);
        } finally {
            setLoading(false);
        }
    };

    const unfollowCompany = async (companyId) => {
        try {
            const token = localStorage.getItem('accessToken');
            await axios.delete(`${API_URL}/follow/${companyId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setFollowedCompanies(prev => 
                prev.filter(company => company.id !== companyId)
            );
        } catch (error) {
            console.error('Error unfollowing company:', error);
            throw error;
        }
    };

    const followCompany = async (companyId) => {
        try {
            const token = localStorage.getItem('accessToken');
            await axios.post(`${API_URL}/follow/${companyId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Refresh the followed companies list
            await fetchFollowedCompanies();
        } catch (error) {
            console.error('Error following company:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchFollowedCompanies();
    }, []);

    return (
        <CompanyContext.Provider value={{
            loading,
            followedCompanies,
            unfollowCompany,
            followCompany
        }}>
            {children}
        </CompanyContext.Provider>
    );
};

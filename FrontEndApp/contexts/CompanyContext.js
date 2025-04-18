import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../apiConfig';

export const CompanyContext = createContext({
    loading: false,
    followedCompanies: [],
    unfollowCompany: () => {},
    followCompany: () => {},
    getFollowedCompanyById: () => {},
    fetchFollowedCompanies: () => {}
});

export const CompanyProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [followedCompanies, setFollowedCompanies] = useState([]);

    const fetchFollowedCompanies = async () => {
        try {
            console.log('Starting to fetch followed companies...');
            setLoading(true);
            const token = await AsyncStorage.getItem('accessToken');
            console.log('Token found:', !!token);
            if (!token) {
                console.log('No token found');
                return;
            }
            const response = await axios.get(API_ENDPOINTS.FOLLOW_LIST, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Followed companies API response:', response.data);
            setFollowedCompanies(response.data);
        } catch (error) {
            console.error('Error fetching followed companies:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const unfollowCompany = async (companyId) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) throw new Error('No token found');
            
            await axios.delete(API_ENDPOINTS.FOLLOW_DELETE(companyId), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            await fetchFollowedCompanies(); // Refresh list after unfollow
        } catch (error) {
            console.error('Error unfollowing company:', error.response || error);
            throw error;
        }
    };

    const followCompany = async (companyId) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (!token) throw new Error('No token found');
            
            await axios.post(API_ENDPOINTS.FOLLOW_CREATE, {
                company: companyId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            await fetchFollowedCompanies(); // Refresh list after follow
        } catch (error) {
            console.error('Error following company:', error.response || error);
            throw error;
        }
    };

    const getFollowedCompanyById = (companyId) => {
        return followedCompanies.find(follow => follow.recruiter_company.id === companyId);
    };

    useEffect(() => {
        fetchFollowedCompanies();
    }, []);

    return (
        <CompanyContext.Provider value={{
            loading,
            followedCompanies,
            fetchFollowedCompanies,
            unfollowCompany,
            followCompany,
            getFollowedCompanyById
        }}>
            {children}
        </CompanyContext.Provider>
    );
};

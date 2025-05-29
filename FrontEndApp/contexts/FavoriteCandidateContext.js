import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { API_ENDPOINTS } from '../apiConfig';

export const FavoriteCandidateContext = createContext({
    loading: false,
    favoriteCandidates: [],
    followCandidate: () => {},
    unfollowCandidate: () => {},
    isFavorite: () => false,
    fetchFavoriteCandidates: () => {},
});

export const FavoriteCandidateProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [favoriteCandidates, setFavoriteCandidates] = useState([]);
    const [token, setToken] = useState(null);
    const hasFetchedInitialData = useRef(false);

    useEffect(() => {
        const loadToken = async () => {
            const storedAccessToken = await AsyncStorage.getItem('accessToken');
            if (storedAccessToken) setToken(storedAccessToken);
        };
        loadToken();
    }, []);

    useEffect(() => {
        if (token && !hasFetchedInitialData.current) {
            hasFetchedInitialData.current = true;
            fetchFavoriteCandidates();
        }
    }, [token]);

    const fetchFavoriteCandidates = useCallback(async () => {
        if (!token) return [];
        setLoading(true);
        try {
            const response = await axios.get(API_ENDPOINTS.FOLLOW_LIST, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            let data = response.data;
            if (Array.isArray(data)) {
                setFavoriteCandidates(data);
                return data;
            } else if (data.results && Array.isArray(data.results)) {
                setFavoriteCandidates(data.results);
                return data.results;
            } else {
                setFavoriteCandidates([]);
                return [];
            }
        } catch (error) {
            setFavoriteCandidates([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, [token]);

    const followCandidate = async (candidateId) => {
        if (!token) return false;
        try {
            const response = await axios.post(API_ENDPOINTS.FOLLOW_CREATE, { company_id: candidateId }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data) {
                setFavoriteCandidates(prev => {
                    if (prev.some(item => item.recruiter_company?.id === candidateId)) return prev;
                    return [...prev, response.data];
                });
            }
            return true;
        } catch (error) {
            return false;
        }
    };

    const unfollowCandidate = async (candidateId) => {
        if (!token) return false;
        const found = favoriteCandidates.find(f => f.recruiter_company?.id === candidateId);
        const followId = found ? found.id : candidateId;
        try {
            await axios.delete(API_ENDPOINTS.FOLLOW_DELETE(followId), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setFavoriteCandidates(prev => prev.filter(f => f.recruiter_company?.id !== candidateId && f.id !== candidateId));
            return true;
        } catch (error) {
            setFavoriteCandidates(prev => prev.filter(f => f.recruiter_company?.id !== candidateId && f.id !== candidateId));
            return false;
        }
    };

    const isFavorite = (candidateId) => {
        return favoriteCandidates.some(f => f.recruiter_company?.id === candidateId);
    };

    return (
        <FavoriteCandidateContext.Provider value={{
            loading,
            favoriteCandidates,
            followCandidate,
            unfollowCandidate,
            isFavorite,
            fetchFavoriteCandidates,
        }}>
            {children}
        </FavoriteCandidateContext.Provider>
    );
};

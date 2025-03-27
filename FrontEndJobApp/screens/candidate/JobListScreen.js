import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useTheme } from 'react-native-paper';
import { API_URL } from '../../config.js';

// Import components
// import JobCard from '../../components/business/JobCard';
import ScreenContainer from '../../components/layout/ScreenContainer';
import ScreenHeader from '../../components/layout/ScreenHeader';
import ErrorState from '../../components/states/ErrorState';
import LoadingState from '../../components/states/LoadingState';

const JobListScreen = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    salary: '',
    skills: [],
  });
  const [savedJobs, setSavedJobs] = useState([]);
  const theme = useTheme();
  
  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
  }, []);
  
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/jobs/`, {
        params: {
          location: filters.location,
          min_salary: filters.salary,
          skills: filters.skills.join(','),
        }
      });
      setJobs(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const fetchSavedJobs = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/saved-jobs/`);
      setSavedJobs(response.data.map(item => item.job.id));
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
    fetchSavedJobs();
  };
  
  const handleApply = (jobId) => {
    navigation.navigate('JobDetail', { jobId });
  };
  
  const handleSaveJob = async (jobId) => {
    try {
      if (savedJobs.includes(jobId)) {
        await axios.delete(`${API_URL}/api/saved-jobs/${jobId}/`);
        setSavedJobs(savedJobs.filter(id => id !== jobId));
      } else {
        await axios.post(`${API_URL}/api/saved-jobs/`, { job: jobId });
        setSavedJobs([...savedJobs, jobId]);
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error);
      alert('Failed to save job. Please try again.');
    }
  };
  
  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setFilterVisible(false);
    fetchJobs();
  };
  
  if (loading && !refreshing) {
    return (
      <ScreenContainer>
        <ScreenHeader 
          title="Find Jobs" 
          rightIcon="filter-variant" 
          onRightPress={() => setFilterVisible(true)}
        />
        <LoadingState message="Loading jobs..." />
      </ScreenContainer>
    );
  }
  
  if (error) {
    return (
      <ScreenContainer>
        <ScreenHeader 
          title="Find Jobs" 
          rightIcon="filter-variant" 
          onRightPress={() => setFilterVisible(true)}
        />
        <ErrorState 
          message={error} 
          onRetry={fetchJobs} 
        />
      </ScreenContainer>
    );
  }
  
  // return (
    // <ScreenContainer>
    //   <ScreenHeader 
    //     title="Find Jobs" 
    //     rightIcon="filter-variant" 
    //     onRightPress={() => setFilterVisible(true)}
    //   />
      
    //   {jobs.length === 0 ? (
    //     <EmptyState 
    //       title="No jobs found" 
    //       message="Try adjusting your filters or check back later for new opportunities." 
    //       icon="briefcase-search" 
    //     />
    //   ) 
    //   : (
    //     // <FlatList
    //   //     data={jobs}
    //   //     renderItem={({ item }) => (
    //   //       // <JobCard
    //   //       //   job={item}
    //   //       //   onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
    //   //       //   onApply={() => handleApply(item.id)}
    //   //       //   onSave={() => handleSaveJob(item.id)}
    //   //       //   saved={savedJobs.includes(item.id)}
    //   //       // />
    //   //     )}
    //   //     keyExtractor={item => item.id.toString()}
    //   //     contentContainerStyle={{ padding: 16 }}
    //   //     refreshControl={
    //   //       <RefreshControl
    //   //         refreshing={refreshing}
    //   //         onRefresh={onRefresh}
    //   //         colors={[theme.colors.primary]}
    //   //       />
    //   //     }
    //   //   />
    //   // )}
      
    //   <FilterModal
    //     visible={filterVisible}
    //     onDismiss={() => setFilterVisible(false)}
    //     onApply={applyFilters}
    //     initialFilters={filters}
    //   />
    // </ScreenContainer> 
  // );
};

export default JobListScreen;
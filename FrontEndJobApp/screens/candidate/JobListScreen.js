import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Searchbar, Chip, Text, Button, Card, Title, Paragraph, useTheme, ActivityIndicator, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../../config';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FilterModal from '../../components/FilterModal';

const JobListScreen = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    minSalary: '',
    maxSalary: '',
    workingHours: '',
    skills: [],
  });
  const [skills, setSkills] = useState([]);
  const theme = useTheme();

  // Fetch jobs when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchJobs();
      fetchSkills();
    }, [])
  );

  // Fetch jobs with filters
  const fetchJobs = async () => {
    try {
      setLoading(true);

      // Build query parameters
      let params = {};
      if (searchQuery) params.search = searchQuery;
      if (filters.location) params.location = filters.location;
      if (filters.minSalary) params.min_salary = filters.minSalary;
      if (filters.maxSalary) params.max_salary = filters.maxSalary;
      if (filters.workingHours) params.working_hours = filters.workingHours;
      if (filters.skills.length > 0) params.skills = filters.skills.join(',');

      const response = await axios.get(`${API_URL}/api/jobs/`, { params });
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

  // Fetch available skills for filtering
  const fetchSkills = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/skills/`);
      setSkills(response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  // Handle search
  const onChangeSearch = (query) => {
    setSearchQuery(query);
  };

  // Apply search
  const handleSearch = () => {
    fetchJobs();
  };

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  // Apply filters
  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setFilterModalVisible(false);
    fetchJobs();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      location: '',
      minSalary: '',
      maxSalary: '',
      workingHours: '',
      skills: [],
    });
    setFilterModalVisible(false);
    fetchJobs();
  };

  // Render job item
  const renderJobItem = ({ item }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}>
      <Card.Content>
        <Title>{item.title}</Title>
        <View style={styles.companyRow}>
          <MaterialCommunityIcons name="domain" size={16} color="#666" />
          <Text style={styles.companyName}>{item.company_name}</Text>
          {item.company_verified && (
            <MaterialCommunityIcons name="check-decagram" size={16} color={theme.colors.primary} />
          )}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>

          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="currency-usd" size={16} color="#666" />
            <Text style={styles.detailText}>${item.salary}/hr</Text>
          </View>

          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.working_hours}</Text>
          </View>
        </View>

        <Paragraph numberOfLines={2} style={styles.description}>
          {item.description}
        </Paragraph>

        <View style={styles.skillsContainer}>
          {item.skills && item.skills.map(skill => (
            <Chip key={skill.id} style={styles.skillChip} textStyle={styles.skillText}>
              {skill.name}
            </Chip>
          ))}
        </View>
      </Card.Content>

      <Card.Actions style={styles.cardActions}>
        <Text style={styles.postedDate}>Posted {new Date(item.created_at).toLocaleDateString()}</Text>
        <Button mode="contained" compact>Apply Now</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search jobs..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchbar}
          onSubmitEditing={handleSearch}
        />
        <Button
          mode="contained"
          onPress={() => setFilterModalVisible(true)}
          style={styles.filterButton}
          icon="filter-variant"
        >
          Filter
        </Button>
      </View>

      {/* Active filters display */}
      {(filters.location || filters.minSalary || filters.maxSalary ||
        filters.workingHours || filters.skills.length > 0) && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersTitle}>Active Filters:</Text>
          <View style={styles.filtersRow}>
            {filters.location && (
              <Chip
                icon="map-marker"
                onClose={() => {
                  setFilters({...filters, location: ''});
                  fetchJobs();
                }}
                style={styles.filterChip}
              >
                {filters.location}
              </Chip>
            )}

            {(filters.minSalary || filters.maxSalary) && (
              <Chip
                icon="currency-usd"
                onClose={() => {
                  setFilters({...filters, minSalary: '', maxSalary: ''});
                  fetchJobs();
                }}
                style={styles.filterChip}
              >
                {filters.minSalary ? `$${filters.minSalary}` : '$0'} -
                {filters.maxSalary ? `$${filters.maxSalary}` : 'Any'}
              </Chip>
            )}

            {filters.workingHours && (
              <Chip
                icon="clock-outline"
                onClose={() => {
                  setFilters({...filters, workingHours: ''});
                  fetchJobs();
                }}
                style={styles.filterChip}
              >
                {filters.workingHours}
              </Chip>
            )}

            {filters.skills.map(skillId => {
              const skill = skills.find(s => s.id === skillId);
              return skill ? (
                <Chip
                  key={skillId}
                  onClose={() => {
                    setFilters({
                      ...filters,
                      skills: filters.skills.filter(id => id !== skillId)
                    });
                    fetchJobs();
                  }}
                  style={styles.filterChip}
                >
                  {skill.name}
                </Chip>
              ) : null;
            })}
          </View>
        </View>
      )}

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading jobs...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={50} color="red" />
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={fetchJobs} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      ) : jobs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="briefcase-search" size={50} color={theme.colors.primary} />
          <Text style={styles.emptyText}>No jobs found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJobItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}

      <FilterModal
        visible={filterModalVisible}
        onDismiss={() => setFilterModalVisible(false)}
        onApply={applyFilters}
        onReset={resetFilters}
        filters={filters}
        skills={skills}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 4,
  },
  searchbar: {
    flex: 1,
    marginRight: 8,
  },
  filterButton: {
    justifyContent: 'center',
  },
  activeFiltersContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 16,
    elevation: 4,
  },
  activeFiltersTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    margin: 4,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  companyName: {
    marginLeft: 4,
    color: '#666',
    flex: 1,
  },
  divider: {
    marginVertical: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 4,
  },
  detailText: {
    marginLeft: 4,
    fontSize: 12,
  },
  description: {
    marginBottom: 10,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  skillChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
  },
  skillText: {
    fontSize: 12,
  },
  cardActions: {
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  postedDate: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptySubtext: {
    marginTop: 5,
    color: '#666',
    textAlign: 'center',
  },
});

export default JobListScreen;
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Divider, FAB, IconButton, Menu, Searchbar, Text, useTheme } from 'react-native-paper';
import { API_URL } from '../../config.js';

const ManageJobsScreen = ({ navigation }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [menuVisible, setMenuVisible] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all'); // all, active, expired
    const theme = useTheme();

    useEffect(() => {
        fetchJobs();

        // Refresh jobs when screen is focused
        const unsubscribe = navigation.addListener('focus', () => {
            fetchJobs();
        });

        return unsubscribe;
    }, [navigation]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/jobs/my-jobs/`);
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

    const onRefresh = () => {
        setRefreshing(true);
        fetchJobs();
    };

    const toggleMenu = (jobId) => {
        setMenuVisible({
            ...menuVisible,
            [jobId]: !menuVisible[jobId]
        });
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const toggleJobStatus = async (jobId, isActive) => {
        try {
            await axios.patch(`${API_URL}/api/jobs/${jobId}/`, {
                is_active: isActive
            });

            // Update local state
            setJobs(jobs.map(job =>
                job.id === jobId ? { ...job, is_active: isActive } : job
            ));

            toggleMenu(jobId);
        } catch (error) {
            console.error('Error updating job status:', error);
            alert('Failed to update job status. Please try again.');
        }
    };

    const deleteJob = async (jobId) => {
        try {
            await axios.delete(`${API_URL}/api/jobs/${jobId}/`);

            // Update local state
            setJobs(jobs.filter(job => job.id !== jobId));

            toggleMenu(jobId);
        } catch (error) {
            console.error('Error deleting job:', error);
            alert('Failed to delete job. Please try again.');
        }
    };

    const confirmDelete = (jobId) => {
        toggleMenu(jobId);

        // Show confirmation dialog
        Alert.alert(
            "Delete Job",
            "Are you sure you want to delete this job? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    onPress: () => deleteJob(jobId),
                    style: "destructive"
                }
            ]
        );
    };

    const filteredJobs = jobs.filter(job => {
        // Apply search filter
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.location.toLowerCase().includes(searchQuery.toLowerCase());

        // Apply status filter
        const matchesFilter = filter === 'all' ||
            (filter === 'active' && job.is_active) ||
            (filter === 'expired' && !job.is_active);

        return matchesSearch && matchesFilter;
    });

    const renderJobItem = ({ item }) => (
        <Card style={[styles.card, !item.is_active && styles.inactiveCard]}>
            <Card.Content>
                <View style={styles.headerRow}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.jobTitle}>{item.title}</Text>
                        <Text style={styles.location}>{item.location}</Text>
                    </View>

                    <Menu
                        visible={menuVisible[item.id] || false}
                        onDismiss={() => toggleMenu(item.id)}
                        anchor={
                            <IconButton
                                icon="dots-vertical"
                                size={20}
                                onPress={() => toggleMenu(item.id)}
                            />
                        }
                    >
                        <Menu.Item
                            icon="pencil"
                            onPress={() => {
                                toggleMenu(item.id);
                                navigation.navigate('PostJob', { jobId: item.id });
                            }}
                            title="Edit"
                        />
                        <Menu.Item
                            icon={item.is_active ? "close-circle-outline" : "check-circle-outline"}
                            onPress={() => toggleJobStatus(item.id, !item.is_active)}
                            title={item.is_active ? "Deactivate" : "Activate"}
                        />
                        <Menu.Item
                            icon="delete"
                            onPress={() => confirmDelete(item.id)}
                            title="Delete"
                        />
                    </Menu>
                </View>

                <View style={styles.statusRow}>
                    <Chip
                        style={[
                            styles.statusChip,
                            { backgroundColor: item.is_active ? '#E8F5E9' : '#FFEBEE' }
                        ]}
                        textStyle={{
                            color: item.is_active ? '#4CAF50' : '#F44336'
                        }}
                    >
                        {item.is_active ? 'Active' : 'Inactive'}
                    </Chip>

                    <Text style={styles.postedDate}>
                        Posted on {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="eye-outline" size={16} color="#666" />
                        <Text style={styles.statText}>{item.views} Views</Text>
                    </View>

                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="file-document-outline" size={16} color="#666" />
                        <Text style={styles.statText}>{item.applications_count} Applications</Text>
                    </View>

                    <View style={styles.statItem}>
                        <MaterialCommunityIcons name="currency-usd" size={16} color="#666" />
                        <Text style={styles.statText}>${item.salary}/hr</Text>
                    </View>
                </View>
            </Card.Content>

            <Card.Actions style={styles.cardActions}>
                <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
                    style={styles.actionButton}
                >
                    View
                </Button>

                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('Applicants', { jobId: item.id })}
                    style={styles.actionButton}
                    icon="account-group"
                >
                    Applicants
                </Button>
            </Card.Actions>
        </Card>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder="Search jobs..."
                    onChangeText={handleSearch}
                    value={searchQuery}
                    style={styles.searchbar}
                />
            </View>

            <View style={styles.filterContainer}>
                <Button
                    mode={filter === 'all' ? 'contained' : 'outlined'}
                    onPress={() => setFilter('all')}
                    style={styles.filterButton}
                    compact
                >
                    All
                </Button>
                <Button
                    mode={filter === 'active' ? 'contained' : 'outlined'}
                    onPress={() => setFilter('active')}
                    style={styles.filterButton}
                    compact
                >
                    Active
                </Button>
                <Button
                    mode={filter === 'expired' ? 'contained' : 'outlined'}
                    onPress={() => setFilter('expired')}
                    style={styles.filterButton}
                    compact
                >
                    Inactive
                </Button>
            </View>

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
            ) : filteredJobs.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="briefcase-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>No jobs found</Text>
                    <Text style={styles.emptySubtext}>
                        {searchQuery ? 'Try a different search term' : 'Post your first job to get started'}
                    </Text>
                    <Button
                        mode="contained"
                        onPress={() => navigation.navigate('PostJob')}
                        style={styles.postJobButton}
                        icon="plus"
                    >
                        Post a Job
                    </Button>
                </View>
            ) : (
                <FlatList
                    data={filteredJobs}
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

            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => navigation.navigate('PostJob')}
                label="Post Job"
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
        padding: 10,
        backgroundColor: '#fff',
        elevation: 2,
    },
    searchbar: {
        elevation: 0,
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    filterButton: {
        marginRight: 10,
    },
    listContainer: {
        padding: 10,
    },
    card: {
        marginBottom: 16,
        elevation: 2,
    },
    inactiveCard: {
        opacity: 0.7,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    titleContainer: {
        flex: 1,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    location: {
        fontSize: 14,
        color: '#666',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    statusChip: {
        height: 28,
    },
    postedDate: {
        fontSize: 12,
        color: '#666',
        marginLeft: 'auto',
    },
    divider: {
        marginVertical: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        marginLeft: 4,
        fontSize: 12,
        color: '#666',
    },
    cardActions: {
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    actionButton: {
        marginLeft: 8,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
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
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    postJobButton: {
        marginTop: 10,
    },
});

export default ManageJobsScreen;
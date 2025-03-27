import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Divider, IconButton, Text, useTheme } from 'react-native-paper';
import { API_URL } from '../../config.js';

const SavedJobsScreen = ({ navigation }) => {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const theme = useTheme();

    useEffect(() => {
        fetchSavedJobs();
    }, []);

    const fetchSavedJobs = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/saved-jobs/`);
            setSavedJobs(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching saved jobs:', error);
            setError('Failed to load saved jobs. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchSavedJobs();
    };

    const removeSavedJob = async (jobId) => {
        try {
            await axios.delete(`${API_URL}/api/saved-jobs/${jobId}/`);
            setSavedJobs(savedJobs.filter(job => job.id !== jobId));
        } catch (error) {
            console.error('Error removing saved job:', error);
            alert('Failed to remove job. Please try again.');
        }
    };

    const renderSavedJobItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.headerRow}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.jobTitle}>{item.job.title}</Text>
                        <Text style={styles.companyName}>{item.job.company.name}</Text>
                    </View>
                    <IconButton
                        icon="bookmark-remove"
                        size={20}
                        color="red"
                        onPress={() => removeSavedJob(item.id)}
                    />
                </View>

                <Divider style={styles.divider} />

                <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
                        <Text style={styles.detailText}>{item.job.location}</Text>
                    </View>

                    <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="currency-usd" size={16} color="#666" />
                        <Text style={styles.detailText}>${item.job.salary}/hr</Text>
                    </View>

                    <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
                        <Text style={styles.detailText}>{item.job.working_hours}</Text>
                    </View>
                </View>

                <View style={styles.skillsContainer}>
                    {item.job.skills && item.job.skills.slice(0, 3).map(skill => (
                        <Chip key={skill.id} style={styles.skillChip} textStyle={styles.skillText}>
                            {skill.name}
                        </Chip>
                    ))}
                    {item.job.skills && item.job.skills.length > 3 && (
                        <Chip style={styles.skillChip} textStyle={styles.skillText}>
                            +{item.job.skills.length - 3} more
                        </Chip>
                    )}
                </View>
            </Card.Content>

            <Card.Actions style={styles.cardActions}>
                <Text style={styles.savedDate}>
                    Saved on {new Date(item.created_at).toLocaleDateString()}
                </Text>
                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('JobDetail', { jobId: item.job.id })}
                >
                    View Job
                </Button>
            </Card.Actions>
        </Card>
    );

    return (
        <View style={styles.container}>
            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading saved jobs...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={50} color="red" />
                    <Text style={styles.errorText}>{error}</Text>
                    <Button mode="contained" onPress={fetchSavedJobs} style={styles.retryButton}>
                        Retry
                    </Button>
                </View>
            ) : savedJobs.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="bookmark-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>No saved jobs</Text>
                    <Text style={styles.emptySubtext}>
                        Jobs you save will appear here for easy access
                    </Text>
                    <Button
                        mode="contained"
                        onPress={() => navigation.navigate('Jobs')}
                        style={styles.browseButton}
                        icon="briefcase-search"
                    >
                        Browse Jobs
                    </Button>
                </View>
            ) : (
                <FlatList
                    data={savedJobs}
                    renderItem={renderSavedJobItem}
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContainer: {
        padding: 16,
    },
    card: {
        marginBottom: 16,
        elevation: 2,
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
    companyName: {
        fontSize: 14,
        color: '#666',
    },
    divider: {
        marginVertical: 12,
    },
    detailsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 8,
    },
    detailText: {
        marginLeft: 4,
        fontSize: 12,
        color: '#666',
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
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
    savedDate: {
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
    browseButton: {
        marginTop: 10,
    },
});

export default SavedJobsScreen;
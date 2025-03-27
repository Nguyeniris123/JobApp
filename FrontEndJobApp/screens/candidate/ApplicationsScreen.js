import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Button, Card, Chip, Divider, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { API_URL } from '../../config.js';

const ApplicationsScreen = ({ navigation }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const theme = useTheme();

    // useEffect(() => {
    //     fetchApplications();
    // }, []);

    // const fetchApplications = async () => {
    //     try {
    //         setLoading(true);
    //         const response = await axios.get(`${API_URL}/api/applications/`);
    //         setApplications(response.data);
    //         setError(null);
    //     } catch (error) {
    //         console.error('Error fetching applications:', error);
    //         setError('Failed to load applications. Please try again.');
    //     } finally {
    //         setLoading(false);
    //         setRefreshing(false);
    //     }
    // };

    const onRefresh = () => {
        setRefreshing(true);
        fetchApplications();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return '#FFA000';
            case 'accepted':
                return '#4CAF50';
            case 'rejected':
                return '#F44336';
            case 'interview':
                return '#2196F3';
            default:
                return '#9E9E9E';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return 'clock-outline';
            case 'accepted':
                return 'check-circle-outline';
            case 'rejected':
                return 'close-circle-outline';
            case 'interview':
                return 'calendar-check';
            default:
                return 'help-circle-outline';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'Pending';
            case 'accepted':
                return 'Accepted';
            case 'rejected':
                return 'Rejected';
            case 'interview':
                return 'Interview';
            default:
                return 'Unknown';
        }
    };

    const filteredApplications = applications.filter(app => {
        if (filter === 'all') return true;
        return app.status === filter;
    });

    const renderApplicationItem = ({ item }) => (
        <Card style={styles.card} onPress={() => navigation.navigate('JobDetail', { jobId: item.job.id })}>
            <Card.Content>
                <View style={styles.headerRow}>
                    <Avatar.Image
                        size={40}
                        source={{ uri: item.job.company.logo || 'https://via.placeholder.com/40' }}
                    />
                    <View style={styles.headerInfo}>
                        <Text style={styles.jobTitle}>{item.job.title}</Text>
                        <Text style={styles.companyName}>{item.job.company.name}</Text>
                    </View>
                    <Chip
                        style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20' }]}
                        textStyle={{ color: getStatusColor(item.status) }}
                        icon={() => <MaterialCommunityIcons name={getStatusIcon(item.status)} size={16} color={getStatusColor(item.status)} />}
                    >
                        {getStatusText(item.status)}
                    </Chip>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
                        <Text style={styles.detailText}>{item.job.location}</Text>
                    </View>

                    <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="calendar" size={16} color="#666" />
                        <Text style={styles.detailText}>
                            Applied on {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                {item.status === 'interview' && item.interview_date && (
                    <View style={styles.interviewInfo}>
                        <MaterialCommunityIcons name="calendar-clock" size={20} color={theme.colors.primary} />
                        <View style={styles.interviewDetails}>
                            <Text style={styles.interviewTitle}>Interview Scheduled</Text>
                            <Text style={styles.interviewDate}>
                                {new Date(item.interview_date).toLocaleString()}
                            </Text>
                        </View>
                    </View>
                )}

                {item.feedback && (
                    <View style={styles.feedbackContainer}>
                        <Text style={styles.feedbackLabel}>Feedback:</Text>
                        <Text style={styles.feedbackText}>{item.feedback}</Text>
                    </View>
                )}
            </Card.Content>

            <Card.Actions style={styles.cardActions}>
                <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('JobDetail', { jobId: item.job.id })}
                    style={styles.actionButton}
                >
                    View Job
                </Button>

                <Button
                    mode="contained"
                    onPress={() => {
                        // Create or open chat room with the recruiter
                        axios.post(`${API_URL}/api/chat-rooms/`, {
                            job: item.job.id,
                        }).then(response => {
                            navigation.navigate('ChatDetail', { roomId: response.data.id });
                        }).catch(error => {
                            console.error('Error creating chat room:', error);
                            alert('Failed to start chat. Please try again.');
                        });
                    }}
                    style={styles.actionButton}
                    icon="chat"
                >
                    Contact
                </Button>
            </Card.Actions>
        </Card>
    );

    return (
        <View style={styles.container}>
            <SegmentedButtons
                value={filter}
                onValueChange={setFilter}
                buttons={[
                    { value: 'all', label: 'All' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'interview', label: 'Interview' },
                    { value: 'accepted', label: 'Accepted' },
                ]}
                style={styles.filterButtons}
            />

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading applications...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={50} color="red" />
                    <Text style={styles.errorText}>{error}</Text>
                    <Button mode="contained" onPress={fetchApplications} style={styles.retryButton}>
                        Retry
                    </Button>
                </View>
            ) : filteredApplications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="file-document-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>No applications found</Text>
                    <Text style={styles.emptySubtext}>
                        {filter === 'all' ?
                            'You haven\'t applied to any jobs yet.' :
                            `You don't have any ${filter} applications.`}
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
                    data={filteredApplications}
                    renderItem={renderApplicationItem}
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
    filterButtons: {
        margin: 16,
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
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    companyName: {
        fontSize: 14,
        color: '#666',
    },
    statusChip: {
        height: 28,
    },
    divider: {
        marginVertical: 12,
    },
    detailsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
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
    interviewInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e3f2fd',
        padding: 10,
        borderRadius: 8,
        marginTop: 12,
    },
    interviewDetails: {
        marginLeft: 10,
    },
    interviewTitle: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    interviewDate: {
        fontSize: 12,
        color: '#666',
    },
    feedbackContainer: {
        marginTop: 12,
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    feedbackLabel: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    feedbackText: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    cardActions: {
        justifyContent: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    actionButton: {
        marginLeft: 8,
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

export default ApplicationsScreen;
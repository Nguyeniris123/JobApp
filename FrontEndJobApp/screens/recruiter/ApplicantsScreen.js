import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Avatar, Button, Card, Chip, Dialog, Divider, IconButton, Menu, Portal, Text, TextInput, useTheme } from 'react-native-paper';
import { API_URL } from '../../config.js';

const ApplicantsScreen = ({ navigation, route }) => {
    const { jobId } = route.params || {};
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [menuVisible, setMenuVisible] = useState({});
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [interviewDate, setInterviewDate] = useState('');
    const [filter, setFilter] = useState('all'); // all, pending, accepted, rejected, interview
    const theme = useTheme();

    useEffect(() => {
        fetchJobDetails();
        fetchApplications();
    }, [jobId]);

    const fetchJobDetails = async () => {
        if (!jobId) return;

        try {
            const response = await axios.get(`${API_URL}/api/jobs/${jobId}/`);
            setJob(response.data);

            // Set the title in the header
            navigation.setOptions({
                title: `Applicants for ${response.data.title}`,
            });
        } catch (error) {
            console.error('Error fetching job details:', error);
        }
    };

    const fetchApplications = async () => {
        try {
            setLoading(true);

            let url = `${API_URL}/api/applications/`;
            if (jobId) {
                url += `?job=${jobId}`;
            }

            const response = await axios.get(url);
            setApplications(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setError('Failed to load applications. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchApplications();
    };

    const toggleMenu = (applicationId) => {
        setMenuVisible({
            ...menuVisible,
            [applicationId]: !menuVisible[applicationId]
        });
    };

    const handleStatusChange = async (application, newStatus) => {
        toggleMenu(application.id);

        if (newStatus === 'interview') {
            // Show dialog for interview scheduling
            setSelectedApplication(application);
            setDialogVisible(true);
            return;
        }

        if (newStatus === 'rejected') {
            // Show dialog for rejection feedback
            setSelectedApplication(application);
            setDialogVisible(true);
            return;
        }

        try {
            await axios.patch(`${API_URL}/api/applications/${application.id}/`, {
                status: newStatus
            });

            // Update local state
            setApplications(applications.map(app =>
                app.id === application.id ? { ...app, status: newStatus } : app
            ));
        } catch (error) {
            console.error('Error updating application status:', error);
            alert('Failed to update application status. Please try again.');
        }
    };

    const submitFeedbackOrInterview = async () => {
        if (!selectedApplication) return;

        try {
            const data = {
                status: selectedApplication.status === 'pending' ? 'rejected' : 'interview',
            };

            if (data.status === 'rejected') {
                data.feedback = feedbackText;
            } else {
                data.interview_date = new Date(interviewDate).toISOString();
                data.feedback = feedbackText;
            }

            await axios.patch(`${API_URL}/api/applications/${selectedApplication.id}/`, data);

            // Update local state
            setApplications(applications.map(app =>
                app.id === selectedApplication.id ? { ...app, ...data } : app
            ));

            // Reset and close dialog
            setDialogVisible(false);
            setSelectedApplication(null);
            setFeedbackText('');
            setInterviewDate('');
        } catch (error) {
            console.error('Error updating application:', error);
            alert('Failed to update application. Please try again.');
        }
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
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.headerRow}>
                    <Avatar.Image
                        size={50}
                        source={{ uri: item.applicant.avatar || 'https://via.placeholder.com/50' }}
                    />
                    <View style={styles.applicantInfo}>
                        <Text style={styles.applicantName}>
                            {item.applicant.first_name} {item.applicant.last_name}
                        </Text>
                        <Text style={styles.applicantEmail}>{item.applicant.email}</Text>
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
                            icon="eye"
                            onPress={() => {
                                toggleMenu(item.id);
                                navigation.navigate('ApplicantProfile', { applicantId: item.applicant.id });
                            }}
                            title="View Profile"
                        />
                        <Menu.Item
                            icon="chat"
                            onPress={() => {
                                toggleMenu(item.id);
                                // Create or open chat room with the applicant
                                axios.post(`${API_URL}/api/chat-rooms/`, {
                                    job: item.job.id,
                                    participant: item.applicant.id
                                }).then(response => {
                                    navigation.navigate('ChatDetail', { roomId: response.data.id });
                                }).catch(error => {
                                    console.error('Error creating chat room:', error);
                                    alert('Failed to start chat. Please try again.');
                                });
                            }}
                            title="Message"
                        />
                        <Divider />
                        {item.status === 'pending' && (
                            <>
                                <Menu.Item
                                    icon="check-circle"
                                    onPress={() => handleStatusChange(item, 'accepted')}
                                    title="Accept"
                                />
                                <Menu.Item
                                    icon="calendar"
                                    onPress={() => {
                                        setSelectedApplication(item);
                                        handleStatusChange(item, 'interview');
                                    }}
                                    title="Schedule Interview"
                                />
                                <Menu.Item
                                    icon="close-circle"
                                    onPress={() => {
                                        setSelectedApplication(item);
                                        handleStatusChange(item, 'rejected');
                                    }}
                                    title="Reject"
                                />
                            </>
                        )}
                        {item.status === 'interview' && (
                            <Menu.Item
                                icon="check-circle"
                                onPress={() => handleStatusChange(item, 'accepted')}
                                title="Accept After Interview"
                            />
                        )}
                    </Menu>
                </View>

                <View style={styles.jobInfoRow}>
                    <Text style={styles.jobTitle}>
                        {!jobId && item.job ? item.job.title : ''}
                    </Text>
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
                        <MaterialCommunityIcons name="calendar" size={16} color="#666" />
                        <Text style={styles.detailText}>
                            Applied on {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                    </View>

                    {item.cv && (
                        <TouchableOpacity
                            style={styles.cvButton}
                            onPress={() => Linking.openURL(item.cv)}
                        >
                            <MaterialCommunityIcons name="file-pdf-box" size={16} color={theme.colors.primary} />
                            <Text style={[styles.detailText, { color: theme.colors.primary }]}>
                                View CV
                            </Text>
                        </TouchableOpacity>
                    )}
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
                    onPress={() => navigation.navigate('ApplicantProfile', { applicantId: item.applicant.id })}
                    style={styles.actionButton}
                >
                    View Profile
                </Button>

                <Button
                    mode="contained"
                    onPress={() => {
                        // Create or open chat room with the applicant
                        axios.post(`${API_URL}/api/chat-rooms/`, {
                            job: item.job.id,
                            participant: item.applicant.id
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
                    Message
                </Button>
            </Card.Actions>
        </Card>
    );

    return (
        <View style={styles.container}>
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
                    mode={filter === 'pending' ? 'contained' : 'outlined'}
                    onPress={() => setFilter('pending')}
                    style={styles.filterButton}
                    compact
                >
                    Pending
                </Button>
                <Button
                    mode={filter === 'interview' ? 'contained' : 'outlined'}
                    onPress={() => setFilter('interview')}
                    style={styles.filterButton}
                    compact
                >
                    Interview
                </Button>
                <Button
                    mode={filter === 'accepted' ? 'contained' : 'outlined'}
                    onPress={() => setFilter('accepted')}
                    style={styles.filterButton}
                    compact
                >
                    Accepted
                </Button>
            </View>

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
                    <MaterialCommunityIcons name="account-group-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>No applications found</Text>
                    <Text style={styles.emptySubtext}>
                        {filter !== 'all' ?
                            `No ${filter} applications available.` :
                            'You haven\'t received any applications yet.'}
                    </Text>
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

            <Portal>
                <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
                    <Dialog.Title>
                        {selectedApplication?.status === 'pending' ? 'Reject Application' : 'Schedule Interview'}
                    </Dialog.Title>
                    <Dialog.Content>
                        {selectedApplication?.status === 'pending' ? (
                            <TextInput
                                label="Feedback (Optional)"
                                mode="outlined"
                                value={feedbackText}
                                onChangeText={setFeedbackText}
                                multiline
                                numberOfLines={3}
                                placeholder="Provide feedback to the applicant"
                                style={styles.dialogInput}
                            />
                        ) : (
                            <>
                                <TextInput
                                    label="Interview Date and Time"
                                    mode="outlined"
                                    value={interviewDate}
                                    onChangeText={setInterviewDate}
                                    placeholder="YYYY-MM-DD HH:MM"
                                    style={styles.dialogInput}
                                />
                                <TextInput
                                    label="Additional Notes (Optional)"
                                    mode="outlined"
                                    value={feedbackText}
                                    onChangeText={setFeedbackText}
                                    multiline
                                    numberOfLines={3}
                                    placeholder="Any additional information for the interview"
                                    style={styles.dialogInput}
                                />
                            </>
                        )}
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
                        <Button onPress={submitFeedbackOrInterview}>
                            {selectedApplication?.status === 'pending' ? 'Reject' : 'Schedule'}
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    applicantInfo: {
        flex: 1,
        marginLeft: 12,
    },
    applicantName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    applicantEmail: {
        fontSize: 12,
        color: '#666',
    },
    jobInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    jobTitle: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    statusChip: {
        height: 28,
    },
    divider: {
        marginVertical: 12,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        marginLeft: 4,
        fontSize: 12,
        color: '#666',
    },
    cvButton: {
        flexDirection: 'row',
        alignItems: 'center',
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
    dialogInput: {
        marginBottom: 15,
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
    },
});

export default ApplicantsScreen;
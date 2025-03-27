import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useState } from 'react';
import { FlatList, Linking, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Button, Card, Chip, Dialog, Divider, Portal, Text, TextInput, useTheme } from 'react-native-paper';
import { API_URL } from '../../config.js';

const VerificationRequestsScreen = ({ navigation }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [filter, setFilter] = useState('pending'); // pending, approved, rejected
    const theme = useTheme();

    // useEffect(() => {
    //     fetchVerificationRequests();
    // }, []);

    // const fetchVerificationRequests = async () => {
    //     try {
    //         setLoading(true);
    //         const response = await axios.get(`${API_URL}/api/verification/`);
    //         setRequests(response.data);
    //         setError(null);
    //     } catch (error) {
    //         console.error('Error fetching verification requests:', error);
    //         setError('Failed to load verification requests. Please try again.');
    //     } finally {
    //         setLoading(false);
    //         setRefreshing(false);
    //     }
    // };

    const onRefresh = () => {
        setRefreshing(true);
        fetchVerificationRequests();
    };

    const handleApprove = (request) => {
        setSelectedRequest(request);
        setFeedbackText('');
        setDialogVisible(true);
    };

    const handleReject = (request) => {
        setSelectedRequest(request);
        setFeedbackText('');
        setDialogVisible(true);
    };

    const submitDecision = async (approved) => {
        if (!selectedRequest) return;

        try {
            await axios.patch(`${API_URL}/api/verification/${selectedRequest.id}/`, {
                status: approved ? 'approved' : 'rejected',
                admin_feedback: feedbackText,
            });

            // Update local state
            setRequests(requests.map(req =>
                req.id === selectedRequest.id ?
                    { ...req, status: approved ? 'approved' : 'rejected', admin_feedback: feedbackText } :
                    req
            ));

            // Reset and close dialog
            setDialogVisible(false);
            setSelectedRequest(null);
            setFeedbackText('');
        } catch (error) {
            console.error('Error updating verification request:', error);
            alert('Failed to update verification request. Please try again.');
        }
    };

    const filteredRequests = requests.filter(req => req.status === filter);

    const renderRequestItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.headerRow}>
                    <Avatar.Image
                        size={50}
                        source={{ uri: item.company.logo || 'https://via.placeholder.com/50' }}
                    />
                    <View style={styles.companyInfo}>
                        <Text style={styles.companyName}>{item.company.name}</Text>
                        <Text style={styles.companyDetails}>
                            {item.company.industry} • {item.company.size} employees
                        </Text>
                    </View>
                    <Chip
                        style={[
                            styles.statusChip,
                            {
                                backgroundColor: item.status === 'pending' ? '#FFF3E0' :
                                    item.status === 'approved' ? '#E8F5E9' : '#FFEBEE'
                            }
                        ]}
                        textStyle={{
                            color: item.status === 'pending' ? '#FB8C00' :
                                item.status === 'approved' ? '#4CAF50' : '#F44336'
                        }}
                    >
                        {item.status === 'pending' ? 'Pending' :
                            item.status === 'approved' ? 'Approved' : 'Rejected'}
                    </Chip>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.documentInfo}>
                    <MaterialCommunityIcons name="file-document-outline" size={24} color="#666" />
                    <View style={styles.documentDetails}>
                        <Text style={styles.documentType}>
                            {item.document_type === 'business_registration' ? 'Business Registration' :
                                item.document_type === 'tax_certificate' ? 'Tax Certificate' :
                                    'Verification Document'}
                        </Text>
                        <Text style={styles.documentName}>{item.document_name}</Text>
                        <Text style={styles.documentDate}>
                            Submitted on {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                    <Button
                        mode="outlined"
                        onPress={() => Linking.openURL(item.document)}
                        style={styles.viewButton}
                        icon="eye"
                        compact
                    >
                        View
                    </Button>
                </View>

                {item.admin_feedback && (
                    <View style={styles.feedbackContainer}>
                        <Text style={styles.feedbackLabel}>Admin Feedback:</Text>
                        <Text style={styles.feedbackText}>{item.admin_feedback}</Text>
                    </View>
                )}
            </Card.Content>

            {item.status === 'pending' && (
                <Card.Actions style={styles.cardActions}>
                    <Button
                        mode="outlined"
                        onPress={() => handleReject(item)}
                        style={[styles.actionButton, styles.rejectButton]}
                        icon="close"
                    >
                        Reject
                    </Button>

                    <Button
                        mode="contained"
                        onPress={() => handleApprove(item)}
                        style={styles.actionButton}
                        icon="check"
                    >
                        Approve
                    </Button>
                </Card.Actions>
            )}
        </Card>
    );

    return (
        <View style={styles.container}>
            <View style={styles.filterContainer}>
                <Button
                    mode={filter === 'pending' ? 'contained' : 'outlined'}
                    onPress={() => setFilter('pending')}
                    style={styles.filterButton}
                    compact
                >
                    Pending
                </Button>
                <Button
                    mode={filter === 'approved' ? 'contained' : 'outlined'}
                    onPress={() => setFilter('approved')}
                    style={styles.filterButton}
                    compact
                >
                    Approved
                </Button>
                <Button
                    mode={filter === 'rejected' ? 'contained' : 'outlined'}
                    onPress={() => setFilter('rejected')}
                    style={styles.filterButton}
                    compact
                >
                    Rejected
                </Button>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading verification requests...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={50} color="red" />
                    <Text style={styles.errorText}>{error}</Text>
                    <Button mode="contained" onPress={fetchVerificationRequests} style={styles.retryButton}>
                        Retry
                    </Button>
                </View>
            ) : filteredRequests.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="check-decagram-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>No {filter} verification requests</Text>
                    <Text style={styles.emptySubtext}>
                        {filter === 'pending' ?
                            'All verification requests have been processed.' :
                            `No ${filter} verification requests available.`}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredRequests}
                    renderItem={renderRequestItem}
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
                        {selectedRequest && selectedRequest.company ?
                            `${selectedRequest.status === 'pending' && selectedRequest.company.name} Verification` :
                            'Verification Request'}
                    </Dialog.Title>
                    <Dialog.Content>
                        <Text style={styles.dialogText}>
                            {selectedRequest?.status === 'pending' ?
                                'Are you sure you want to approve this company for verification?' :
                                'Please provide a reason for rejecting this verification request:'}
                        </Text>
                        <TextInput
                            label="Feedback"
                            mode="outlined"
                            value={feedbackText}
                            onChangeText={setFeedbackText}
                            multiline
                            numberOfLines={3}
                            placeholder={selectedRequest?.status === 'pending' ?
                                'Optional feedback for approval' :
                                'Reason for rejection (required)'}
                            style={styles.dialogInput}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
                        <Button
                            onPress={() => submitDecision(selectedRequest?.status === 'pending')}
                            disabled={selectedRequest?.status !== 'pending' && !feedbackText.trim()}
                        >
                            {selectedRequest?.status === 'pending' ? 'Approve' : 'Reject'}
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
    companyInfo: {
        flex: 1,
        marginLeft: 12,
    },
    companyName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    companyDetails: {
        fontSize: 12,
        color: '#666',
    },
    statusChip: {
        height: 28,
    },
    divider: {
        marginVertical: 12,
    },
    documentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    documentDetails: {
        flex: 1,
        marginLeft: 12,
    },
    documentType: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    documentName: {
        fontSize: 12,
        color: '#666',
    },
    documentDate: {
        fontSize: 12,
        color: '#999',
    },
    viewButton: {
        marginLeft: 8,
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
    rejectButton: {
        borderColor: '#F44336',
        color: '#F44336',
    },
    dialogText: {
        marginBottom: 15,
    },
    dialogInput: {
        marginBottom: 10,
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

export default VerificationRequestsScreen;
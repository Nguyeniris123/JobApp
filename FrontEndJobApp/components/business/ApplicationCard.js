import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Chip, Text } from 'react-native-paper';
import AppButton from '../ui/AppButton.jsx';
import AppDivider from '../ui/AppDivider.jsx';

const ApplicationCard = ({
    application,
    onPress,
    onViewJob,
    onContact,
    style,
}) => {
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

    return (
        <Card style={[styles.card, style]} onPress={onPress}>
            <Card.Content>
                <View style={styles.headerRow}>
                    <Avatar.Image
                        size={40}
                        source={{ uri: application.job?.company?.logo || 'https://via.placeholder.com/40' }}
                    />
                    <View style={styles.headerInfo}>
                        <Text style={styles.jobTitle}>{application.job?.title}</Text>
                        <Text style={styles.companyName}>{application.job?.company?.name}</Text>
                    </View>
                    <Chip
                        style={[
                            styles.statusChip,
                            { backgroundColor: getStatusColor(application.status) + '20' }
                        ]}
                        textStyle={{ color: getStatusColor(application.status) }}
                        icon={() => (
                            <MaterialCommunityIcons
                                name={getStatusIcon(application.status)}
                                size={16}
                                color={getStatusColor(application.status)}
                            />
                        )}
                    >
                        {getStatusText(application.status)}
                    </Chip>
                </View>

                <AppDivider />

                <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
                        <Text style={styles.detailText}>{application.job?.location}</Text>
                    </View>

                    <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="calendar" size={16} color="#666" />
                        <Text style={styles.detailText}>
                            Applied on {new Date(application.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                {application.status === 'interview' && application.interview_date && (
                    <View style={styles.interviewInfo}>
                        <MaterialCommunityIcons name="calendar-clock" size={20} color="#2196F3" />
                        <View style={styles.interviewDetails}>
                            <Text style={styles.interviewTitle}>Interview Scheduled</Text>
                            <Text style={styles.interviewDate}>
                                {new Date(application.interview_date).toLocaleString()}
                            </Text>
                        </View>
                    </View>
                )}

                {application.feedback && (
                    <View style={styles.feedbackContainer}>
                        <Text style={styles.feedbackLabel}>Feedback:</Text>
                        <Text style={styles.feedbackText}>{application.feedback}</Text>
                    </View>
                )}
            </Card.Content>

            <Card.Actions style={styles.cardActions}>
                <AppButton
                    mode="outlined"
                    onPress={onViewJob}
                    style={styles.actionButton}
                >
                    View Job
                </AppButton>

                <AppButton
                    mode="contained"
                    onPress={onContact}
                    icon="chat"
                    style={styles.actionButton}
                >
                    Contact
                </AppButton>
            </Card.Actions>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 8,
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
    detailsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
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
        paddingTop: 8,
    },
    actionButton: {
        marginLeft: 8,
    },
});

export default ApplicationCard;
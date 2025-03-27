import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { ActivityIndicator, Paragraph, Text, Title, useTheme } from 'react-native-paper';
import { API_URL } from '../../config.js';

import Button from '../../components/ui/AppButton.js';
import Card from '../../components/ui/AppCard.js';
import Divider from '../../components/ui/AppDivider.js';

const screenWidth = Dimensions.get('window').width;

const AdminDashboardScreen = ({ navigation }) => {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const theme = useTheme();

    // useEffect(() => {
    //     fetchStatistics();

    //     // Refresh statistics every 5 minutes
    //     const interval = setInterval(fetchStatistics, 300000);

    //     return () => clearInterval(interval);
    // }, []);

    // const fetchStatistics = async () => {
    //     try {
    //         setLoading(true);
    //         const response = await axios.get(`${API_URL}/api/statistics/`);
    //         setStatistics(response.data);
    //         setError(null);
    //     } catch (error) {
    //         console.error('Error fetching statistics:', error);
    //         setError('Failed to load statistics. Please try again.');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // if (loading) {
    //     return (
    //         <View style={styles.loadingContainer}>
    //             <ActivityIndicator size="large" color={theme.colors.primary} />
    //             <Text style={styles.loadingText}>Loading dashboard...</Text>
    //         </View>
    //     );
    // }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle-outline" size={50} color="red" />
                <Text style={styles.errorText}>{error}</Text>
                <Button mode="contained" onPress={fetchStatistics} style={styles.retryButton}>
                    Retry
                </Button>
            </View>
        );
    }

    const chartConfig = {
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        color: (opacity = 1) => `rgba(30, 136, 229, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
    };

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.summaryCard}>
                <Card.Content>
                    <Title style={styles.cardTitle}>Platform Summary</Title>

                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <MaterialCommunityIcons name="account" size={30} color={theme.colors.primary} />
                            <Text style={styles.statValue}>{statistics.total_users}</Text>
                            <Text style={styles.statLabel}>Total Users</Text>
                        </View>

                        <View style={styles.statItem}>
                            <MaterialCommunityIcons name="briefcase" size={30} color={theme.colors.primary} />
                            <Text style={styles.statValue}>{statistics.total_jobs}</Text>
                            <Text style={styles.statLabel}>Active Jobs</Text>
                        </View>

                        <View style={styles.statItem}>
                            <MaterialCommunityIcons name="domain" size={30} color={theme.colors.primary} />
                            <Text style={styles.statValue}>{statistics.total_companies}</Text>
                            <Text style={styles.statLabel}>Companies</Text>
                        </View>

                        <View style={styles.statItem}>
                            <MaterialCommunityIcons name="file-document" size={30} color={theme.colors.primary} />
                            <Text style={styles.statValue}>{statistics.total_applications}</Text>
                            <Text style={styles.statLabel}>Applications</Text>
                        </View>
                    </View>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.cardTitle}>User Growth</Title>
                    <Paragraph>New user registrations over time</Paragraph>

                    <LineChart
                        data={{
                            labels: statistics.user_growth.map(item => item.month),
                            datasets: [
                                {
                                    data: statistics.user_growth.map(item => item.count),
                                },
                            ],
                        }}
                        width={screenWidth - 40}
                        height={220}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                    />
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.cardTitle}>Job Categories</Title>
                    <Paragraph>Distribution of jobs by industry</Paragraph>

                    <PieChart
                        data={statistics.job_categories.map((item, index) => ({
                            name: item.category,
                            count: item.count,
                            color: [
                                '#1E88E5', '#43A047', '#FB8C00', '#E53935',
                                '#5E35B1', '#00ACC1', '#FFB300', '#8E24AA'
                            ][index % 8],
                            legendFontColor: '#7F7F7F',
                            legendFontSize: 12,
                        }))}
                        width={screenWidth - 40}
                        height={220}
                        chartConfig={chartConfig}
                        accessor="count"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        absolute
                    />
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.cardTitle}>Application Status</Title>
                    <Paragraph>Distribution of application statuses</Paragraph>

                    <BarChart
                        data={{
                            labels: ['Pending', 'Interview', 'Accepted', 'Rejected'],
                            datasets: [
                                {
                                    data: [
                                        statistics.application_status.pending || 0,
                                        statistics.application_status.interview || 0,
                                        statistics.application_status.accepted || 0,
                                        statistics.application_status.rejected || 0,
                                    ],
                                },
                            ],
                        }}
                        width={screenWidth - 40}
                        height={220}
                        chartConfig={chartConfig}
                        style={styles.chart}
                    />
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.cardTitle}>Pending Tasks</Title>

                    <View style={styles.taskItem}>
                        <MaterialCommunityIcons name="check-decagram" size={24} color="#FFA000" />
                        <View style={styles.taskInfo}>
                            <Text style={styles.taskTitle}>Verification Requests</Text>
                            <Text style={styles.taskCount}>{statistics.pending_verifications} pending</Text>
                        </View>
                        <Button
                            mode="contained"
                            onPress={() => navigation.navigate('VerificationRequests')}
                            style={styles.taskButton}
                            compact
                        >
                            Review
                        </Button>
                    </View>

                    <Divider style={styles.taskDivider} />

                    <View style={styles.taskItem}>
                        <MaterialCommunityIcons name="flag" size={24} color="#F44336" />
                        <View style={styles.taskInfo}>
                            <Text style={styles.taskTitle}>Reported Content</Text>
                            <Text style={styles.taskCount}>{statistics.reported_content} reports</Text>
                        </View>
                        <Button
                            mode="contained"
                            onPress={() => navigation.navigate('ReportedContent')}
                            style={styles.taskButton}
                            compact
                        >
                            Review
                        </Button>
                    </View>

                    <Divider style={styles.taskDivider} />

                    <View style={styles.taskItem}>
                        <MaterialCommunityIcons name="account-question" size={24} color="#2196F3" />
                        <View style={styles.taskInfo}>
                            <Text style={styles.taskTitle}>Support Tickets</Text>
                            <Text style={styles.taskCount}>{statistics.support_tickets} open</Text>
                        </View>
                        <Button
                            mode="contained"
                            onPress={() => navigation.navigate('SupportTickets')}
                            style={styles.taskButton}
                            compact
                        >
                            View
                        </Button>
                    </View>
                </Card.Content>
            </Card>

            <View style={styles.actionButtons}>
                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('ManageUsers')}
                    style={styles.actionButton}
                    icon="account-group"
                >
                    Manage Users
                </Button>

                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('ManageCompanies')}
                    style={styles.actionButton}
                    icon="domain"
                >
                    Manage Companies
                </Button>

                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('SystemSettings')}
                    style={styles.actionButton}
                    icon="cog"
                >
                    System Settings
                </Button>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    summaryCard: {
        margin: 10,
        elevation: 2,
    },
    card: {
        margin: 10,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        marginBottom: 10,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    statItem: {
        width: '48%',
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    taskInfo: {
        flex: 1,
        marginLeft: 12,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    taskCount: {
        fontSize: 12,
        color: '#666',
    },
    taskButton: {
        marginLeft: 8,
    },
    taskDivider: {
        marginVertical: 5,
    },
    actionButtons: {
        padding: 10,
        marginBottom: 20,
    },
    actionButton: {
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
});

export default AdminDashboardScreen;
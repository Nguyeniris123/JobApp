import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Avatar, Chip, Divider, Text, useTheme } from "react-native-paper";
import ScreenContainer from "../../components/layout/ScreenContainer";
import ScreenHeader from "../../components/layout/ScreenHeader";
import AppButton from "../../components/ui/AppButton";
import AppCard from "../../components/ui/AppCard";
import AppDivider from "../../components/ui/AppDivider";

const ApplicationsScreen = () => {
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterVisible, setFilterVisible] = useState(false);
    const [filters, setFilters] = useState({});

    const applications = [
        {
            "id": 1,
            "job": {
                "id": 101,
                "title": "Software Engineer",
                "company": { "name": "Tech Solutions Inc", "logo": "https://via.placeholder.com/40" },
                "location": "San Francisco, CA"
            },
            "status": "applied",
            "interview_date": null,
            "created_at": "2025-03-15T10:00:00Z"
        },
        {
            "id": 2,
            "job": {
                "id": 102,
                "title": "Product Manager",
                "company": { "name": "Innovate Ltd", "logo": "https://via.placeholder.com/40" },
                "location": "New York, NY"
            },
            "status": "interview",
            "interview_date": "2025-03-25T14:00:00Z",
            "created_at": "2025-03-18T12:30:00Z"
        },
        {
            "id": 3,
            "job": {
                "id": 103,
                "title": "Data Scientist",
                "company": { "name": "Data Insights Corp", "logo": "https://via.placeholder.com/40" },
                "location": "Seattle, WA"
            },
            "status": "offered",
            "interview_date": "2025-03-22T11:00:00Z",
            "created_at": "2025-03-19T09:45:00Z"
        },
        {
            "id": 4,
            "job": {
                "id": 104,
                "title": "UX Designer",
                "company": { "name": "Creative Designs", "logo": "https://via.placeholder.com/40" },
                "location": "Austin, TX"
            },
            "status": "rejected",
            "interview_date": "2025-03-24T15:30:00Z",
            "created_at": "2025-03-20T16:20:00Z"
        },
        {
            "id": 5,
            "job": {
                "id": 105,
                "title": "Marketing Analyst",
                "company": { "name": "Market Dynamics", "logo": "https://via.placeholder.com/40" },
                "location": "Chicago, IL"
            },
            "status": "applied",
            "interview_date": null,
            "created_at": "2025-03-21T13:10:00Z"
        },
        {
            "id": 6,
            "job": {
                "id": 106,
                "title": "Frontend Developer",
                "company": { "name": "WebCrafters", "logo": "https://via.placeholder.com/40" },
                "location": "Los Angeles, CA"
            },
            "status": "interview",
            "interview_date": "2025-03-27T10:00:00Z",
            "created_at": "2025-03-22T11:45:00Z"
        },
        {
            "id": 7,
            "job": {
                "id": 107,
                "title": "Backend Developer",
                "company": { "name": "ServerSide Solutions", "logo": "https://via.placeholder.com/40" },
                "location": "Boston, MA"
            },
            "status": "offered",
            "interview_date": "2025-03-26T14:30:00Z",
            "created_at": "2025-03-23T09:20:00Z"
        },
        {
            "id": 8,
            "job": {
                "id": 108,
                "title": "QA Engineer",
                "company": { "name": "Quality Assurance Labs", "logo": "https://via.placeholder.com/40" },
                "location": "Denver, CO"
            },
            "status": "rejected",
            "interview_date": "2025-03-28T16:00:00Z",
            "created_at": "2025-03-24T12:15:00Z"
        },
        {
            "id": 9,
            "job": {
                "id": 109,
                "title": "Sales Representative",
                "company": { "name": "SalesForce Inc", "logo": "https://via.placeholder.com/40" },
                "location": "Miami, FL"
            },
            "status": "applied",
            "interview_date": null,
            "created_at": "2025-03-25T10:30:00Z"
        },
        {
            "id": 10,
            "job": {
                "id": 110,
                "title": "Business Analyst",
                "company": { "name": "Business Logic Ltd", "logo": "https://via.placeholder.com/40" },
                "location": "Washington, D.C."
            },
            "status": "interview",
            "interview_date": "2025-03-29T13:45:00Z",
            "created_at": "2025-03-26T15:00:00Z"
        }
    ];

    
    const filteredApplications = applications.filter(app =>
        app.job.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#FFA000';
            case 'accepted': return '#4CAF50';
            case 'rejected': return '#F44336';
            case 'interview': return '#2196F3';
            default: return '#9E9E9E';
        }
    };

    const renderApplicationItem = ({ item }) => (
        <AppCard style={styles.card}>
            <View style={styles.headerRow}>
                <Avatar.Image size={40} source={{ uri: item.job.company.logo }} />
                <View style={styles.headerInfo}>
                    <Text style={styles.jobTitle}>{item.job.title}</Text>
                    <Text style={styles.companyName}>{item.job.company.name}</Text>
                </View>
                <Chip
                    style={{ backgroundColor: getStatusColor(item.status) + '20' }}
                    textStyle={{ color: getStatusColor(item.status) }}
                    icon={() => <MaterialCommunityIcons name="check-circle-outline" size={16} color={getStatusColor(item.status)} />}
                >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Chip>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.detailsRow}>
                <Text style={styles.detailText}>📍 {item.job.location}</Text>
                <Text style={styles.detailText}>📅 Applied on {item.appliedDate}</Text>
            </View>
            <AppDivider />
            <View style={styles.buttonRow}>
                <AppButton mode="outlined" onPress={() => navigation.navigate('JobDetail')}>View Job</AppButton>
                <AppButton mode="contained" icon="chat" onPress={() => {}}>Contact</AppButton>
            </View>
        </AppCard>
    );

    return (
        <ScreenContainer>
            {/* Thêm tìm kiếm vào header */}
            <ScreenHeader 
                title="My Applications"
                searchPlaceholder="Search jobs..."
                onSearchChange={setSearchQuery}
            />

            <FlatList
                data={filteredApplications}
                renderItem={renderApplicationItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
            />
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    listContainer: {
        padding: 16,
    },
    card: {
        marginBottom: 16,
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
    divider: {
        marginVertical: 12,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailText: {
        fontSize: 12,
        color: '#666',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
});

export default ApplicationsScreen;
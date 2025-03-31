import { useRoute } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import { JobContext } from '../../contexts/JobContext';

const JobDetailScreen = () => {
    const route = useRoute();
    const { jobId } = route.params;
    const [jobDetail, setJobDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const { fetchJobById } = useContext(JobContext);
    
    useEffect(() => {
        const loadJobDetail = async () => {
            try {
                console.log("Đang tải chi tiết công việc với ID:", jobId);
                const data = await fetchJobById(jobId);
                console.log("Đã nhận được dữ liệu chi tiết:", data);
                setJobDetail(data);
            } catch (error) {
                console.error('Error fetching job details:', error);
            } finally {
                setLoading(false);
            }
        };
        loadJobDetail();
    }, [jobId, fetchJobById]);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (!jobDetail) {
        return <Text style={styles.errorText}>Không tìm thấy công việc</Text>;
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{jobDetail.title}</Text>
            <Text style={styles.company}>{jobDetail.company}</Text>
            <Text style={styles.description}>{jobDetail.description}</Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    company: {
        fontSize: 18,
        fontStyle: 'italic',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
    },
    errorText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 18,
        color: 'red',
    },
});

export default JobDetailScreen;

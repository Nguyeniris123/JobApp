import { useRoute } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { JobContext } from '../../contexts/JobContext';

const JobDetailScreen = () => {
    const route = useRoute();
    const { jobId } = route.params;
    const [jobDetail, setJobDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const { fetchJobById } = useContext(JobContext);

    const loadJobDetail = async () => {
        if (!jobId) return;
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

    useEffect(() => {
        loadJobDetail();
    }, [jobId]);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (!jobDetail) {
        return <Text style={styles.errorText}>Không tìm thấy công việc</Text>;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>{jobDetail.title}</Text>
                <View style={styles.separator} />

                {/* Company Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        <Icon name="business" size={24} color="#2196F3" /> Thông tin công ty
                    </Text>
                    <Text style={styles.company}>{jobDetail.company.name}</Text>
                    <View style={styles.infoRow}>
                        <Icon name="receipt" size={20} color="#666" />
                        <Text style={styles.companyDetail}>Mã số thuế: {jobDetail.company.tax_code}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon name="location-on" size={20} color="#666" />
                        <Text style={styles.companyDetail}>{jobDetail.company.location}</Text>
                    </View>
                    <Text style={styles.companyDetail}>{jobDetail.company.description}</Text>
                    <Text style={[styles.verificationStatus,
                    jobDetail.company.is_verified ? styles.verified : styles.unverified]}>
                        <Icon name={jobDetail.company.is_verified ? "verified" : "error-outline"}
                            size={16} color={jobDetail.company.is_verified ? "#4CAF50" : "#FFA000"} />
                        {" "}{jobDetail.company.is_verified ? "Đã xác thực" : "Chưa xác thực"}
                    </Text>
                </View>

                <View style={styles.separator} />

                {/* Job Details Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        <Icon name="work" size={24} color="#2196F3" /> Chi tiết công việc
                    </Text>
                    <View style={styles.infoRow}>
                        <Icon name="school" size={20} color="#666" />
                        <Text style={styles.jobDetail}>Chuyên môn: {jobDetail.specialized}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon name="attach-money" size={20} color="#666" />
                        <Text style={styles.jobDetail}>Lương: {jobDetail.salary} VNĐ</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon name="access-time" size={20} color="#666" />
                        <Text style={styles.jobDetail}>Thời gian: {jobDetail.working_hours}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon name="place" size={20} color="#666" />
                        <Text style={styles.jobDetail}>Địa điểm: {jobDetail.location}</Text>
                    </View>
                    <View style={styles.descriptionBox}>
                        <Text style={styles.description}>{jobDetail.description}</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    card: {
        margin: 16,
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1976D2',
        marginBottom: 8,
    },
    section: {
        marginVertical: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2196F3',
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    separator: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 12,
    },
    company: {
        fontSize: 18,
        fontWeight: '500',
        color: '#424242',
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    companyDetail: {
        fontSize: 16,
        color: '#616161',
        flex: 1,
    },
    jobDetail: {
        fontSize: 16,
        color: '#616161',
        flex: 1,
    },
    descriptionBox: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
    },
    description: {
        fontSize: 16,
        color: '#424242',
        lineHeight: 24,
    },
    verificationStatus: {
        fontSize: 14,
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    verified: {
        color: '#4CAF50',
    },
    unverified: {
        color: '#FFA000',
    },
    errorText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 18,
        color: 'red',
    },
});

export default JobDetailScreen;

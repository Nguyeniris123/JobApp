import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CompanyContext } from '../../contexts/CompanyContext';
import { JobContext } from '../../contexts/JobContext';

const JobDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { jobId } = route.params;
    const { followCompany, unfollowCompany, followedCompanies, fetchFollowedCompanies } = useContext(CompanyContext);
    const [jobDetail, setJobDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const { fetchJobById } = useContext(JobContext);
    const [isFollowing, setIsFollowing] = useState(false);

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
        const init = async () => {
            await loadJobDetail();
            if (jobDetail && jobDetail.company) {
                const isFollowed = followedCompanies.some(
                    follow => follow.recruiter_company.id === jobDetail.company.id
                );
                setIsFollowing(isFollowed);
            }
        };
        init();
    }, [jobId, followedCompanies]);

    const handleFollow = async () => {
        try {
            if (isFollowing) {
                await unfollowCompany(jobDetail.company.id);
            } else {
                await followCompany(jobDetail.company.id);
            }
            // Reload followed companies
            await fetchFollowedCompanies();
        } catch (error) {
            console.error('Error handling follow:', error);
        }
    };

    const handleApply = () => {
        navigation.navigate('Apply', { jobId: jobDetail.id });
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (!jobDetail) {
        return <Text style={styles.errorText}>Không tìm thấy công việc</Text>;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{jobDetail.title}</Text>
                <View style={styles.companyHeaderInfo}>
                    <Text style={styles.company}>{jobDetail.company.name}</Text>
                    <Text style={[styles.badge, 
                        jobDetail.company.is_verified ? styles.verifiedBadge : styles.unverifiedBadge]}>
                        <Icon name={jobDetail.company.is_verified ? "verified" : "error-outline"}
                            size={16} color="#FFF" />
                        {" "}{jobDetail.company.is_verified ? "Đã xác thực" : "Chưa xác thực"}
                    </Text>
                </View>
            </View>

            <View style={styles.content}>
                {/* Company Images */}
                {jobDetail.company.images && jobDetail.company.images.length > 0 ? (
                    <ScrollView 
                        horizontal 
                        style={styles.imageCarousel}
                        showsHorizontalScrollIndicator={false}>
                        {jobDetail.company.images.map((image, index) => (
                            <Image
                                key={index}
                                source={{ uri: image }}
                                style={styles.companyImage}
                            />
                        ))}
                    </ScrollView>
                ) : (
                    <View style={styles.noImageContainer}>
                        <Icon name="image-not-supported" size={40} color="#ccc" />
                        <Text style={styles.noImageText}>Chưa có hình ảnh</Text>
                    </View>
                )}

                {/* Quick Info Cards */}
                <View style={styles.quickInfoContainer}>
                    <View style={styles.quickInfoCard}>
                        <Icon name="attach-money" size={24} color="#2196F3" />
                        <Text style={styles.quickInfoValue}>{jobDetail.salary}</Text>
                        <Text style={styles.quickInfoLabel}>Lương</Text>
                    </View>
                    <View style={styles.quickInfoCard}>
                        <Icon name="access-time" size={24} color="#2196F3" />
                        <Text style={styles.quickInfoValue}>{jobDetail.working_hours}</Text>
                        <Text style={styles.quickInfoLabel}>Giờ làm</Text>
                    </View>
                    <View style={styles.quickInfoCard}>
                        <Icon name="place" size={24} color="#2196F3" />
                        <Text style={styles.quickInfoValue}>Xem địa chỉ</Text>
                        <Text style={styles.quickInfoLabel}>{jobDetail.location}</Text>
                    </View>
                </View>

                {/* Company Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thông tin công ty</Text>
                    <View style={styles.companyDetails}>
                        <View style={styles.infoRow}>
                            <Icon name="receipt" size={20} color="#666" />
                            <Text style={styles.companyDetail}>MST: {jobDetail.company.tax_code}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Icon name="location-on" size={20} color="#666" />
                            <Text style={styles.companyDetail}>{jobDetail.company.location}</Text>
                        </View>
                        <Text style={styles.companyDescription}>{jobDetail.company.description}</Text>
                    </View>
                </View>

                {/* Job Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chi tiết công việc</Text>
                    <View style={styles.jobDetails}>
                        <View style={styles.infoRow}>
                            <Icon name="school" size={20} color="#666" />
                            <Text style={styles.jobDetail}>Chuyên môn: {jobDetail.specialized}</Text>
                        </View>
                        <View style={styles.descriptionBox}>
                            <Text style={styles.description}>{jobDetail.description}</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={[styles.button, styles.applyButton]}
                        onPress={handleApply}>
                        <Icon name="send" size={20} color="#FFF" />
                        <Text style={styles.buttonText}>Ứng tuyển ngay</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.button, isFollowing ? styles.followingButton : styles.followButton]}
                        onPress={handleFollow}>
                        <Icon name={isFollowing ? "favorite" : "favorite-border"} size={20} color="#FFF" />
                        <Text style={styles.buttonText}>
                            {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 8,
    },
    companyHeaderInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    verifiedBadge: {
        backgroundColor: '#4CAF50',
    },
    unverifiedBadge: {
        backgroundColor: '#FFA000',
    },
    quickInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 16,
    },
    quickInfoCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 4,
        elevation: 2,
    },
    quickInfoValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#212529',
        marginTop: 4,
    },
    quickInfoLabel: {
        fontSize: 12,
        color: '#6c757d',
        marginTop: 2,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 16,
    },
    imageCarousel: {
        marginVertical: 16,
    },
    companyImage: {
        width: 200,
        height: 150,
        marginRight: 12,
        borderRadius: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        gap: 8,
    },
    applyButton: {
        backgroundColor: '#2196F3',
        flex: 2,
    },
    followButton: {
        backgroundColor: '#FFA000',
        flex: 1,
    },
    followingButton: {
        backgroundColor: '#4CAF50',
        flex: 1,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
        marginBottom: 32,
    },
    errorText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 18,
        color: 'red',
    },
    noImageContainer: {
        height: 150,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginVertical: 10,
    },
    noImageText: {
        color: '#999',
        marginTop: 8,
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
});

export default JobDetailScreen;

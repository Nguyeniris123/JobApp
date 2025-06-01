import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ReviewCard } from '../../components/ui/ReviewCard';
import { AuthContext } from '../../contexts/AuthContext';
import { CompanyContext } from '../../contexts/CompanyContext';
import { JobContext } from '../../contexts/JobContext';
import { ReviewContext } from '../../contexts/ReviewContext';

const JobDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { jobId } = route.params;
    const { followCompany, unfollowCompany, followedCompanies, fetchFollowedCompanies, getFollowedCompanyById } = useContext(CompanyContext);
    const [jobDetail, setJobDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const { fetchJobById } = useContext(JobContext);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [followRecord, setFollowRecord] = useState(null);
    const { user } = useContext(AuthContext);
    
    // Review state
    const [showReviews, setShowReviews] = useState(false);
    
    // Sử dụng hook để truy cập review context
    const { 
        recruiterReviews,
        fetchRecruiterReviews 
    } = useContext(ReviewContext);

    const loadJobDetail = async () => {
        if (!jobId) return;
        
        try {
            setLoading(true);
            const data = await fetchJobById(jobId);
            setJobDetail(data);
            
            // Fetch reviews for this job
            await fetchRecruiterReviews();
        } catch (error) {
            console.error("Error loading job details:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle follow/unfollow
    const handleFollow = async () => {
        if (!companyExists) return;
        
        try {
            setFollowLoading(true);
            if (isFollowing) {
                // Unfollow
                if (followRecord) {
                    await unfollowCompany(followRecord.id);
                }
            } else {
                // Follow
                await followCompany(jobDetail.company.id);
            }
            // Refresh follow status
            await fetchFollowedCompanies();
        } catch (error) {
            console.error("Error following/unfollowing company:", error);
        } finally {
            setFollowLoading(false);
        }
    };

    // Khi vào màn hình này, cần tải dữ liệu công việc và kiểm tra trạng thái follow
    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                await loadJobDetail();
                await fetchFollowedCompanies();
            };
            loadData();
        }, [jobId])
    );
    
    // Kiểm tra trạng thái follow mỗi khi danh sách công ty theo dõi thay đổi
    useEffect(() => {
        if (jobDetail && jobDetail.company && followedCompanies.length > 0) {
            const foundCompany = getFollowedCompanyById(jobDetail.company.id);
            setIsFollowing(!!foundCompany);
            setFollowRecord(foundCompany);
        } else {
            setIsFollowing(false);
            setFollowRecord(null);
        }
    }, [jobDetail, followedCompanies]);

    // Get reviews for this company instead of just for this job
    const getReviewsForThisCompany = () => {
        if (!jobDetail || !companyExists || !recruiterReviews) return [];
        
        // Lọc tất cả đánh giá cho công ty này dựa vào company_id
        const companyId = jobDetail.company.id;
        console.log('Getting reviews for company ID:', companyId);
        console.log('All reviews:', recruiterReviews);
        
        return recruiterReviews.filter(review => {
            // Kiểm tra review có company_id khớp với công ty hiện tại không
            const isForThisCompany = review.company_id === companyId || review.company === companyId;
            console.log(`Review ${review.id} for company ${review.company_id || review.company}, matches: ${isForThisCompany}`);
            return isForThisCompany;
        });
    };

    // Navigate to review creation screen
    const navigateToCreateReview = () => {
        if (!jobDetail) {
            alert('Không thể đánh giá công việc này do thiếu thông tin.');
            return;
        }
        
        if (!companyExists) {
            alert('Không thể đánh giá công việc này do không tìm thấy thông tin công ty.');
            return;
        }
        
        console.log('Navigating to review screen with company:', jobDetail.company);
        console.log('Company ID:', jobDetail.company?.id);
        
        navigation.navigate('CreateReview', { 
            jobId: jobDetail.id,
            jobTitle: jobDetail.title,
            companyId: jobDetail.company.id
        });
    };
    
    const handleApply = () => {
        if (!jobDetail) return;
        navigation.navigate('ApplyScreen', { jobId: jobDetail.id });
    };

    // Hàm xử lý hình ảnh để tránh lỗi khi URI không đúng định dạng
    const getImageSource = (imageUrl) => {
        if (!imageUrl) return null;
        
        if (typeof imageUrl === 'string') {
            return { uri: imageUrl };
        }
        
        if (typeof imageUrl === 'object' && imageUrl.uri) {
            return { uri: imageUrl.uri };
        }
        
        return null;
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (!jobDetail) {
        return <Text style={styles.errorText}>Không tìm thấy công việc</Text>;
    }

    // Ensure company exists before rendering company-related information
    const companyExists = jobDetail && jobDetail.company;
    const jobReviews = getReviewsForThisCompany();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{jobDetail.title}</Text>
                <View style={styles.companyHeaderInfo}>
                    <Text style={styles.company}>{companyExists ? jobDetail.company.name : 'Không có thông tin công ty'}</Text>
                    {companyExists && (
                        <Text style={[styles.badge, 
                            jobDetail.company.is_verified ? styles.verifiedBadge : styles.unverifiedBadge]}>
                            <Icon name={jobDetail.company.is_verified ? "verified" : "error-outline"}
                                size={16} color="#FFF" />
                            {" "}{jobDetail.company.is_verified ? "Đã xác thực" : "Chưa xác thực"}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.content}>
                {/* Company Images */}
                {companyExists && jobDetail.company.images && jobDetail.company.images.length > 0 ? (
                    <ScrollView 
                        horizontal 
                        style={styles.imageCarousel}
                        showsHorizontalScrollIndicator={false}>
                        {jobDetail.company.images.map((image, index) => {
                            const source = getImageSource(image);
                            if (!source) return null;
                            
                            return (
                                <Image
                                    key={index}
                                    source={source}
                                    style={styles.companyImage}
                                    defaultSource={require('../../assets/logo.png')}
                                />
                            );
                        })}
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
                {companyExists ? (
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
                ) : (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Thông tin công ty</Text>
                        <Text>Không có thông tin công ty</Text>
                    </View>
                )}

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

                {/* Reviews section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Đánh giá & Nhận xét</Text>
                        <TouchableOpacity onPress={() => setShowReviews(!showReviews)}>
                            <Text style={styles.seeAllText}>
                                {showReviews ? 'Thu gọn' : 'Xem tất cả'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    
                    {showReviews ? (
                        <View style={styles.reviewsContainer}>
                            {/* List of reviews */}
                            {jobReviews.length > 0 ? (
                                <View style={styles.reviewsList}>
                                    {jobReviews.map((review) => (
                                        <ReviewCard 
                                            key={review.id}
                                            review={review}
                                            style={styles.reviewCard} 
                                        />
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.noReviewsText}>
                                    Chưa có đánh giá nào cho công việc này. Hãy là người đầu tiên đánh giá!
                                </Text>
                            )}
                        </View>
                    ) : jobReviews.length > 0 ? (
                        <View style={styles.reviewPreview}>
                            <ReviewCard 
                                review={jobReviews[0]}
                                style={styles.reviewCard} 
                            />
                            {jobReviews.length > 1 && (
                                <Text style={styles.moreReviewsText}>
                                    + {jobReviews.length - 1} đánh giá khác
                                </Text>
                            )}
                        </View>
                    ) : (
                        <Text style={styles.noReviewsText}>
                            Chưa có đánh giá nào cho công việc này. Hãy là người đầu tiên đánh giá!
                        </Text>
                    )}
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={[styles.button, styles.applyButton]}
                        onPress={handleApply}>
                        <Icon name="send" size={20} color="#FFF" />
                        <Text style={styles.buttonText}>Ứng tuyển ngay</Text>
                    </TouchableOpacity>
                    {companyExists && (
                        <TouchableOpacity 
                            style={[styles.button, isFollowing ? styles.followingButton : styles.followButton]}
                            onPress={handleFollow}
                            disabled={followLoading}>
                            {followLoading ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <>
                                    <Icon 
                                        name={isFollowing ? "favorite" : "favorite-border"} 
                                        size={20} 
                                        color="#FFF" 
                                    />
                                    <Text style={styles.buttonText}>
                                        {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    seeAllText: {
        color: '#2196F3',
        fontSize: 14,
        fontWeight: '500',
    },
    reviewsContainer: {
        marginVertical: 8,
    },
    reviewsList: {
        marginTop: 12,
    },
    reviewCard: {
        marginBottom: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
        padding: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#2196F3',
    },
    addReviewButton: {
        marginBottom: 16,
        borderColor: '#2196F3',
    },
    noReviewsText: {
        fontSize: 14,
        color: '#6c757d',
        fontStyle: 'italic',
        textAlign: 'center',
        marginVertical: 16,
    },
    reviewPreview: {
        marginVertical: 8,
    },
    moreReviewsText: {
        fontSize: 14,
        color: '#2196F3',
        textAlign: 'center',
        marginTop: 8,
        fontWeight: '500',
    },
});

export default JobDetailScreen;

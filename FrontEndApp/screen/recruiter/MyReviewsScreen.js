import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Avatar, Button, Card, FAB, Paragraph, Text } from 'react-native-paper';
import { deleteReview as deleteReviewApi, fetchCandidateReviews, fetchRecruiterReviews } from '../../services/reviewService';

const MyReviewsScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('candidate'); // 'candidate' or 'job'
    const [expandedReview, setExpandedReview] = useState(null);
    const [candidateReviews, setCandidateReviews] = useState([]);
    const [recruiterReviews, setRecruiterReviews] = useState([]);
    const [loading, setLoading] = useState(false);

    // Lấy user từ AsyncStorage
    React.useEffect(() => {
        AsyncStorage.getItem('user').then(data => {
            if (data) setUser(JSON.parse(data));
        });
    }, []);

    // Lấy các đánh giá mà nhà tuyển dụng đã viết cho ứng viên
    const candidateReviewsByMe = candidateReviews.filter(review =>
        review.application && review.reviewer_id === user?.id
    );

    // Lấy các đánh giá của công ty/công việc (từ ứng viên)
    const jobReviewsForMe = recruiterReviews.filter(review =>
        review.job && review.job_detail?.recruiter_id === user?.id
    );

    // Format ngày tháng
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Tải dữ liệu khi màn hình được focus
    useFocusEffect(
        useCallback(() => {
            loadReviews();
        }, [user])
    );

    // Tải đánh giá từ API
    const loadReviews = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [cReviews, rReviews] = await Promise.all([
                fetchCandidateReviews(user.id),
                fetchRecruiterReviews(user.id)
            ]);
            setCandidateReviews(cReviews);
            setRecruiterReviews(rReviews);
        } catch (e) {
            // handle error
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Mở rộng/thu gọn review
    const toggleExpandReview = (id) => {
        setExpandedReview(expandedReview === id ? null : id);
    };

    // Xóa đánh giá
    const handleDeleteReview = async (reviewId, type) => {
        setLoading(true);
        try {
            await deleteReviewApi(reviewId, type);
            loadReviews();
        } catch (e) {
            // handle error
        } finally {
            setLoading(false);
        }
    };

    // Render sao đánh giá
    const renderStars = (rating) => (
        <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
                <MaterialCommunityIcons
                    key={star}
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={18}
                    color={star <= rating ? '#FFC107' : '#BDBDBD'}
                    style={{ marginRight: 2 }}
                />
            ))}
        </View>
    );

    // Render từng đánh giá
    const renderReviewItem = ({ item }) => (
        <Card style={styles.reviewCard}>
            <Card.Content>
                <View style={styles.reviewHeader}>
                    <Avatar.Text label={item.reviewer_name?.[0] || '?'} size={40} style={styles.avatar} />
                    <View style={styles.headerInfo}>
                        <Text style={styles.reviewTitle}>{item.reviewer_name}</Text>
                        <Text style={styles.reviewSubtitle}>{item.job_title || item.application_title || ''}</Text>
                        <Text style={styles.reviewDate}>{formatDate(item.created_date)}</Text>
                    </View>
                    <View style={styles.ratingContainer}>{renderStars(item.rating)}</View>
                </View>
                <TouchableOpacity style={styles.expandTouchable} onPress={() => toggleExpandReview(item.id)}>
                    <Paragraph numberOfLines={expandedReview === item.id ? undefined : 2} style={styles.commentPreview}>
                        {item.comment}
                    </Paragraph>
                    {item.comment && (
                        <Text style={styles.expandText}>{expandedReview === item.id ? 'Thu gọn' : 'Xem thêm'}</Text>
                    )}
                </TouchableOpacity>
                <View style={styles.actionButtons}>
                    <Button mode="outlined" style={styles.deleteButton} onPress={() => handleDeleteReview(item.id, activeTab === 'candidate' ? 'candidate' : 'job')}>Xóa</Button>
                </View>
            </Card.Content>
        </Card>
    );

    // Render danh sách đánh giá dựa trên tab đang active
    const renderReviewsList = () => {
        const reviewsToShow = activeTab === 'candidate' ? candidateReviewsByMe : jobReviewsForMe;
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1976D2" />
                </View>
            );
        }
        if (reviewsToShow.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Chưa có đánh giá nào.</Text>
                </View>
            );
        }
        return (
            <FlatList
                data={reviewsToShow}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderReviewItem}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadReviews} />}
            />
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1976D2', '#1E88E5', '#2196F3']}
                style={styles.header}
            >
                <Text style={styles.screenTitle}>Đánh giá & Nhận xét</Text>
                <Text style={styles.screenSubtitle}>
                    {activeTab === 'candidate' ? 'Đánh giá của tôi về ứng viên' : 'Nhận xét của ứng viên về công việc'}
                </Text>
            </LinearGradient>

            <View style={styles.tabContainer}>
                <Button
                    mode={activeTab === 'candidate' ? 'contained' : 'outlined'}
                    onPress={() => setActiveTab('candidate')}
                    style={[styles.tabButton, activeTab === 'candidate' && styles.activeTabButton]}
                >
                    Đánh giá của tôi ({candidateReviewsByMe.length})
                </Button>
                <Button
                    mode={activeTab === 'job' ? 'contained' : 'outlined'}
                    onPress={() => setActiveTab('job')}
                    style={[styles.tabButton, activeTab === 'job' && styles.activeTabButton]}
                >
                    Nhận xét về công việc ({jobReviewsForMe.length})
                </Button>
            </View>

            {renderReviewsList()}

            {activeTab === 'candidate' && (
                <FAB
                    style={styles.fab}
                    icon="plus"
                    label="Đánh giá mới"
                    onPress={() => navigation.navigate('ApplicationListScreen')}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        padding: 20,
        paddingTop: 50,
        paddingBottom: 25,
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    screenSubtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    tabContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#FFFFFF',
        elevation: 2,
    },
    tabButton: {
        flex: 1,
        marginHorizontal: 4,
    },
    activeTabButton: {
        backgroundColor: '#1976D2',
    },
    listContent: {
        padding: 16,
        paddingBottom: 80, // Extra space for FAB
    },
    reviewCard: {
        marginBottom: 16,
        elevation: 2,
        borderRadius: 10,
    },
    reviewHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    avatar: {
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    reviewTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    reviewSubtitle: {
        fontSize: 14,
        color: '#616161',
    },
    reviewDate: {
        fontSize: 12,
        color: '#757575',
        marginTop: 4,
    },
    ratingContainer: {
        alignItems: 'flex-end',
        paddingTop: 4,
    },
    starsContainer: {
        flexDirection: 'row',
    },
    expandTouchable: {
        paddingVertical: 8,
    },
    commentPreview: {
        fontSize: 14,
        lineHeight: 20,
    },
    expandText: {
        color: '#1976D2',
        marginTop: 4,
        fontSize: 12,
        fontWeight: '500',
    },
    tagsSection: {
        marginTop: 12,
        marginBottom: 8,
    },
    tagSectionTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
        color: '#424242',
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    strengthChip: {
        margin: 2,
        backgroundColor: '#E8F5E9',
    },
    weaknessChip: {
        margin: 2,
        backgroundColor: '#FFEBEE',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    editButton: {
        marginRight: 8,
        borderColor: '#1976D2',
    },
    deleteButton: {
        borderColor: '#D32F2F',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    emptyActionButton: {
        marginTop: 16,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#1976D2',
    }
});

export default MyReviewsScreen;
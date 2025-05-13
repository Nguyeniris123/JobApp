import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useContext, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Avatar, Button, Card, Chip, FAB, Paragraph, Text, Title } from 'react-native-paper';
import { AuthContext } from '../../contexts/AuthContext';
import { useReview } from '../../hooks/useReview';

const MyReviewsScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('candidate'); // 'candidate' or 'job'
    const [expandedReview, setExpandedReview] = useState(null);

    // Sử dụng custom hook để truy cập review context
    const {
        candidateReviews,
        recruiterReviews,
        fetchCandidateReviews,
        fetchRecruiterReviews,
        deleteReview,
        loading
    } = useReview();

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
        if (!dateString) return "Không xác định";
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Tải dữ liệu khi màn hình được focus
    useFocusEffect(
        useCallback(() => {
            loadReviews();
        }, [])
    );

    // Tải đánh giá từ API
    const loadReviews = async () => {
        setRefreshing(true);
        await Promise.all([
            fetchCandidateReviews(),
            fetchRecruiterReviews()
        ]);
        setRefreshing(false);
    };

    // Mở rộng/thu gọn review
    const toggleExpandReview = (id) => {
        if (expandedReview === id) {
            setExpandedReview(null);
        } else {
            setExpandedReview(id);
        }
    };

    // Xóa đánh giá
    const handleDeleteReview = async (reviewId) => {
        try {
            const result = await deleteReview(reviewId);
            if (result.success) {
                // Tải lại đánh giá sau khi xóa
                loadReviews();
            }
        } catch (error) {
            console.error("Error deleting review:", error);
        }
    };

    // Render sao đánh giá
    const renderStars = (rating) => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <MaterialCommunityIcons
                        key={star}
                        name={star <= rating ? "star" : "star-outline"}
                        size={18}
                        color={star <= rating ? "#FFC107" : "#BDBDBD"}
                        style={{ marginRight: 2 }}
                    />
                ))}
            </View>
        );
    };

    // Render từng đánh giá
    const renderReviewItem = ({ item }) => {
        const isExpanded = expandedReview === item.id;

        // Thông tin hiển thị tùy theo tab đang active
        const displayTitle = activeTab === 'candidate'
            ? item.application_detail?.applicant_name || "Ứng viên không xác định"
            : item.job_detail?.title || "Công việc không xác định";

        const displaySubtitle = activeTab === 'candidate'
            ? item.application_detail?.job_title || "Vị trí không xác định"
            : item.reviewer_name || "Người đánh giá ẩn danh";

        const displayAvatar = activeTab === 'candidate'
            ? item.application_detail?.applicant_avatar || "https://via.placeholder.com/150"
            : item.reviewer_avatar || "https://via.placeholder.com/150";

        return (
            <Card style={styles.reviewCard}>
                <Card.Content>
                    <View style={styles.reviewHeader}>
                        <Avatar.Image
                            source={{ uri: displayAvatar }}
                            size={48}
                            style={styles.avatar}
                        />

                        <View style={styles.headerInfo}>
                            <Title style={styles.reviewTitle}>{displayTitle}</Title>
                            <Text style={styles.reviewSubtitle}>{displaySubtitle}</Text>
                            <Text style={styles.reviewDate}>
                                Đánh giá vào: {formatDate(item.created_at)}
                            </Text>
                        </View>

                        <View style={styles.ratingContainer}>
                            {renderStars(item.rating)}
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => toggleExpandReview(item.id)}
                        style={styles.expandTouchable}
                    >
                        <Paragraph style={styles.commentPreview} numberOfLines={isExpanded ? undefined : 2}>
                            {item.comment}
                        </Paragraph>

                        {!isExpanded && item.comment && item.comment.length > 100 && (
                            <Text style={styles.expandText}>Xem thêm</Text>
                        )}
                    </TouchableOpacity>

                    {isExpanded && (
                        <>
                            {/* Điểm mạnh */}
                            {item.strengths && item.strengths.length > 0 && (
                                <View style={styles.tagsSection}>
                                    <Text style={styles.tagSectionTitle}>Điểm mạnh:</Text>
                                    <View style={styles.chipsContainer}>
                                        {typeof item.strengths === 'string'
                                            ? item.strengths.split(',').map((strength, index) => (
                                                <Chip key={index} style={styles.strengthChip}>
                                                    {strength.trim()}
                                                </Chip>
                                            ))
                                            : item.strengths.map((strength, index) => (
                                                <Chip key={index} style={styles.strengthChip}>
                                                    {strength}
                                                </Chip>
                                            ))}
                                    </View>
                                </View>
                            )}

                            {/* Điểm yếu */}
                            {item.weaknesses && item.weaknesses.length > 0 && (
                                <View style={styles.tagsSection}>
                                    <Text style={styles.tagSectionTitle}>Điểm yếu:</Text>
                                    <View style={styles.chipsContainer}>
                                        {typeof item.weaknesses === 'string'
                                            ? item.weaknesses.split(',').map((weakness, index) => (
                                                <Chip key={index} style={styles.weaknessChip}>
                                                    {weakness.trim()}
                                                </Chip>
                                            ))
                                            : item.weaknesses.map((weakness, index) => (
                                                <Chip key={index} style={styles.weaknessChip}>
                                                    {weakness}
                                                </Chip>
                                            ))}
                                    </View>
                                </View>
                            )}

                            {/* Chỉ hiển thị nút hành động nếu là đánh giá của tôi */}
                            {item.reviewer_id === user?.id && (
                                <View style={styles.actionButtons}>
                                    <Button
                                        mode="outlined"
                                        icon="pencil"
                                        onPress={() => navigation.navigate('EditReview', { review: item })}
                                        style={styles.editButton}
                                    >
                                        Chỉnh sửa
                                    </Button>
                                    <Button
                                        mode="outlined"
                                        icon="delete"
                                        onPress={() => handleDeleteReview(item.id)}
                                        style={styles.deleteButton}
                                    >
                                        Xóa
                                    </Button>
                                </View>
                            )}
                        </>
                    )}
                </Card.Content>
            </Card>
        );
    };

    // Render danh sách đánh giá dựa trên tab đang active
    const renderReviewsList = () => {
        const reviewsToShow = activeTab === 'candidate' ? candidateReviewsByMe : jobReviewsForMe;

        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1E88E5" />
                </View>
            );
        }

        if (reviewsToShow.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="comment-text-outline" size={64} color="#BDBDBD" />
                    <Text style={styles.emptyText}>
                        {activeTab === 'candidate'
                            ? 'Bạn chưa có đánh giá nào cho ứng viên'
                            : 'Chưa có đánh giá nào về công việc từ ứng viên'}
                    </Text>

                    {activeTab === 'candidate' && (
                        <Button
                            mode="contained"
                            icon="plus"
                            style={styles.emptyActionButton}
                            onPress={() => navigation.navigate('ApplicationListScreen')}
                        >
                            Đánh giá ứng viên
                        </Button>
                    )}
                </View>
            );
        }

        return (
            <FlatList
                data={reviewsToShow}
                renderItem={renderReviewItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadReviews} />
                }
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
                    mode={activeTab === 'candidate' ? "contained" : "outlined"}
                    onPress={() => setActiveTab('candidate')}
                    style={[styles.tabButton, activeTab === 'candidate' && styles.activeTabButton]}
                >
                    Đánh giá của tôi ({candidateReviewsByMe.length})
                </Button>
                <Button
                    mode={activeTab === 'job' ? "contained" : "outlined"}
                    onPress={() => setActiveTab('job')}
                    style={[styles.tabButton, activeTab === 'job' && styles.activeTabButton]}
                >
                    Nhận xét về công việc ({jobReviewsForMe.length})
                </Button>
            </View>

            {renderReviewsList()}

            {/* FAB chỉ hiển thị khi đang ở tab đánh giá ứng viên */}
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
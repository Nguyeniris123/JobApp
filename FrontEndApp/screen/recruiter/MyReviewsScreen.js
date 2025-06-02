import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useContext, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Avatar, Card, Paragraph, Text } from 'react-native-paper';
import { AuthContext } from '../../contexts/AuthContext';
import { ReviewContext } from '../../contexts/ReviewContext';

const MyReviewsScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const { recruiterReviews, fetchRecruiterReviews, loading } = useContext(ReviewContext);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedReview, setExpandedReview] = useState(null);

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

    // Tải đánh giá từ context
    const loadReviews = async () => {
        if (!user) return;
        setRefreshing(true);
        await fetchRecruiterReviews(user?.company?.id);
        setRefreshing(false);
    };

    // Mở rộng/thu gọn review
    const toggleExpandReview = (id) => {
        setExpandedReview(expandedReview === id ? null : id);
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
    const renderReviewItem = ({ item }) => {
        const isExpanded = expandedReview === item.id;
        const comment = item.comment || '';
        const shouldTruncate = comment.length > 100 && !isExpanded;
        const displayComment = shouldTruncate ? comment.slice(0, 100) + '...' : comment;
        return (
            <Card style={styles.reviewCard}>
                <Card.Content>
                    <View style={styles.reviewHeader}>
                        <Avatar.Text label={item.reviewer?.username?.[0]?.toUpperCase() || '?'} size={40} style={styles.avatar} />
                        <View style={styles.headerInfo}>
                            <Text style={styles.reviewSubtitle}>{item.reviewed_user?.username ? `Ứng viên: ${item.reviewer.first_name} ${item.reviewer.last_name}` : ''}</Text>
                            <Text style={styles.reviewDate}>{formatDate(item.created_date)}</Text>
                        </View>
                        <View style={styles.ratingContainer}>{renderStars(item.rating)}</View>
                    </View>
                    <TouchableOpacity style={styles.expandTouchable} onPress={() => toggleExpandReview(item.id)}>
                        <Paragraph numberOfLines={undefined} style={styles.commentPreview}>
                            {displayComment}
                        </Paragraph>
                        {comment.length > 100 && (
                            <Text style={styles.expandText}>{isExpanded ? 'Thu gọn' : 'Xem thêm'}</Text>
                        )}
                    </TouchableOpacity>
                </Card.Content>
            </Card>
        );
    };

    // Render danh sách đánh giá
    const renderReviewsList = () => {
        if (loading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1976D2" />
                </View>
            );
        }
        if (recruiterReviews.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Chưa có đánh giá nào.</Text>
                </View>
            );
        }
        return (
            <FlatList
                data={recruiterReviews}
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
                <Text style={styles.screenTitle}>Đánh giá của tôi</Text>
                <Text style={styles.screenSubtitle}>{`${user?.first_name} ${user?.last_name}` || 'Nhà tuyển dụng'}</Text>
            </LinearGradient>
            {renderReviewsList()}
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
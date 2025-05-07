import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useContext, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Divider, Paragraph, Text, Title } from 'react-native-paper';
import { AuthContext } from '../../contexts/AuthContext';
import { useReview } from '../../hooks/useReview';

const MyReviewsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('job'); // 'job' or 'application'
  
  // Sử dụng custom hook để truy cập review context
  const { 
    recruiterReviews,
    candidateReviews, 
    fetchRecruiterReviews, 
    fetchCandidateReviews, 
    deleteReview,
    loading
  } = useReview();
  
  // Lấy các đánh giá mà người dùng đã viết (cho công việc)
  const jobReviews = recruiterReviews.filter(review => 
    review.job && review.reviewer_id === user?.id
  );
  
  // Lấy các đánh giá mà người dùng đã viết (cho ứng viên)
  const applicationReviews = candidateReviews.filter(review => 
    review.application && review.reviewer_id === user?.id
  );
  
  // Hàm format ngày tháng
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
  
  const loadReviews = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchRecruiterReviews(),
      fetchCandidateReviews()
    ]);
    setRefreshing(false);
  };

  // Xử lý xóa đánh giá
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

  // Render danh sách đánh giá dựa trên tab đang active
  const renderReviewsList = () => {
    const reviewsToShow = activeTab === 'job' ? jobReviews : applicationReviews;
    
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
            Bạn chưa có đánh giá nào cho {activeTab === 'job' ? 'công việc' : 'đơn ứng tuyển'}
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.reviewsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadReviews} />
        }
      >
        {reviewsToShow.map((review) => (
          <Card key={review.id} style={styles.reviewCard}>
            <Card.Content>
              <View style={styles.reviewHeader}>
                <View>
                  <Title style={styles.reviewTitle}>
                    {activeTab === 'job' 
                      ? review.job_detail?.title || "Công việc không xác định"
                      : review.application_detail?.job_title || "Đơn ứng tuyển không xác định"}
                  </Title>
                  <Text style={styles.reviewDate}>
                    Đánh giá vào: {formatDate(review.created_at)}
                  </Text>
                </View>
                <View style={styles.ratingContainer}>
                  {renderStars(review.rating)}
                </View>
              </View>
              
              <Divider style={styles.divider} />
              
              <Paragraph style={styles.commentText}>
                {review.comment}
              </Paragraph>

              {/* Điểm mạnh */}
              {review.strengths && review.strengths.length > 0 && (
                <View style={styles.tagsSection}>
                  <Text style={styles.tagSectionTitle}>Điểm mạnh:</Text>
                  <View style={styles.chipsContainer}>
                    {typeof review.strengths === 'string' 
                      ? review.strengths.split(',').map((strength, index) => (
                          <Chip key={index} style={styles.strengthChip}>
                            {strength.trim()}
                          </Chip>
                        ))
                      : review.strengths.map((strength, index) => (
                          <Chip key={index} style={styles.strengthChip}>
                            {strength}
                          </Chip>
                        ))}
                  </View>
                </View>
              )}

              {/* Điểm yếu */}
              {review.weaknesses && review.weaknesses.length > 0 && (
                <View style={styles.tagsSection}>
                  <Text style={styles.tagSectionTitle}>Điểm yếu:</Text>
                  <View style={styles.chipsContainer}>
                    {typeof review.weaknesses === 'string'
                      ? review.weaknesses.split(',').map((weakness, index) => (
                          <Chip key={index} style={styles.weaknessChip}>
                            {weakness.trim()}
                          </Chip>
                        ))
                      : review.weaknesses.map((weakness, index) => (
                          <Chip key={index} style={styles.weaknessChip}>
                            {weakness}
                          </Chip>
                        ))}
                  </View>
                </View>
              )}

              <View style={styles.actionButtons}>
                <Button 
                  mode="outlined" 
                  icon="pencil" 
                  onPress={() => navigation.navigate('EditReview', { review })}
                  style={styles.editButton}
                >
                  Chỉnh sửa
                </Button>
                <Button 
                  mode="outlined" 
                  icon="delete" 
                  onPress={() => handleDeleteReview(review.id)}
                  style={styles.deleteButton}
                >
                  Xóa
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1976D2', '#1E88E5', '#2196F3']}
        style={styles.header}
      >
        <Text style={styles.screenTitle}>Đánh giá của tôi</Text>
        <Text style={styles.screenSubtitle}>{user?.username || 'Người dùng'}</Text>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <Button
          mode={activeTab === 'job' ? "contained" : "outlined"}
          onPress={() => setActiveTab('job')}
          style={[styles.tabButton, activeTab === 'job' && styles.activeTabButton]}
        >
          Công việc ({jobReviews.length})
        </Button>
        <Button
          mode={activeTab === 'application' ? "contained" : "outlined"}
          onPress={() => setActiveTab('application')}
          style={[styles.tabButton, activeTab === 'application' && styles.activeTabButton]}
        >
          Ứng viên ({applicationReviews.length})
        </Button>
      </View>

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
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  activeTabButton: {
    backgroundColor: '#1976D2',
  },
  reviewsList: {
    padding: 16,
  },
  reviewCard: {
    marginBottom: 16,
    elevation: 3,
    borderRadius: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewDate: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 8,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  divider: {
    marginVertical: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsSection: {
    marginBottom: 8,
  },
  tagSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
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
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default MyReviewsScreen;
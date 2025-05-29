import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Divider, Paragraph, Text } from 'react-native-paper';
import { deleteReview as deleteReviewApi, fetchCandidateReviews, fetchRecruiterReviews } from '../../services/reviewService';

const MyReviewsScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('job'); // 'job' or 'application'
  const [candidateReviews, setCandidateReviews] = useState([]);
  const [recruiterReviews, setRecruiterReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    };

    getUser();
  }, []);

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
    if (!dateString) return '';
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
    }, [user])
  );

  const loadReviews = async () => {
    if (!user) return;
    setLoading(true);
    setRefreshing(true);
    try {
      const [rReviews, cReviews] = await Promise.all([
        fetchRecruiterReviews(user.id),
        fetchCandidateReviews(user.id)
      ]);
      setRecruiterReviews(rReviews);
      setCandidateReviews(cReviews);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Xử lý xóa đánh giá
  const handleDeleteReview = async (reviewId, type) => {
    setLoading(true);
    try {
      await deleteReviewApi(reviewId, type);
      loadReviews();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
      <ScrollView style={styles.reviewsList} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadReviews} />}>
        {reviewsToShow.map((item) => (
          <Card key={item.id} style={styles.reviewCard}>
            <Card.Content>
              <View style={styles.reviewHeader}>
                <View>
                  <Text style={styles.reviewTitle}>{item.reviewer_name}</Text>
                  <Text style={styles.reviewDate}>{formatDate(item.created_date)}</Text>
                </View>
                <View style={styles.ratingContainer}>{renderStars(item.rating)}</View>
              </View>
              <Divider style={styles.divider} />
              <Paragraph style={styles.commentText}>{item.comment}</Paragraph>
              <View style={styles.actionButtons}>
                <Button mode="outlined" style={styles.deleteButton} onPress={() => handleDeleteReview(item.id, activeTab === 'job' ? 'job' : 'candidate')}>Xóa</Button>
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
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
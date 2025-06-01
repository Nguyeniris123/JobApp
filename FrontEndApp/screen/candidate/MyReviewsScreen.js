import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Divider, Paragraph, Text } from 'react-native-paper';
import { AuthContext } from '../../contexts/AuthContext';
import { ReviewContext } from '../../contexts/ReviewContext';

const MyReviewsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { candidateReviews, fetchCandidateReviews, deleteReview, loading } = useContext(ReviewContext);
  const [refreshing, setRefreshing] = useState(false);

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
    setRefreshing(true);
    await fetchCandidateReviews(user.id);
    setRefreshing(false);
  };

  // Xử lý xóa đánh giá
  const handleDeleteReview = async (reviewId) => {
    await deleteReview(reviewId);
    loadReviews();
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

  // Render danh sách đánh giá
  const renderReviewsList = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
        </View>
      );
    }
    if (candidateReviews.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có đánh giá nào.</Text>
        </View>
      );
    }
    return (
      <ScrollView style={styles.reviewsList} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadReviews} />}>
        {candidateReviews.map((item) => (
          <Card key={item.id} style={styles.reviewCard}>
            <Card.Content>
              <View style={styles.reviewHeader}>
                <View>
                  <Text style={styles.reviewTitle}>{item.reviewer?.username || 'Ẩn danh'}</Text>
                  <Text style={styles.reviewDate}>{formatDate(item.created_date)}</Text>
                </View>
                <View style={styles.ratingContainer}>{renderStars(item.rating)}</View>
              </View>
              <Divider style={styles.divider} />
              <Paragraph style={styles.commentText}>{item.comment}</Paragraph>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    );
  };

  // Debug: log candidateReviews mỗi khi thay đổi
  useEffect(() => {
    console.log('candidateReviews:', candidateReviews);
  }, [candidateReviews]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1976D2', '#1E88E5', '#2196F3']}
        style={styles.header}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Button
            onPress={() => navigation.goBack()}
            style={{ marginRight: 8, backgroundColor: 'transparent', minWidth: 0, padding: 0 }}
            labelStyle={{ color: '#fff', fontSize: 22 }}
            compact
            icon={() => (
              <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
            )}
          >
          </Button>
          <Text style={styles.screenTitle}>Đánh giá của tôi</Text>
        </View>
        <Text style={styles.screenSubtitle}>{user?.username || 'Người dùng'}</Text>
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
    paddingTop: 25,
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Chip, Text } from 'react-native-paper';

export const ReviewCard = ({ review, style }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
    };

    const renderRating = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <MaterialCommunityIcons
                    key={i}
                    name={i <= rating ? "star" : "star-outline"}
                    size={16}
                    color={i <= rating ? "#FFC107" : "#BDBDBD"}
                    style={{ marginRight: 2 }}
                />
            );
        }
        return <View style={styles.ratingContainer}>{stars}</View>;
    };

    // Xử lý danh sách điểm mạnh và điểm yếu (từ chuỗi hoặc mảng)
    const parseStrengthsWeaknesses = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (typeof data === 'string') return data.split(',').filter(item => item.trim());
        return [];
    };

    const strengths = parseStrengthsWeaknesses(review.strengths);
    const weaknesses = parseStrengthsWeaknesses(review.weaknesses);

    // Lấy tên người đánh giá từ dữ liệu mới
    const reviewerName = (review.reviewer && review.reviewer.first_name + ' ' + review.reviewer.last_name).trim()
        || review.reviewer_name
        || (review.reviewer_details ? review.reviewer_details.username : null)
        || 'Người dùng ẩn danh';

    // Lấy avatar nếu có
    const reviewerAvatar = (review.reviewer && review.reviewer.avatar) || null;

    // Lấy ngày tạo đánh giá
    const creationDate = review.created_date || review.created_at || review.date;

    return (
        <Card style={[styles.card, style]}>
            <Card.Content>
                <View style={styles.header}>
                    <View style={styles.userInfo}>
                        <Avatar.Image size={36} source={reviewerAvatar ? { uri: reviewerAvatar } : undefined} />
                        <View style={styles.nameContainer}>
                            <Text style={styles.userName}>{reviewerName}</Text>
                            <Text style={styles.date}>{formatDate(creationDate)}</Text>
                        </View>
                    </View>
                    {renderRating(review.rating)}
                </View>

                <Text style={styles.comment}>{review.comment}</Text>

                {strengths.length > 0 && (
                    <View style={styles.tagsSection}>
                        <Text style={styles.tagTitle}>Điểm mạnh:</Text>
                        <View style={styles.chipContainer}>
                            {strengths.map((strength, index) => (
                                <Chip 
                                    key={index} 
                                    style={styles.strengthChip} 
                                    textStyle={styles.chipText}
                                >
                                    {strength.trim()}
                                </Chip>
                            ))}
                        </View>
                    </View>
                )}

                {weaknesses.length > 0 && (
                    <View style={styles.tagsSection}>
                        <Text style={styles.tagTitle}>Điểm yếu:</Text>
                        <View style={styles.chipContainer}>
                            {weaknesses.map((weakness, index) => (
                                <Chip 
                                    key={index}
                                    style={styles.weaknessChip} 
                                    textStyle={styles.chipText}
                                >
                                    {weakness.trim()}
                                </Chip>
                            ))}
                        </View>
                    </View>
                )}
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 8,
        borderRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nameContainer: {
        marginLeft: 12,
    },
    userName: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    date: {
        fontSize: 12,
        color: '#757575',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    comment: {
        fontSize: 14,
        lineHeight: 20,
        color: '#212121',
        marginBottom: 12,
    },
    tagsSection: {
        marginTop: 8,
    },
    tagTitle: {
        fontSize: 12,
        color: '#616161',
        marginBottom: 4,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    strengthChip: {
        backgroundColor: '#E8F5E9',
        margin: 2,
        height: 28,
    },
    weaknessChip: {
        backgroundColor: '#FFEBEE',
        margin: 2,
        height: 28,
    },
    chipText: {
        fontSize: 12,
    }
});
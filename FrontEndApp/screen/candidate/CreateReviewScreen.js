import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useReview } from '../../contexts/ReviewContext';

const CreateReviewScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { jobId, jobTitle, companyId } = route.params;
    const { createJobReview } = useReview();

    // Review state
    const [rating, setRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Debug log when component mounts
    useEffect(() => {
        console.log('CreateReviewScreen - Route params:', route.params);
        console.log('CreateReviewScreen - companyId:', companyId);
        console.log('CreateReviewScreen - jobId:', jobId);
        console.log('CreateReviewScreen - jobTitle:', jobTitle);
    }, []);

    // Handle rating selection
    const handleRatingSelection = (selectedRating) => {
        setRating(selectedRating);
    };
    
    // Handle review submission
    const handleReviewSubmit = async () => {
        try {
            if (rating === 0) {
                alert('Vui lòng chọn đánh giá sao');
                return;
            }
            
            console.log('Submitting review:', {
                companyId,
                rating,
                reviewComment,
            });

            setSubmitting(true);
            // Sử dụng format API mới (như trong Postman)
            const result = await createJobReview(
                companyId,
                rating,
                reviewComment
            );
            

            if (result.success) {
                alert('Đánh giá của bạn đã được gửi thành công!');
                navigation.goBack();
            } else {
                alert(result.message || 'Không thể gửi đánh giá. Vui lòng thử lại sau.');
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            alert('Đã xảy ra lỗi khi gửi đánh giá.');
        } finally {
            setSubmitting(false);
        }
    };

    // Star rating component
    const StarRating = () => {
        return (
            <View style={styles.starContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity 
                        key={star}
                        onPress={() => handleRatingSelection(star)}
                        style={styles.starButton}
                    >
                        <Icon 
                            name={rating >= star ? "star" : "star-border"}
                            size={40} 
                            color={rating >= star ? "#FFC107" : "#BBBBBB"} 
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Đánh giá công việc</Text>
                <Text style={styles.subtitle}>{jobTitle}</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Đánh giá của bạn</Text>
                    <View style={styles.ratingContainer}>
                        <StarRating />
                        <Text style={styles.ratingText}>
                            {rating === 0 ? 'Chưa đánh giá' : `${rating}/5 sao`}
                        </Text>
                    </View>
                </View>
                
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nhận xét</Text>
                    <TextInput
                        style={styles.reviewInput}
                        placeholder="Chia sẻ cảm nhận của bạn về công việc này..."
                        value={reviewComment}
                        onChangeText={setReviewComment}
                        multiline
                        numberOfLines={6}
                    />
                </View>
                
                <View style={styles.buttonContainer}>
                    <Button 
                        mode="outlined" 
                        onPress={() => navigation.goBack()}
                        style={styles.cancelButton}
                    >
                        Hủy bỏ
                    </Button>
                    <Button 
                        mode="contained" 
                        onPress={handleReviewSubmit}
                        loading={submitting}
                        disabled={submitting || rating === 0}
                        style={styles.submitButton}
                    >
                        Gửi đánh giá
                    </Button>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#2196F3',
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    content: {
        padding: 16,
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#212121',
    },
    ratingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    starContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 8,
    },
    starButton: {
        padding: 5,
    },
    ratingText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#424242',
        marginTop: 8,
    },
    reviewInput: {
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#424242',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        minHeight: 120,
        textAlignVertical: 'top',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    tagChip: {
        backgroundColor: '#E3F2FD',
        margin: 4,
    },
    tagInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    tagInput: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#424242',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    tagAddButton: {
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginVertical: 16,
    },
    cancelButton: {
        flex: 1,
        borderColor: '#9E9E9E',
    },
    submitButton: {
        flex: 2,
        backgroundColor: '#2196F3',
    },
});

export default CreateReviewScreen;
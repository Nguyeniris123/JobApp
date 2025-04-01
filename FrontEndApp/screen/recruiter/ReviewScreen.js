import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import { ActivityIndicator, Avatar, Button, Card, Chip, Divider, Snackbar, Text, TextInput } from "react-native-paper"

// Dữ liệu mẫu cho đánh giá
const mockReviews = [
    {
        id: "1",
        candidateId: "1",
        candidateName: "Nguyễn Văn A",
        candidateAvatar: "https://via.placeholder.com/150",
        position: "Nhân viên bán hàng bán thời gian",
        rating: 4,
        comment: "Ứng viên có kỹ năng giao tiếp tốt, thái độ làm việc tích cực. Phù hợp với vị trí bán hàng.",
        strengths: ["Giao tiếp", "Thái độ tích cực", "Nhanh nhẹn"],
        weaknesses: ["Thiếu kinh nghiệm"],
        reviewDate: new Date(2023, 3, 15),
        interviewDate: new Date(2023, 3, 10),
        status: "interviewed",
    },
    {
        id: "2",
        candidateId: "2",
        candidateName: "Trần Thị B",
        candidateAvatar: "https://via.placeholder.com/150",
        position: "Nhân viên marketing",
        rating: 5,
        comment: "Ứng viên có kiến thức chuyên môn tốt, nhiều ý tưởng sáng tạo. Rất phù hợp với vị trí marketing.",
        strengths: ["Sáng tạo", "Kiến thức chuyên môn", "Kỹ năng phân tích"],
        weaknesses: [],
        reviewDate: new Date(2023, 3, 16),
        interviewDate: new Date(2023, 3, 12),
        status: "hired",
    },
    {
        id: "3",
        candidateId: "3",
        candidateName: "Lê Văn C",
        candidateAvatar: "https://via.placeholder.com/150",
        position: "Lập trình viên",
        rating: 3,
        comment: "Ứng viên có kiến thức cơ bản về lập trình, nhưng còn thiếu kinh nghiệm thực tế. Cần đào tạo thêm.",
        strengths: ["Kiến thức cơ bản", "Khả năng học hỏi"],
        weaknesses: ["Thiếu kinh nghiệm thực tế", "Kỹ năng giải quyết vấn đề"],
        reviewDate: new Date(2023, 3, 17),
        interviewDate: new Date(2023, 3, 14),
        status: "rejected",
    },
]

const ReviewScreen = ({ navigation, route }) => {
    const { candidateId } = route.params || {}
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedReview, setSelectedReview] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editedReview, setEditedReview] = useState(null)
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState("")
    const { t } = useTranslation()

    useEffect(() => {
        // Giả lập API call
        const fetchReviews = async () => {
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000))

                if (candidateId) {
                    const review = mockReviews.find((r) => r.candidateId === candidateId)
                    if (review) {
                        setReviews([review])
                        setSelectedReview(review)
                    } else {
                        setReviews([])
                    }
                } else {
                    setReviews(mockReviews)
                }
            } catch (error) {
                console.log("Error fetching reviews:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchReviews()

        // Theo dõi sự kiện xem đánh giá
        analyticsService.trackEvent("view_reviews", {
            candidate_id: candidateId || "all",
        })
    }, [candidateId])

    const handleSelectReview = (review) => {
        setSelectedReview(review)
    }

    const handleEditReview = () => {
        setEditedReview({
            ...selectedReview,
            newStrength: "",
            newWeakness: "",
        })
        setIsEditing(true)
    }

    const handleUpdateReview = () => {
        // Giả lập API call
        setTimeout(() => {
            const updatedReviews = reviews.map((review) => (review.id === editedReview.id ? editedReview : review))

            setReviews(updatedReviews)
            setSelectedReview(editedReview)
            setIsEditing(false)

            // Theo dõi sự kiện cập nhật đánh giá
            analyticsService.trackEvent("update_review", {
                candidate_id: editedReview.candidateId,
                rating: editedReview.rating,
            })

            setSnackbarMessage("Đánh giá đã được cập nhật thành công")
            setSnackbarVisible(true)
        }, 1000)
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setEditedReview(null)
    }

    const handleAddStrength = () => {
        if (!editedReview.newStrength.trim()) return

        setEditedReview({
            ...editedReview,
            strengths: [...editedReview.strengths, editedReview.newStrength.trim()],
            newStrength: "",
        })
    }

    const handleRemoveStrength = (strength) => {
        setEditedReview({
            ...editedReview,
            strengths: editedReview.strengths.filter((s) => s !== strength),
        })
    }

    const handleAddWeakness = () => {
        if (!editedReview.newWeakness.trim()) return

        setEditedReview({
            ...editedReview,
            weaknesses: [...editedReview.weaknesses, editedReview.newWeakness.trim()],
            newWeakness: "",
        })
    }

    const handleRemoveWeakness = (weakness) => {
        setEditedReview({
            ...editedReview,
            weaknesses: editedReview.weaknesses.filter((w) => w !== weakness),
        })
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const renderStars = (rating) => {
        const stars = []
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <MaterialCommunityIcons
                    key={i}
                    name={i <= rating ? "star" : "star-outline"}
                    size={24}
                    color={i <= rating ? "#FFC107" : "#BDBDBD"}
                />,
            )
        }
        return <View style={styles.starsContainer}>{stars}</View>
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "interviewed":
                return "#2196F3"
            case "hired":
                return "#4CAF50"
            case "rejected":
                return "#F44336"
            default:
                return "#9E9E9E"
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case "interviewed":
                return "Đã phỏng vấn"
            case "hired":
                return "Đã tuyển"
            case "rejected":
                return "Đã từ chối"
            default:
                return "Không xác định"
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E88E5" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Đánh giá ứng viên</Text>
            </View>

            {reviews.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="clipboard-text-off" size={64} color="#BDBDBD" />
                    <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
                </View>
            ) : (
                <View style={styles.content}>
                    {!candidateId && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewList}>
                            {reviews.map((review) => (
                                <TouchableOpacity
                                    key={review.id}
                                    style={[styles.reviewCard, selectedReview?.id === review.id && styles.selectedReviewCard]}
                                    onPress={() => handleSelectReview(review)}
                                >
                                    <Avatar.Image source={{ uri: review.candidateAvatar }} size={60} />
                                    <Text style={styles.reviewCardName}>{review.candidateName}</Text>
                                    <Text style={styles.reviewCardPosition}>{review.position}</Text>
                                    <View style={styles.reviewCardRating}>
                                        {[...Array(5)].map((_, i) => (
                                            <MaterialCommunityIcons
                                                key={i}
                                                name={i < review.rating ? "star" : "star-outline"}
                                                size={16}
                                                color={i < review.rating ? "#FFC107" : "#BDBDBD"}
                                            />
                                        ))}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    {selectedReview && (
                        <ScrollView style={styles.reviewDetail}>
                            {isEditing ? (
                                <Card style={styles.detailCard}>
                                    <Card.Content>
                                        <View style={styles.candidateInfo}>
                                            <Avatar.Image source={{ uri: selectedReview.candidateAvatar }} size={60} />
                                            <View style={styles.candidateDetails}>
                                                <Text style={styles.candidateName}>{selectedReview.candidateName}</Text>
                                                <Text style={styles.candidatePosition}>{selectedReview.position}</Text>
                                                <Chip
                                                    style={[styles.statusChip, { backgroundColor: getStatusColor(selectedReview.status) + "20" }]}
                                                    textStyle={{ color: getStatusColor(selectedReview.status) }}
                                                >
                                                    {getStatusText(selectedReview.status)}
                                                </Chip>
                                            </View>
                                        </View>

                                        <Divider style={styles.divider} />

                                        <Text style={styles.sectionTitle}>Đánh giá</Text>
                                        <View style={styles.ratingSelector}>
                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                <TouchableOpacity key={rating} onPress={() => setEditedReview({ ...editedReview, rating })}>
                                                    <MaterialCommunityIcons
                                                        name={rating <= editedReview.rating ? "star" : "star-outline"}
                                                        size={32}
                                                        color={rating <= editedReview.rating ? "#FFC107" : "#BDBDBD"}
                                                        style={styles.ratingStar}
                                                    />
                                                </TouchableOpacity>
                                            ))}
                                        </View>

                                        <Text style={styles.inputLabel}>Nhận xét</Text>
                                        <TextInput
                                            value={editedReview.comment}
                                            onChangeText={(text) => setEditedReview({ ...editedReview, comment: text })}
                                            mode="outlined"
                                            multiline
                                            numberOfLines={4}
                                            style={styles.commentInput}
                                        />

                                        <Text style={styles.inputLabel}>Điểm mạnh</Text>
                                        <View style={styles.tagsContainer}>
                                            {editedReview.strengths.map((strength, index) => (
                                                <Chip key={index} style={styles.strengthChip} onClose={() => handleRemoveStrength(strength)}>
                                                    {strength}
                                                </Chip>
                                            ))}
                                        </View>
                                        <View style={styles.addTagContainer}>
                                            <TextInput
                                                value={editedReview.newStrength}
                                                onChangeText={(text) => setEditedReview({ ...editedReview, newStrength: text })}
                                                placeholder="Thêm điểm mạnh"
                                                mode="outlined"
                                                style={styles.addTagInput}
                                            />
                                            <Button
                                                mode="contained"
                                                onPress={handleAddStrength}
                                                disabled={!editedReview.newStrength.trim()}
                                                style={styles.addTagButton}
                                            >
                                                Thêm
                                            </Button>
                                        </View>

                                        <Text style={styles.inputLabel}>Điểm yếu</Text>
                                        <View style={styles.tagsContainer}>
                                            {editedReview.weaknesses.map((weakness, index) => (
                                                <Chip key={index} style={styles.weaknessChip} onClose={() => handleRemoveWeakness(weakness)}>
                                                    {weakness}
                                                </Chip>
                                            ))}
                                        </View>
                                        <View style={styles.addTagContainer}>
                                            <TextInput
                                                value={editedReview.newWeakness}
                                                onChangeText={(text) => setEditedReview({ ...editedReview, newWeakness: text })}
                                                placeholder="Thêm điểm yếu"
                                                mode="outlined"
                                                style={styles.addTagInput}
                                            />
                                            <Button
                                                mode="contained"
                                                onPress={handleAddWeakness}
                                                disabled={!editedReview.newWeakness.trim()}
                                                style={styles.addTagButton}
                                            >
                                                Thêm
                                            </Button>
                                        </View>

                                        <View style={styles.buttonContainer}>
                                            <Button mode="outlined" onPress={handleCancelEdit} style={styles.cancelButton}>
                                                Hủy
                                            </Button>
                                            <Button mode="contained" onPress={handleUpdateReview} style={styles.saveButton}>
                                                Lưu
                                            </Button>
                                        </View>
                                    </Card.Content>
                                </Card>
                            ) : (
                                <Card style={styles.detailCard}>
                                    <Card.Content>
                                        <View style={styles.cardHeader}>
                                            <View style={styles.candidateInfo}>
                                                <Avatar.Image source={{ uri: selectedReview.candidateAvatar }} size={60} />
                                                <View style={styles.candidateDetails}>
                                                    <Text style={styles.candidateName}>{selectedReview.candidateName}</Text>
                                                    <Text style={styles.candidatePosition}>{selectedReview.position}</Text>
                                                    <Chip
                                                        style={[
                                                            styles.statusChip,
                                                            { backgroundColor: getStatusColor(selectedReview.status) + "20" },
                                                        ]}
                                                        textStyle={{ color: getStatusColor(selectedReview.status) }}
                                                    >
                                                        {getStatusText(selectedReview.status)}
                                                    </Chip>
                                                </View>
                                            </View>
                                            <Button mode="text" onPress={handleEditReview} icon="pencil">
                                                Chỉnh sửa
                                            </Button>
                                        </View>

                                        <Divider style={styles.divider} />

                                        <View style={styles.reviewInfo}>
                                            <View style={styles.infoItem}>
                                                <Text style={styles.infoLabel}>Ngày phỏng vấn:</Text>
                                                <Text style={styles.infoValue}>{formatDate(selectedReview.interviewDate)}</Text>
                                            </View>
                                            <View style={styles.infoItem}>
                                                <Text style={styles.infoLabel}>Ngày đánh giá:</Text>
                                                <Text style={styles.infoValue}>{formatDate(selectedReview.reviewDate)}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.ratingContainer}>
                                            <Text style={styles.sectionTitle}>Đánh giá</Text>
                                            {renderStars(selectedReview.rating)}
                                        </View>

                                        <View style={styles.commentContainer}>
                                            <Text style={styles.sectionTitle}>Nhận xét</Text>
                                            <Text style={styles.comment}>{selectedReview.comment}</Text>
                                        </View>

                                        <View style={styles.strengthsContainer}>
                                            <Text style={styles.sectionTitle}>Điểm mạnh</Text>
                                            <View style={styles.tagsContainer}>
                                                {selectedReview.strengths.map((strength, index) => (
                                                    <Chip key={index} style={styles.strengthChip}>
                                                        {strength}
                                                    </Chip>
                                                ))}
                                                {selectedReview.strengths.length === 0 && (
                                                    <Text style={styles.emptyTagsText}>Không có điểm mạnh nào được ghi nhận</Text>
                                                )}
                                            </View>
                                        </View>

                                        <View style={styles.weaknessesContainer}>
                                            <Text style={styles.sectionTitle}>Điểm yếu</Text>
                                            <View style={styles.tagsContainer}>
                                                {selectedReview.weaknesses.map((weakness, index) => (
                                                    <Chip key={index} style={styles.weaknessChip}>
                                                        {weakness}
                                                    </Chip>
                                                ))}
                                                {selectedReview.weaknesses.length === 0 && (
                                                    <Text style={styles.emptyTagsText}>Không có điểm yếu nào được ghi nhận</Text>
                                                )}
                                            </View>
                                        </View>

                                        <View style={styles.actionButtons}>
                                            <Button
                                                mode="outlined"
                                                icon="message-text"
                                                onPress={() => navigation.navigate("Chat", { candidateId: selectedReview.candidateId })}
                                                style={styles.actionButton}
                                            >
                                                Nhắn tin
                                            </Button>
                                            <Button
                                                mode="contained"
                                                icon="account-check"
                                                onPress={() => {
                                                    // Theo dõi sự kiện tuyển dụng
                                                    analyticsService.trackEvent("hire_candidate", {
                                                        candidate_id: selectedReview.candidateId,
                                                        candidate_name: selectedReview.candidateName,
                                                    })

                                                    // Cập nhật trạng thái
                                                    const updatedReview = { ...selectedReview, status: "hired" }
                                                    const updatedReviews = reviews.map((review) =>
                                                        review.id === updatedReview.id ? updatedReview : review,
                                                    )

                                                    setReviews(updatedReviews)
                                                    setSelectedReview(updatedReview)

                                                    setSnackbarMessage("Đã cập nhật trạng thái ứng viên thành 'Đã tuyển'")
                                                    setSnackbarVisible(true)
                                                }}
                                                style={styles.actionButton}
                                                disabled={selectedReview.status === "hired"}
                                            >
                                                Tuyển dụng
                                            </Button>
                                        </View>
                                    </Card.Content>
                                </Card>
                            )}
                        </ScrollView>
                    )}
                </View>
            )}

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                action={{
                    label: "Đóng",
                    onPress: () => setSnackbarVisible(false),
                }}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    header: {
        padding: 20,
        paddingTop: 40,
        backgroundColor: "#1E88E5",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: "#757575",
        textAlign: "center",
        marginTop: 16,
    },
    content: {
        flex: 1,
    },
    reviewList: {
        padding: 16,
    },
    reviewCard: {
        width: 120,
        height: 160,
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        padding: 16,
        marginRight: 16,
        alignItems: "center",
        justifyContent: "center",
        elevation: 2,
    },
    selectedReviewCard: {
        borderWidth: 2,
        borderColor: "#1E88E5",
    },
    reviewCardName: {
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 8,
        marginBottom: 4,
    },
    reviewCardPosition: {
        fontSize: 12,
        color: "#757575",
        textAlign: "center",
        marginBottom: 8,
    },
    reviewCardRating: {
        flexDirection: "row",
    },
    reviewDetail: {
        flex: 1,
        padding: 16,
    },
    detailCard: {
        borderRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    candidateInfo: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    candidateDetails: {
        marginLeft: 16,
        flex: 1,
    },
    candidateName: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 4,
    },
    candidatePosition: {
        fontSize: 14,
        color: "#757575",
        marginBottom: 8,
    },
    statusChip: {
        alignSelf: "flex-start",
    },
    divider: {
        marginVertical: 16,
    },
    reviewInfo: {
        marginBottom: 16,
    },
    infoItem: {
        flexDirection: "row",
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: "#757575",
        width: 120,
    },
    infoValue: {
        fontSize: 14,
        color: "#212121",
        flex: 1,
    },
    ratingContainer: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#212121",
    },
    starsContainer: {
        flexDirection: "row",
    },
    commentContainer: {
        marginBottom: 16,
    },
    comment: {
        fontSize: 14,
        color: "#212121",
        lineHeight: 20,
    },
    strengthsContainer: {
        marginBottom: 16,
    },
    weaknessesContainer: {
        marginBottom: 16,
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    strengthChip: {
        margin: 4,
        backgroundColor: "#E8F5E9",
    },
    weaknessChip: {
        margin: 4,
        backgroundColor: "#FFEBEE",
    },
    emptyTagsText: {
        fontSize: 14,
        color: "#9E9E9E",
        fontStyle: "italic",
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 4,
    },
    inputLabel: {
        fontSize: 14,
        color: "#757575",
        marginBottom: 8,
        marginTop: 16,
    },
    commentInput: {
        backgroundColor: "#FFFFFF",
    },
    ratingSelector: {
        flexDirection: "row",
        justifyContent: "center",
        marginVertical: 8,
    },
    ratingStar: {
        marginHorizontal: 8,
    },
    addTagContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    addTagInput: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        marginRight: 8,
    },
    addTagButton: {
        width: 80,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 24,
    },
    cancelButton: {
        flex: 1,
        marginRight: 8,
    },
    saveButton: {
        flex: 1,
        marginLeft: 8,
    },
})

export default ReviewScreen


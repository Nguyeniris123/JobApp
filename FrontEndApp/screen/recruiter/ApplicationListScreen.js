import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useContext, useEffect, useState } from "react"
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native"
import { ActivityIndicator, Avatar, Card, Chip, Divider, Menu, Searchbar, Text } from "react-native-paper"
import { ApplicationContext } from "../../contexts/ApplicationContext"
import { AuthContext } from "../../contexts/AuthContext"

const ApplicationListScreen = ({ route, navigation }) => {
    const { jobId } = route.params || {};
    const { user, accessToken } = useContext(AuthContext);
    const { applications, fetchApplications, loading, acceptApplication, rejectApplication } = useContext(ApplicationContext);
    const [filteredCandidates, setFilteredCandidates] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [menuVisible, setMenuVisible] = useState(false)
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [expandedCardId, setExpandedCardId] = useState(null)
    const [candidateReviews, setCandidateReviews] = useState([]);

    // Lấy đánh giá cho ứng viên cụ thể
    const getReviewsForCandidate = (applicationId) => {
        return candidateReviews.filter(r => r.application === applicationId);
    };

    // Xem đánh giá và toggle hiển thị
    const toggleCardExpand = (candidateId) => {
        setExpandedCardId(expandedCardId === candidateId ? null : candidateId);
    };

    // Fetch applications from API (for recruiter)
    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    // Filter lại mỗi khi applications thay đổi
    useEffect(() => {
        filterCandidates(searchQuery, statusFilter);
    }, [applications, searchQuery, statusFilter, jobId]);

    // Reload khi scroll lên đầu danh sách
    const handleScroll = (event) => {
        if (event.nativeEvent.contentOffset.y <= 0 && !loading) {
            fetchApplications();
        }
    };

    // Hàm submitting đánh giá mới
    const handleReviewSubmit = async (applicationId, reviewData) => {
        try {
            const result = await createApplicationReview(
                applicationId,
                reviewData.rating,
                reviewData.comment,
                reviewData.strengths,
                reviewData.weaknesses
            );

            if (result.success) {
                setShowReviewForm(false);
                // Tải lại đánh giá sau khi thêm thành công
                await fetchCandidateReviews();
            }
        } catch (error) {
            console.error("Error submitting review:", error);
        }
    };

    const onChangeSearch = (query) => {
        setSearchQuery(query)
        filterCandidates(query, statusFilter)
    }

    // Map API status to Vietnamese
    const mapStatusToVN = (status) => {
        switch (status) {
            case "pending":
                return "Đang xem xét";
            case "accepted":
                return "Đã phỏng vấn";
            case "rejected":
                return "Từ chối";
            default:
                return status;
        }
    };

    // Map Vietnamese status to API status
    const mapVNToStatus = (statusVN) => {
        switch (statusVN) {
            case "Đang xem xét":
                return "pending";
            case "Đã phỏng vấn":
                return "accepted";
            case "Từ chối":
                return "rejected";
            default:
                return null;
        }
    };

    // Sửa lại filterCandidates để dùng status API value
    const filterCandidates = (query, status) => {
        let filtered = applications;
        if (jobId) {
            filtered = filtered.filter(app => String(app.job_detail?.id || app.job) === String(jobId));
        }
        if (query) {
            filtered = filtered.filter((candidate) => candidate.applicant_detail?.username?.toLowerCase().includes(query.toLowerCase()));
        }
        if (status !== "all") {
            filtered = filtered.filter((candidate) => candidate.status === status);
        }
        setFilteredCandidates(filtered);
    }

    // Sửa lại handleStatusFilter để truyền status API value
    const handleStatusFilter = (status) => {
        setStatusFilter(status)
        filterCandidates(searchQuery, status)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "#2196F3"
            case "accepted":
                return "#4CAF50"
            case "rejected":
                return "#F44336"
            default:
                return "#9E9E9E"
        }
    }

    const handleCandidatePress = (candidate) => {
        navigation.navigate("ApplicationDetail", { application: candidate })
    }

    // Thêm hàm nhắn tin
    const handleChatPress = (candidate) => {
        navigation.navigate("Chat", {
            candidateId: candidate.applicant_detail.id,
            candidateName: candidate.applicant_detail.username,
            candidateAvatar: candidate.applicant_detail.avatar,
            jobId: candidate.job_detail.id,
            jobTitle: candidate.job_detail.title
        })
    }

    const handleAcceptCandidate = async (candidate) => {
        try {
            await acceptApplication(candidate.id);
            setMenuVisible(false);
        } catch (error) {
            console.error('Error accepting candidate:', error);
        }
    };

    const handleRejectCandidate = async (candidate) => {
        try {
            await rejectApplication(candidate.id);
            setMenuVisible(false);
        } catch (error) {
            console.error('Error rejecting candidate:', error);
        }
    }

    // Thêm hàm chuyển sang CreateReviewScreen cho recruiter
    const handleNavigateToCreateReview = (application) => {
        navigation.navigate('CreateReview', {
            jobId: application.job_detail?.id,
            jobTitle: application.job_detail?.title,
            companyId: application.job_detail?.recruiter?.company?.id,
            applicationId: application.id,
            candidateId: application.applicant_detail?.id,
        });
    };

    const renderCandidateItem = ({ item }) => (
        <Card style={styles.candidateCard} mode="elevated">
            <Card.Content>
                <TouchableOpacity onPress={() => navigation.navigate('ApplicationDetail', { application: item })}>
                    <View style={styles.candidateHeader}>
                        <View style={styles.candidateInfo}>
                            <Avatar.Image
                                source={{ uri: item.applicant_detail?.avatar || 'https://via.placeholder.com/150' }}
                                size={70}
                                style={styles.avatar}
                            />
                            <View style={styles.candidateDetails}>
                                <Text style={styles.candidateName}>{item.applicant_detail?.first_name} {item.applicant_detail?.last_name}</Text>
                                <Text style={styles.candidateJob} numberOfLines={2}>
                                    {item.job_detail?.title}
                                </Text>
                                <Chip
                                    style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + "15" }]}
                                    textStyle={[styles.statusText, { color: getStatusColor(item.status) }]}
                                >
                                    {mapStatusToVN(item.status)}
                                </Chip>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>

                <Divider style={styles.divider} />

                <View style={styles.candidateContent}>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="account" size={20} color="#666" />
                        <Text style={styles.infoText}>Username: {item.applicant_detail?.username}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="email" size={20} color="#666" />
                        <Text style={styles.infoText}>Email: {item.applicant_detail?.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="briefcase" size={20} color="#666" />
                        <Text style={styles.infoText}>{item.job_detail?.specialized}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
                        <Text style={styles.infoText}>{item.job_detail?.location}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="currency-usd" size={20} color="#666" />
                        <Text style={styles.infoText}>
                            {item.job_detail?.salary ? parseFloat(item.job_detail.salary).toLocaleString('vi-VN') + ' VNĐ' : ''}
                        </Text>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Chip
                            icon="chat"
                            mode="outlined"
                            style={[styles.chatChip, { marginRight: item.status === "accepted" ? 12 : 0 }]}
                            textStyle={styles.chatChipText}
                            onPress={() => handleChatPress(item)}
                        >
                            Nhắn tin
                        </Chip>
                        {item.status === "accepted" && (
                            <Chip
                                icon="star-outline"
                                mode="outlined"
                                style={[styles.reviewChip]}
                                textStyle={styles.reviewChipText}
                                onPress={() => handleNavigateToCreateReview(item)}
                            >
                                Tạo đánh giá
                            </Chip>
                        )}
                    </View>
                </View>
            </Card.Content>
        </Card>
    )

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E88E5" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder="Tìm kiếm ứng viên..."
                    onChangeText={onChangeSearch}
                    value={searchQuery}
                    style={styles.searchBar}
                />
            </View>

            {/* Sửa lại filter status: dùng FlatList ngang để không bị đè và lướt mượt */}
            <View style={{ paddingHorizontal: 12, marginBottom: 12 }}>
                <FlatList
                    data={[
                        { label: 'Tất cả', value: 'all', color: '#757575' },
                        { label: 'Đang xem xét', value: 'pending', color: '#2196F3' },
                        { label: 'Đã phỏng vấn', value: 'accepted', color: '#4CAF50' },
                        { label: 'Từ chối', value: 'rejected', color: '#F44336' },
                    ]}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item.value}
                    renderItem={({ item }) => {
                        const isSelected = statusFilter === item.value;
                        return (
                            <Chip
                                mode={isSelected ? 'flat' : 'outlined'}
                                style={[
                                    styles.statusFilterChip,
                                    isSelected && {
                                        backgroundColor: item.color + '22',
                                        borderColor: item.color,
                                        elevation: 2,
                                    },
                                ]}
                                textStyle={[
                                    styles.statusFilterChipText,
                                    isSelected && { color: item.color, fontWeight: 'bold' },
                                ]}
                                selected={isSelected}
                                onPress={() => handleStatusFilter(item.value)}
                                icon={isSelected ? 'check-circle' : undefined}
                            >
                                {item.label}
                            </Chip>
                        );
                    }}
                    contentContainerStyle={{ paddingRight: 12 }}
                />
            </View>

            {filteredCandidates.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Không tìm thấy ứng viên nào</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredCandidates}
                    renderItem={renderCandidateItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.candidateList}
                    showsVerticalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                />
            )}

            <Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)} anchor={{ x: 0, y: 0 }}>
                <Menu.Item
                    onPress={() => handleCandidatePress(selectedCandidate)}
                    title="Xem chi tiết"
                    icon="account-details"
                />
                <Menu.Item onPress={() => navigation.navigate("Chat")} title="Nhắn tin" icon="message-text" />
                <Divider />
                <Menu.Item onPress={() => handleAcceptCandidate(selectedCandidate)} title="Chấp nhận" icon="check-circle" />
                <Menu.Item onPress={() => handleRejectCandidate(selectedCandidate)} title="Từ chối" icon="close-circle" />
            </Menu>
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
        paddingTop: 50,
        paddingBottom: 25,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#FFFFFF",
        opacity: 0.9,
    },
    searchContainer: {
        padding: 16,
        paddingBottom: 8,
    },
    searchBar: {
        marginHorizontal: 16,
        marginVertical: 12,
        elevation: 2,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
    },
    filterContainer: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    filterChip: {
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
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
    },
    candidateList: {
        padding: 16,
        paddingTop: 8,
    },
    candidateCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        elevation: 4,
        backgroundColor: '#FFFFFF',
    },
    candidateHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    candidateInfo: {
        flexDirection: "row",
        alignItems: "flex-start",
        flex: 1,
    },
    avatar: {
        borderWidth: 3,
        borderColor: '#FFFFFF',
        elevation: 4,
    },
    candidateDetails: {
        marginLeft: 15,
        flex: 1,
    },
    candidateName: {
        fontSize: 20,
        fontWeight: "700",
        color: '#1F2937',
        marginBottom: 4,
    },
    candidateJob: {
        fontSize: 15,
        color: '#4B5563',
        marginBottom: 10,
        lineHeight: 20,
    },
    statusChip: {
        alignSelf: "flex-start",
        height: 28,
        borderRadius: 14,
    },
    statusText: {
        fontWeight: "600",
        fontSize: 13,
    },
    divider: {
        marginVertical: 15,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    candidateContent: {
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    infoText: {
        fontSize: 15,
        color: '#374151',
        marginLeft: 12,
        flex: 1,
    },
    actionButtons: {
        marginTop: 8,
        alignItems: 'center',
    },
    rejectButton: {
        flex: 1,
        marginRight: 12,
        borderColor: "#DC2626",
        borderWidth: 1.5,
    },
    rejectButtonLabel: {
        color: "#DC2626",
        fontSize: 15,
        fontWeight: "600",
    },
    acceptButton: {
        flex: 1,
        backgroundColor: "#059669",
    },
    chatButton: {
        flex: 1,
        borderColor: "#2563EB",
        borderWidth: 1.5,
    },
    reviewsSection: {
        marginTop: 8,
        marginBottom: 16,
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 8,
    },
    reviewsSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    emptyReviewsText: {
        fontSize: 14,
        color: '#6B7280',
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 12,
    },
    addReviewButton: {
        marginBottom: 16,
        borderColor: '#4F46E5',
    },
    reviewCard: {
        marginBottom: 8,
    },
    reviewButton: {
        flex: 1,
        marginLeft: 12,
        borderColor: "#4F46E5",
        borderWidth: 1.5,
    },
    reviewButtonActive: {
        backgroundColor: "#4F46E5",
    },
    statusFilterChip: {
        marginRight: 8,
        marginBottom: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        height: 36,
        justifyContent: 'center',
    },
    statusFilterChipText: {
        fontSize: 15,
        color: '#757575',
    },
    chatChip: {
        borderColor: '#1976D2',
        backgroundColor: '#E3F2FD',
    },
    chatChipText: {
        color: '#1976D2',
        fontWeight: 'bold',
    },
    reviewChip: {
        borderColor: '#FFD600',
        backgroundColor: '#FFF9C4',
    },
    reviewChipText: {
        color: '#FFD600',
        fontWeight: 'bold',
    },
})

export default ApplicationListScreen


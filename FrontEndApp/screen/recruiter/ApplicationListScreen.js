import { MaterialCommunityIcons } from "@expo/vector-icons"
import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect, useState } from "react"
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import { ActivityIndicator, Avatar, Button, Card, Chip, Divider, Menu, Searchbar, Text } from "react-native-paper"
import { ReviewCard } from "../../components/ui/ReviewCard"
import { ReviewForm } from "../../components/ui/ReviewForm"
import { fetchCandidateReviews } from '../../services/reviewService'

const ApplicationListScreen = ({ route, navigation }) => {
    const { jobId } = route.params || {};
    const [applications, setApplications] = useState([]);
    const [filteredCandidates, setFilteredCandidates] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [menuVisible, setMenuVisible] = useState(false)
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [expandedCardId, setExpandedCardId] = useState(null)
    const [candidateReviews, setCandidateReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    React.useEffect(() => {
        AsyncStorage.getItem('user').then(data => {
            if (data) setUser(JSON.parse(data));
        });
    }, []);

    // Lấy đánh giá cho ứng viên cụ thể
    const getReviewsForCandidate = (applicationId) => {
        return candidateReviews.filter(r => r.application === applicationId);
    };

    // Xem đánh giá và toggle hiển thị
    const toggleCardExpand = (candidateId) => {
        setExpandedCardId(expandedCardId === candidateId ? null : candidateId);
    };

    const getAccessToken = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken')
            return token
        } catch (error) {
            console.error('Error getting access token:', error)
            return null
        }
    }

    useEffect(() => {
        // Lọc ứng viên từ ApplicationContext
        let filtered = applications
        if (jobId) {
            filtered = filtered.filter(app => String(app.jobDetail?.id || app.job) === String(jobId))
        }
        setFilteredCandidates(filtered)
        // Tải đánh giá khi có ứng viên
        if (filtered.length > 0) {
            fetchCandidateReviews();
        }
    }, [applications, jobId])

    // Fetch applications from API (for recruiter)
    useEffect(() => {
        const fetchApplications = async () => {
            setLoading(true);
            try {
                const token = await AsyncStorage.getItem('accessToken');
                if (!token) throw new Error('No access token');
                // Sử dụng endpoint cho recruiter
                const response = await fetch('http://192.168.1.7:8000/applications/recruiter/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                // Nếu có .results thì lấy, không thì lấy luôn data
                const apps = data.results || data;
                setApplications(apps);
                setFilteredCandidates(apps);
            } catch (error) {
                console.error('Error fetching applications:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

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

    const filterCandidates = (query, status) => {
        let filtered = applications
        if (jobId) {
            filtered = filtered.filter(app => String(app.jobDetail?.id || app.job) === String(jobId))
        }
        if (query) {
            filtered = filtered.filter((candidate) => candidate.applicant_detail?.username?.toLowerCase().includes(query.toLowerCase()))
        }
        if (status !== "all") {
            filtered = filtered.filter((candidate) => candidate.status === status)
        }
        setFilteredCandidates(filtered)
    }

    const handleStatusFilter = (status) => {
        setStatusFilter(status)
        filterCandidates(searchQuery, status)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "Đang xem xét":
                return "#2196F3"
            case "Đã phỏng vấn":
                return "#4CAF50"
            case "Từ chối":
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
            const token = await getAccessToken()
            if (!token) {
                throw new Error('No access token found')
            }
            console.log(`Accepting candidate: http://192.168.1.5:8000/applications/${candidate.job_detail.id}/accept/`)

            const response = await fetch(`http://192.168.1.5:8000/applications/${candidate.job_detail.id}/accept/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to accept candidate')
            }

            const updatedCandidates = applications.map((c) => {
                if (c.id === candidate.id) {
                    return { ...c, status: "Đã phỏng vấn" }
                }
                return c
            })
            setCandidates(updatedCandidates)
            filterCandidates(searchQuery, statusFilter)
            setMenuVisible(false)
        } catch (error) {
            console.error('Error accepting candidate:', error)
        }
    }

    const handleRejectCandidate = async (candidate) => {
        try {
            const token = await getAccessToken()
            if (!token) {
                throw new Error('No access token found')
            }

            const response = await fetch(`http://192.168.1.5:8000/applications/${candidate.job_detail.id}/reject/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to reject candidate')
            }

            const updatedCandidates = applications.map((c) => {
                if (c.id === candidate.id) {
                    return { ...c, status: "Từ chối" }
                }
                return c
            })
            setCandidates(updatedCandidates)
            filterCandidates(searchQuery, statusFilter)
            setMenuVisible(false)
        } catch (error) {
            console.error('Error rejecting candidate:', error)
        }
    }

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
                                    {item.status}
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

                {/* Hiển thị đánh giá nếu card được mở rộng */}
                {expandedCardId === item.id && (
                    <View style={styles.reviewsSection}>
                        <Text style={styles.reviewsSectionTitle}>Đánh giá của bạn</Text>
                        
                        {/* Form thêm đánh giá mới */}
                        {showReviewForm ? (
                            <ReviewForm 
                                onSubmit={(reviewData) => handleReviewSubmit(item.id, reviewData)}
                                onCancel={() => setShowReviewForm(false)}
                            />
                        ) : (
                            <Button 
                                mode="outlined" 
                                icon="plus" 
                                onPress={() => setShowReviewForm(true)}
                                style={styles.addReviewButton}
                            >
                                Thêm đánh giá
                            </Button>
                        )}
                        
                        {/* Danh sách đánh giá hiện tại */}
                        {getReviewsForCandidate(item.id).length > 0 ? (
                            getReviewsForCandidate(item.id).map((review) => (
                                <ReviewCard 
                                    key={review.id}
                                    review={review}
                                    style={styles.reviewCard} 
                                />
                            ))
                        ) : (
                            <Text style={styles.emptyReviewsText}>
                                Chưa có đánh giá nào cho ứng viên này
                            </Text>
                        )}
                    </View>
                )}

                <View style={styles.actionButtons}>
                    {item.status === "Đang xem xét" ? (
                        <>
                            <Button
                                mode="outlined"
                                onPress={() => handleRejectCandidate(item)}
                                style={styles.rejectButton}
                                labelStyle={styles.rejectButtonLabel}
                                contentStyle={styles.buttonContent}
                            >
                                Từ chối
                            </Button>
                            <Button 
                                mode="contained" 
                                onPress={() => handleAcceptCandidate(item)} 
                                style={styles.acceptButton}
                                contentStyle={styles.buttonContent}
                            >
                                Chấp nhận
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                mode="outlined"
                                icon="message-text"
                                onPress={() => handleChatPress(item)}
                                style={[styles.chatButton, { flex: expandedCardId === item.id ? 1 : 2 }]}
                                contentStyle={styles.buttonContent}
                            >
                                Nhắn tin
                            </Button>
                            
                            <Button
                                mode={expandedCardId === item.id ? "contained" : "outlined"}
                                icon={expandedCardId === item.id ? "comment-minus" : "comment-text-multiple"}
                                onPress={() => toggleCardExpand(item.id)}
                                style={[
                                    styles.reviewButton,
                                    expandedCardId === item.id ? styles.reviewButtonActive : null
                                ]}
                                contentStyle={styles.buttonContent}
                            >
                                {expandedCardId === item.id ? "Thu gọn" : "Đánh giá"}
                            </Button>
                        </>
                    )}
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

            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Chip selected={statusFilter === "all"} onPress={() => handleStatusFilter("all")} style={styles.filterChip}>
                        Tất cả
                    </Chip>
                    <Chip
                        selected={statusFilter === "Đang xem xét"}
                        onPress={() => handleStatusFilter("Đang xem xét")}
                        style={styles.filterChip}
                    >
                        Đang xem xét
                    </Chip>
                    <Chip
                        selected={statusFilter === "Đã phỏng vấn"}
                        onPress={() => handleStatusFilter("Đã phỏng vấn")}
                        style={styles.filterChip}
                    >
                        Đã phỏng vấn
                    </Chip>
                    <Chip
                        selected={statusFilter === "Từ chối"}
                        onPress={() => handleStatusFilter("Từ chối")}
                        style={styles.filterChip}
                    >
                        Từ chối
                    </Chip>
                </ScrollView>
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
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    buttonContent: {
        paddingVertical: 8,
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
    }
})

export default ApplicationListScreen


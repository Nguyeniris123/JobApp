import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import { useCallback, useContext, useState } from "react"
import { FlatList, StyleSheet, View } from "react-native"
import { ActivityIndicator, Card, Chip, Divider, Text } from "react-native-paper"
import { ApplicationContext } from "../../contexts/ApplicationContext"
import { JobContext } from "../../contexts/JobContext"
import ChatServiceSimple from "../../services/ChatServiceSimple"

const ApplicationStatusScreen = ({ navigation }) => {
    const { applications, loading, error, fetchApplications } = useContext(ApplicationContext)
    const { fetchJobById } = useContext(JobContext)
    const [loadingChat, setLoadingChat] = useState(false)

    // Sử dụng useFocusEffect để tải lại dữ liệu khi màn hình được focus
    // Chỉ fetchApplications khi context chưa có dữ liệu
    useFocusEffect(
        useCallback(() => {
            if (!applications || applications.length === 0) {
                fetchApplications();
            }
        }, [applications, fetchApplications])
    )

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "#FFC107"
            case "reviewing":
                return "#2196F3"
            case "accepted":
                return "#4CAF50"
            case "rejected":
                return "#F44336"
            default:
                return "#9E9E9E"
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case "pending":
                return "Đang chờ"
            case "reviewing":
                return "Đang xem xét"
            case "accepted":
                return "Đã chấp nhận"
            case "rejected":
                return "Đã từ chối"
            default:
                return "Không xác định"
        }
    }

    const formatDate = (date) => {
        if (!date || !(date instanceof Date) || isNaN(date)) {
            return "Không xác định"
        }
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const handleNavigateToChat = async (item) => {
        setLoadingChat(true);
        try {
            // Lấy thông tin recruiter từ job_detail
            const recruiter = item.job_detail?.recruiter;
            // Lấy thông tin ứng viên
            const candidate = item.applicant_detail;
            // Lấy thông tin job
            const job = item.job_detail;

            // Gọi ChatServiceSimple để tạo hoặc lấy phòng chat, KHÔNG truyền companyInfo nữa
            const chatRoomId = await ChatServiceSimple.createOrGetChatRoom(
                recruiter?.id,
                candidate?.id,
                job?.id,
                recruiter ? {
                    id: recruiter.id,
                    first_name: recruiter.first_name,
                    last_name: recruiter.last_name,
                    username: recruiter.username,
                    email: recruiter.email,
                    avatar: recruiter.avatar
                } : null,
                candidate ? {
                    id: candidate.id,
                    first_name: candidate.first_name,
                    last_name: candidate.last_name,
                    username: candidate.username,
                    email: candidate.email,
                    avatar: candidate.avatar
                } : null,
                job ? {
                    id: job.id,
                    title: job.title,
                    specialized: job.specialized,
                    description: job.description,
                    salary: job.salary,
                    working_hours: job.working_hours,
                    location: job.location
                } : null
            );

            // Điều hướng sang màn hình chat, truyền đủ params để hiển thị
            navigation.navigate("Chat", {
                recruiterId: recruiter?.id,
                recruiterName: recruiter ? `${recruiter.last_name} ${recruiter.first_name}` : 'Nhà tuyển dụng',
                recruiterAvatar: recruiter?.avatar,
                jobId: job?.id,
                jobTitle: job?.title,
                company: recruiter?.company?.name,
                companyLogo: recruiter?.company?.images?.[0] || '',
                applicationId: item.id,
                recruiterInfo: recruiter,
                candidateInfo: candidate,
                jobInfo: job,
                roomId: chatRoomId
            });
        } catch (error) {
            alert("Không thể kết nối đến nhà tuyển dụng. Vui lòng thử lại sau.");
        } finally {
            setLoadingChat(false);
        }
    };

    const handleCardPress = (item) => {
        navigation.navigate('ApplicationDetail', {
            applicationId: item.id,
            jobId: item.job_detail?.id,
            cv: item.cv,
        });
    };

    const renderApplicationItem = ({ item }) => {
        const recruiter = item.job_detail?.recruiter;
        const company = recruiter?.company;
        const isAccepted = item.status === "accepted";
        return (
            <Card style={styles.card} onPress={() => handleCardPress(item)}>
                <Card.Content>
                    <View style={styles.cardHeader}>
                        <View style={styles.companyInfo}>
                            <View style={styles.logoContainer}>
                                <Card.Cover source={{ uri: company?.images?.[0] || 'https://via.placeholder.com/150' }} style={styles.logo} />
                            </View>
                            <View style={styles.jobInfo}>
                                <Text style={styles.jobTitle}>{item.job_detail?.title}</Text>
                                <Text style={styles.company}>{company?.name}</Text>
                            </View>
                        </View>
                        <Chip
                            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + "20" }]}
                            textStyle={{ color: getStatusColor(item.status) }}
                        >
                            {getStatusText(item.status)}
                        </Chip>
                    </View>
                    <Divider style={styles.divider} />
                    <View style={styles.dateInfo}>
                        <View style={styles.dateItem}>
                            <MaterialCommunityIcons name="calendar-plus" size={16} color="#757575" />
                            <Text style={styles.dateText}>Ngày ứng tuyển: {formatDate(item.appliedDate)}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                        <MaterialCommunityIcons name="account" size={18} color="#757575" />
                        <Text style={{ marginLeft: 6, fontSize: 14 }}>
                            Nhà tuyển dụng: {recruiter ? `${recruiter.first_name} ${recruiter.last_name}` : 'Không rõ'}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                        <MaterialCommunityIcons name="email" size={18} color="#757575" />
                        <Text style={{ marginLeft: 6, fontSize: 14 }}>
                            Email: {recruiter?.email || 'Không rõ'}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                        <MaterialCommunityIcons name="office-building" size={18} color="#757575" />
                        <Text style={{ marginLeft: 6, fontSize: 14 }}>
                            Địa chỉ công ty: {company?.location || 'Không rõ'}
                        </Text>
                    </View>
                    <View style={styles.actionContainer}>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <Chip 
                                icon={loadingChat ? "loading" : "chat"}
                                mode="outlined" 
                                style={styles.chatChip}
                                textStyle={styles.chatChipText}
                                disabled={loadingChat}
                                onPress={() => handleNavigateToChat(item)}
                            >
                                {loadingChat ? "Đang kết nối..." : "Trò chuyện với nhà tuyển dụng"}
                            </Chip>
                            {isAccepted && (
                                <Chip
                                    icon="star-outline"
                                    mode="outlined"
                                    style={[styles.chatChip, { marginLeft: 12, borderColor: '#FFD600', backgroundColor: '#FFFDE7' }]}
                                    textStyle={[styles.chatChipText, { color: '#FFD600' }]}
                                    onPress={() => navigation.navigate('CreateReview', { applicationId: item.id, jobId: item.job_detail?.id })}
                                >
                                    Đánh giá
                                </Chip>
                            )}
                        </View>
                    </View>
                </Card.Content>
            </Card>
        );
    }

    // Reload khi scroll lên đầu danh sách
    const handleScroll = (event) => {
        if (event.nativeEvent.contentOffset.y <= 0 && !loading) {
            fetchApplications();
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E88E5" />
                <Text style={styles.loadingText}>Đang tải danh sách đơn ứng tuyển...</Text>
            </View>
        )
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#F44336" />
                <Text style={styles.errorTitle}>Đã xảy ra lỗi</Text>
                <Text style={styles.errorText}>{error}</Text>
                <Card.Actions>
                    <Card.Actions>
                        <Chip 
                            icon="refresh" 
                            mode="outlined" 
                            onPress={() => fetchApplications()} 
                            style={styles.refreshButton}
                        >
                            Thử lại
                        </Chip>
                    </Card.Actions>
                </Card.Actions>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {applications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="file-document-outline" size={64} color="#BDBDBD" />
                    <Text style={styles.emptyText}>Bạn chưa ứng tuyển vào công việc nào</Text>
                    <Text style={styles.emptySubText}>
                        Hãy tìm kiếm và ứng tuyển vào các công việc phù hợp với bạn
                    </Text>
                    <Chip 
                        icon="magnify" 
                        mode="outlined" 
                        onPress={() => navigation.navigate("Home")} 
                        style={styles.browseJobsButton}
                    >
                        Tìm kiếm việc làm
                    </Chip>
                </View>
            ) : (
                <FlatList
                    data={applications}
                    renderItem={renderApplicationItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.applicationList}
                    showsVerticalScrollIndicator={false}
                    refreshing={loading}
                    onRefresh={fetchApplications}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                />
            )}
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
        backgroundColor: "#F5F5F5",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#616161",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#F5F5F5",
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 12,
        marginBottom: 8,
        color: "#F44336",
    },
    errorText: {
        fontSize: 16,
        color: "#757575",
        textAlign: "center",
        marginBottom: 20,
    },
    refreshButton: {
        backgroundColor: "#E3F2FD",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#424242",
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 16,
        color: "#757575",
        textAlign: "center",
        marginBottom: 24,
    },
    browseJobsButton: {
        backgroundColor: "#E3F2FD",
    },
    applicationList: {
        padding: 16,
    },
    card: {
        marginBottom: 16,
        borderRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    companyInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    logoContainer: {
        width: 50,
        height: 50,
        borderRadius: 8,
        overflow: "hidden",
        marginRight: 12,
    },
    logo: {
        width: 50,
        height: 50,
    },
    jobInfo: {
        flex: 1,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
    },
    company: {
        fontSize: 14,
        color: "#757575",
    },
    statusChip: {
        height: 28,
    },
    divider: {
        marginVertical: 12,
    },
    dateInfo: {
        marginBottom: 12,
    },
    dateItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    dateText: {
        fontSize: 14,
        color: "#757575",
        marginLeft: 8,
    },
    feedbackContainer: {
        backgroundColor: "#EEEEEE",
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    feedbackLabel: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 4,
    },
    feedbackText: {
        fontSize: 14,
        color: "#212121",
    },
    actionContainer: {
        marginTop: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    chatChip: {
        backgroundColor: "#E3F2FD",
        borderColor: "#1E88E5",
    },
    chatChipText: {
        color: "#1E88E5",
    },
})

export default ApplicationStatusScreen


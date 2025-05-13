import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import { useCallback, useContext, useState } from "react"
import { FlatList, StyleSheet, View } from "react-native"
import { ActivityIndicator, Card, Chip, Divider, Text } from "react-native-paper"
import { ApplicationContext } from "../../contexts/ApplicationContext"
import { JobContext } from "../../contexts/JobContext"

const ApplicationStatusScreen = ({ navigation }) => {
    const { applications, loading, error, fetchApplications } = useContext(ApplicationContext)
    const { fetchJobById } = useContext(JobContext)
    const [loadingChat, setLoadingChat] = useState(false)

    // Sử dụng useFocusEffect để tải lại dữ liệu khi màn hình được focus
    useFocusEffect(
        useCallback(() => {
            console.log("ApplicationStatusScreen focused, loading data...")
            fetchApplications()
        }, [fetchApplications])
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
        if (item.status !== "accepted") return;
        
        setLoadingChat(true);
        try {
            // Lấy thông tin chi tiết về công việc từ JobContext nếu item.job có giá trị
            const jobId = item.job; 
            let jobDetails = item.jobDetail;
            
            // Tìm thông tin về nhà tuyển dụng
            if (jobId && !jobDetails?.recruiter?.id) {
                console.log("Fetching job details for jobId:", jobId);
                jobDetails = await fetchJobById(jobId);
                console.log("Received job details:", jobDetails);
            }
            
            // Log để debug
            console.log("Job details to use for chat:", {
                job: jobId,
                recruiter: jobDetails?.recruiter,
                company: jobDetails?.company?.name || item.company
            });
            
            // Tạo object navigation params từ dữ liệu có sẵn hoặc jobDetails
            const chatParams = {
                recruiterId: jobDetails?.recruiter?.id,
                recruiterName: jobDetails?.recruiter?.name || "Nhà tuyển dụng",
                recruiterAvatar: jobDetails?.recruiter?.avatar || item.companyLogo,
                jobId: jobId,
                jobTitle: jobDetails?.title || item.jobTitle,
                company: jobDetails?.company?.name || item.company
            };
            
            console.log("Navigating to chat with params:", chatParams);
            navigation.navigate("Chat", chatParams);
        } catch (error) {
            console.error("Lỗi khi chuyển đến màn hình Chat:", error);
            // Hiển thị thông báo lỗi cho người dùng
            alert("Không thể kết nối đến nhà tuyển dụng. Vui lòng thử lại sau.");
        } finally {
            setLoadingChat(false);
        }
    };

    const renderApplicationItem = ({ item }) => (
        <Card 
            style={styles.card} 
            onPress={() => {
                if (item.status === "accepted") {
                    handleNavigateToChat(item);
                }
            }}
        >
            <Card.Content>
                <View style={styles.cardHeader}>
                    <View style={styles.companyInfo}>
                        <View style={styles.logoContainer}>
                            <Card.Cover source={{ uri: item.companyLogo }} style={styles.logo} />
                        </View>
                        <View style={styles.jobInfo}>
                            <Text style={styles.jobTitle}>{item.jobTitle}</Text>
                            <Text style={styles.company}>{item.company}</Text>
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
                    <View style={styles.dateItem}>
                        <MaterialCommunityIcons name="calendar-clock" size={16} color="#757575" />
                        <Text style={styles.dateText}>Cập nhật: {formatDate(item.lastUpdated)}</Text>
                    </View>
                </View>

                {item.feedback && (
                    <View style={styles.feedbackContainer}>
                        <Text style={styles.feedbackLabel}>Phản hồi:</Text>
                        <Text style={styles.feedbackText}>{item.feedback}</Text>
                    </View>
                )}

                {item.status === "accepted" && (
                    <View style={styles.actionContainer}>
                        <Chip 
                            icon={loadingChat ? "loading" : "chat"}
                            mode="outlined" 
                            style={styles.chatChip}
                            textStyle={styles.chatChipText}
                            disabled={loadingChat}
                        >
                            {loadingChat ? "Đang kết nối..." : "Trò chuyện với nhà tuyển dụng"}
                        </Chip>
                    </View>
                )}
            </Card.Content>
        </Card>
    )

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
            <View style={styles.header}>
                <Text style={styles.title}>Trạng thái ứng tuyển</Text>
            </View>

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


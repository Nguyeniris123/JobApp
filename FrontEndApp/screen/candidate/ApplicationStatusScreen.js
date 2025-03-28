import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { FlatList, StyleSheet, View } from "react-native"
import { ActivityIndicator, Card, Chip, Divider, Text } from "react-native-paper"

// Mock data for applications
const mockApplications = [
    {
        id: "1",
        jobTitle: "Nhân viên bán hàng bán thời gian",
        company: "Công ty ABC",
        companyLogo: "https://via.placeholder.com/150",
        status: "pending",
        appliedDate: new Date(2023, 3, 20),
        lastUpdated: new Date(2023, 3, 20),
    },
    {
        id: "2",
        jobTitle: "Gia sư Toán cấp 3",
        company: "Trung tâm gia sư XYZ",
        companyLogo: "https://via.placeholder.com/150",
        status: "reviewing",
        appliedDate: new Date(2023, 3, 15),
        lastUpdated: new Date(2023, 3, 18),
    },
    {
        id: "3",
        jobTitle: "Nhân viên phục vụ quán cà phê",
        company: "Cà phê DEF",
        companyLogo: "https://via.placeholder.com/150",
        status: "accepted",
        appliedDate: new Date(2023, 3, 10),
        lastUpdated: new Date(2023, 3, 12),
    },
    {
        id: "4",
        jobTitle: "Trợ giảng lập trình",
        company: "Trung tâm đào tạo GHI",
        companyLogo: "https://via.placeholder.com/150",
        status: "rejected",
        appliedDate: new Date(2023, 3, 5),
        lastUpdated: new Date(2023, 3, 8),
        feedback: "Chúng tôi cần ứng viên có kinh nghiệm nhiều hơn trong lĩnh vực này.",
    },
]

const ApplicationStatusScreen = ({ navigation }) => {
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Simulate API call
        const fetchApplications = async () => {
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000))
                setApplications(mockApplications)
            } catch (error) {
                console.log("Error fetching applications:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchApplications()
    }, [])

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
        return new Date(date).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const renderApplicationItem = ({ item }) => (
        <Card style={styles.card} onPress={() => navigation.navigate("Chat")}>
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
                        <Text style={styles.actionText}>Nhấn để trò chuyện với nhà tuyển dụng</Text>
                    </View>
                )}
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
            <View style={styles.header}>
                <Text style={styles.title}>Trạng thái ứng tuyển</Text>
            </View>

            {applications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Bạn chưa ứng tuyển vào công việc nào</Text>
                </View>
            ) : (
                <FlatList
                    data={applications}
                    renderItem={renderApplicationItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.applicationList}
                    showsVerticalScrollIndicator={false}
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
    },
    actionText: {
        fontSize: 14,
        color: "#1E88E5",
        fontWeight: "bold",
    },
})

export default ApplicationStatusScreen


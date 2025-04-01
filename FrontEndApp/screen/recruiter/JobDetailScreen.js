import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, View } from "react-native"
import { ActivityIndicator, Button, Card, Chip, Divider, IconButton, List, Menu, Text } from "react-native-paper"

// Mock data for job details
const mockJob = {
    id: "1",
    title: "Nhân viên bán hàng bán thời gian",
    location: "Hà Nội",
    salary: 5000000,
    category: "Bán hàng",
    description: "Chúng tôi đang tìm kiếm nhân viên bán hàng bán thời gian làm việc tại cửa hàng của chúng tôi ở Hà Nội.",
    requirements: ["Tối thiểu 18 tuổi", "Có khả năng giao tiếp tốt", "Có thể làm việc vào cuối tuần"],
    benefits: ["Lương cạnh tranh", "Môi trường làm việc năng động", "Cơ hội thăng tiến"],
    type: "Bán thời gian",
    hours: "20 giờ/tuần",
    postedDate: new Date(2023, 3, 15),
    deadline: new Date(2023, 4, 15),
    status: "active",
    applicants: 12,
    views: 156,
    savedBy: 8,
}

// Mock data for applicants
const mockApplicants = [
    {
        id: "1",
        name: "Nguyễn Văn A",
        avatar: "https://via.placeholder.com/150",
        appliedDate: new Date(2023, 3, 16),
        status: "pending",
        matchRate: 85,
    },
    {
        id: "2",
        name: "Trần Thị B",
        avatar: "https://via.placeholder.com/150",
        appliedDate: new Date(2023, 3, 17),
        status: "reviewing",
        matchRate: 92,
    },
    {
        id: "3",
        name: "Lê Văn C",
        avatar: "https://via.placeholder.com/150",
        appliedDate: new Date(2023, 3, 18),
        status: "accepted",
        matchRate: 78,
    },
]

const RecruiterJobDetailScreen = ({ route, navigation }) => {
    const { jobId } = route.params || { jobId: "1" }
    const [job, setJob] = useState(null)
    const [applicants, setApplicants] = useState([])
    const [loading, setLoading] = useState(true)
    const [menuVisible, setMenuVisible] = useState(false)

    useEffect(() => {
        // Simulate API call
        const fetchJobDetails = async () => {
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000))
                setJob(mockJob)
                setApplicants(mockApplicants)
            } catch (error) {
                console.log("Error fetching job details:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchJobDetails()
    }, [jobId])

    const formatSalary = (salary) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(salary)
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const handleEditJob = () => {
        navigation.navigate("PostJob", { jobId: job.id, isEditing: true })
    }

    const handleCloseJob = () => {
        Alert.alert("Đóng tin tuyển dụng", "Bạn có chắc chắn muốn đóng tin tuyển dụng này?", [
            {
                text: "Hủy",
                style: "cancel",
            },
            {
                text: "Đóng tin",
                onPress: () => {
                    // Simulate API call
                    setTimeout(() => {
                        Alert.alert("Thành công", "Tin tuyển dụng đã được đóng")
                        setJob({ ...job, status: "closed" })
                    }, 1000)
                },
            },
        ])
    }

    const handleDeleteJob = () => {
        Alert.alert(
            "Xóa tin tuyển dụng",
            "Bạn có chắc chắn muốn xóa tin tuyển dụng này? Hành động này không thể hoàn tác.",
            [
                {
                    text: "Hủy",
                    style: "cancel",
                },
                {
                    text: "Xóa tin",
                    onPress: () => {
                        // Simulate API call
                        setTimeout(() => {
                            Alert.alert("Thành công", "Tin tuyển dụng đã được xóa")
                            navigation.goBack()
                        }, 1000)
                    },
                    style: "destructive",
                },
            ],
        )
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return "#4CAF50"
            case "closed":
                return "#F44336"
            case "expired":
                return "#9E9E9E"
            default:
                return "#9E9E9E"
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case "active":
                return "Đang hiển thị"
            case "closed":
                return "Đã đóng"
            case "expired":
                return "Hết hạn"
            default:
                return "Không xác định"
        }
    }

    const getApplicantStatusColor = (status) => {
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

    const getApplicantStatusText = (status) => {
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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E88E5" />
            </View>
        )
    }

    if (!job) {
        return (
            <View style={styles.errorContainer}>
                <Text>Không tìm thấy thông tin công việc</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={styles.title}>{job.title}</Text>
                        <Chip
                            style={[styles.statusChip, { backgroundColor: getStatusColor(job.status) + "20" }]}
                            textStyle={{ color: getStatusColor(job.status) }}
                        >
                            {getStatusText(job.status)}
                        </Chip>
                    </View>
                    <Menu
                        visible={menuVisible}
                        onDismiss={() => setMenuVisible(false)}
                        anchor={<IconButton icon="dots-vertical" color="#FFFFFF" size={24} onPress={() => setMenuVisible(true)} />}
                    >
                        <Menu.Item onPress={handleEditJob} title="Chỉnh sửa" />
                        <Menu.Item onPress={handleCloseJob} title="Đóng tin" />
                        <Divider />
                        <Menu.Item onPress={handleDeleteJob} title="Xóa tin" />
                    </Menu>
                </View>

                <Card style={styles.statsCard}>
                    <Card.Content style={styles.statsContent}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{job.applicants}</Text>
                            <Text style={styles.statLabel}>Ứng viên</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{job.views}</Text>
                            <Text style={styles.statLabel}>Lượt xem</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{job.savedBy}</Text>
                            <Text style={styles.statLabel}>Đã lưu</Text>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Thông tin công việc</Text>

                        <View style={styles.infoContainer}>
                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="map-marker" size={20} color="#757575" />
                                <Text style={styles.infoText}>{job.location}</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="currency-usd" size={20} color="#757575" />
                                <Text style={styles.infoText}>{formatSalary(job.salary)}</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="tag" size={20} color="#757575" />
                                <Text style={styles.infoText}>{job.category}</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="clock-outline" size={20} color="#757575" />
                                <Text style={styles.infoText}>{job.hours}</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="calendar" size={20} color="#757575" />
                                <Text style={styles.infoText}>Đăng ngày: {formatDate(job.postedDate)}</Text>
                            </View>

                            <View style={styles.infoItem}>
                                <MaterialCommunityIcons name="calendar-clock" size={20} color="#757575" />
                                <Text style={styles.infoText}>Hạn nộp hồ sơ: {formatDate(job.deadline)}</Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Mô tả công việc</Text>
                        <Text style={styles.description}>{job.description}</Text>
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Yêu cầu</Text>
                        <List.Section>
                            {job.requirements.map((requirement, index) => (
                                <List.Item
                                    key={index}
                                    title={requirement}
                                    left={() => <List.Icon icon="check" color="#1E88E5" />}
                                    titleStyle={styles.listItemTitle}
                                />
                            ))}
                        </List.Section>
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Quyền lợi</Text>
                        <List.Section>
                            {job.benefits.map((benefit, index) => (
                                <List.Item
                                    key={index}
                                    title={benefit}
                                    left={() => <List.Icon icon="star" color="#FF8F00" />}
                                    titleStyle={styles.listItemTitle}
                                />
                            ))}
                        </List.Section>
                    </Card.Content>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.applicantsHeader}>
                            <Text style={styles.sectionTitle}>Ứng viên ({applicants.length})</Text>
                            <Button mode="text" onPress={() => navigation.navigate("CandidateList", { jobId: job.id })}>
                                Xem tất cả
                            </Button>
                        </View>

                        {applicants.length === 0 ? (
                            <Text style={styles.emptyText}>Chưa có ứng viên nào</Text>
                        ) : (
                            applicants.map((applicant) => (
                                <Card key={applicant.id} style={styles.applicantCard} onPress={() => navigation.navigate("Chat")}>
                                    <Card.Content style={styles.applicantContent}>
                                        <View style={styles.applicantInfo}>
                                            <Card.Cover source={{ uri: applicant.avatar }} style={styles.applicantAvatar} />
                                            <View style={styles.applicantDetails}>
                                                <Text style={styles.applicantName}>{applicant.name}</Text>
                                                <Text style={styles.applicantDate}>Ứng tuyển: {formatDate(applicant.appliedDate)}</Text>
                                                <Chip
                                                    style={[
                                                        styles.applicantStatusChip,
                                                        { backgroundColor: getApplicantStatusColor(applicant.status) + "20" },
                                                    ]}
                                                    textStyle={{ color: getApplicantStatusColor(applicant.status) }}
                                                >
                                                    {getApplicantStatusText(applicant.status)}
                                                </Chip>
                                            </View>
                                        </View>
                                        <View style={styles.matchRate}>
                                            <Text style={styles.matchRateValue}>{applicant.matchRate}%</Text>
                                            <Text style={styles.matchRateLabel}>Phù hợp</Text>
                                        </View>
                                    </Card.Content>
                                </Card>
                            ))
                        )}
                    </Card.Content>
                </Card>
            </ScrollView>

            <View style={styles.footer}>
                <Button mode="outlined" icon="pencil" onPress={handleEditJob} style={styles.editButton}>
                    Chỉnh sửa
                </Button>
                <Button
                    mode="contained"
                    icon="account-search"
                    onPress={() => navigation.navigate("CandidateList", { jobId: job.id })}
                    style={styles.viewApplicantsButton}
                >
                    Xem ứng viên
                </Button>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        padding: 20,
        paddingTop: 40,
        backgroundColor: "#1E88E5",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    headerContent: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    statusChip: {
        alignSelf: "flex-start",
    },
    statsCard: {
        margin: 16,
        marginTop: -20,
        borderRadius: 8,
        elevation: 4,
    },
    statsContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1E88E5",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#757575",
    },
    statDivider: {
        width: 1,
        backgroundColor: "#EEEEEE",
    },
    card: {
        margin: 16,
        marginTop: 0,
        marginBottom: 16,
        borderRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
        color: "#212121",
    },
    infoContainer: {
        marginBottom: 8,
    },
    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    infoText: {
        marginLeft: 8,
        fontSize: 14,
        color: "#212121",
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
        color: "#212121",
    },
    listItemTitle: {
        fontSize: 14,
        color: "#212121",
    },
    applicantsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 14,
        color: "#757575",
        textAlign: "center",
        marginVertical: 16,
    },
    applicantCard: {
        marginBottom: 12,
        borderRadius: 8,
        elevation: 1,
    },
    applicantContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    applicantInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    applicantAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    applicantDetails: {
        marginLeft: 12,
        flex: 1,
    },
    applicantName: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
    },
    applicantDate: {
        fontSize: 12,
        color: "#757575",
        marginBottom: 4,
    },
    applicantStatusChip: {
        alignSelf: "flex-start",
        height: 24,
    },
    matchRate: {
        alignItems: "center",
        marginLeft: 8,
    },
    matchRateValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#4CAF50",
    },
    matchRateLabel: {
        fontSize: 12,
        color: "#757575",
    },
    footer: {
        flexDirection: "row",
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#EEEEEE",
        backgroundColor: "#FFFFFF",
    },
    editButton: {
        flex: 1,
        marginRight: 8,
    },
    viewApplicantsButton: {
        flex: 2,
    },
})

export default RecruiterJobDetailScreen


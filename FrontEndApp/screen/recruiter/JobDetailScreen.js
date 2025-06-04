import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useContext, useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, View } from "react-native"
import { ActivityIndicator, Button, Card, Chip, Divider, IconButton, Menu, Text } from "react-native-paper"
import { ApplicationContext } from "../../contexts/ApplicationContext"
import { JobContext } from "../../contexts/JobContext"

const RecruiterJobDetailScreen = ({ route, navigation }) => {
    const { jobId } = route.params || { jobId: "1" }
    const { fetchJobById } = useContext(JobContext)
    const { applications, fetchApplications, loading: loadingApplications } = useContext(ApplicationContext)
    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)
    const [menuVisible, setMenuVisible] = useState(false)
    const [applicants, setApplicants] = useState([])

    useEffect(() => {
        const fetchJob = async () => {
            setLoading(true)
            try {
                const data = await fetchJobById(jobId)
                setJob(data)
            } catch (error) {
                console.log("Error fetching job details:", error)
            } finally {
                setLoading(false)
            }
        }
        if (jobId) fetchJob()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobId])

    useEffect(() => {
        // Lọc ứng viên đúng với jobId hiện tại
        if (applications && jobId) {
            setApplicants(applications.filter(app => String(app.job) === String(jobId)))
        }
    }, [applications, jobId])

    const formatSalary = (salary) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(salary)
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
                                <MaterialCommunityIcons name="office-building" size={20} color="#757575" />
                                <Text style={styles.infoText}>{job.recruiter?.company?.name || '---'}</Text>
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
                        <View style={styles.applicantsHeader}>
                            <Text style={styles.sectionTitle}>Ứng viên ({applicants.length})</Text>
                        </View>
                        {applicants.length === 0 ? (
                            <Text style={styles.emptyText}>Chưa có ứng viên nào</Text>
                        ) : (
                            applicants.map((applicant) => (
                                <Card key={applicant.id} style={styles.applicantCard}>
                                    <Card.Content style={styles.applicantContent}>
                                        <View style={styles.applicantInfo}>
                                            <Card.Cover source={{ uri: applicant.applicant_detail?.avatar }} style={styles.applicantAvatar} />
                                            <View style={styles.applicantDetails}>
                                                <Text style={styles.applicantName}>{applicant.applicant_detail?.first_name} {applicant.applicant_detail?.last_name}</Text>
                                                <Text style={styles.applicantDate}>Email: {applicant.applicant_detail?.email}</Text>
                                                <Chip style={styles.applicantStatusChip}>{getApplicantStatusText(applicant.status)}</Chip>
                                            </View>
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


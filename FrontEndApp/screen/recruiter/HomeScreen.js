import { MaterialCommunityIcons } from "@expo/vector-icons"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useContext, useEffect, useMemo, useState } from "react"
import { Alert, ScrollView, TouchableOpacity, View } from "react-native"
import { ActivityIndicator, Avatar, Button, Card, Chip, Dialog, FAB, Portal, Searchbar, Text } from "react-native-paper"
import { JobContext } from "../../contexts/JobContext"

const HomeScreen = ({ navigation }) => {
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [stats, setStats] = useState({
        totalJobs: 0,
        activeJobs: 0,
        totalApplicants: 0,
        newApplicants: 0,
    })
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    const { fetchRecruiterJobs, deleteJob } = useContext(JobContext)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const accessToken = await AsyncStorage.getItem('accessToken')
                const jobsData = await fetchRecruiterJobs(accessToken)

                setJobs(jobsData)

                const totalJobs = jobsData.length
                const activeJobs = jobsData.filter((job) => job.status === "active").length
                const totalApplicants = jobsData.reduce((sum, job) => sum + job.applicants, 0)

                setStats({
                    totalJobs,
                    activeJobs,
                    totalApplicants,
                    newApplicants: 3,
                })
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const formatSalary = (salary) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(salary)
    }

    const formatDate = (date) => {
        const now = new Date()
        const diffTime = Math.abs(now - new Date(date))
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) {
            return "Hôm nay"
        } else if (diffDays === 1) {
            return "Hôm qua"
        } else {
            return `${diffDays} ngày trước`
        }
    }

    const filteredJobs = useMemo(() => {
        return jobs.filter(job =>
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [jobs, searchQuery]);

    useEffect(() => {
        const totalJobs = filteredJobs.length;
        const activeJobs = filteredJobs.filter((job) => job.status === "active").length;
        const totalApplicants = filteredJobs.reduce((sum, job) => sum + job.applicants, 0);

        setStats({
            totalJobs,
            activeJobs,
            totalApplicants,
            newApplicants: stats.newApplicants,
        });
    }, [filteredJobs]);

    const handleDeleteJob = async () => {
        if (selectedJob) {
            try {
                const accessToken = await AsyncStorage.getItem('accessToken')
                const success = await deleteJob(selectedJob.id, accessToken);
                if (success) {
                    const updatedJobs = await fetchRecruiterJobs(accessToken);
                    setJobs(updatedJobs);
                }
            } catch (error) {
                Alert.alert("Lỗi", "Không thể xóa tin tuyển dụng này");
            }
        }
        setDeleteDialogVisible(false);
        setSelectedJob(null);
    };

    const showDeleteDialog = (job) => {
        setSelectedJob(job);
        setDeleteDialogVisible(true);
    };

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
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>Xin chào!</Text>
                        <Text style={styles.companyName}>Công ty ABC</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate("CompanyProfile")}>
                        <Avatar.Image source={{ uri: "https://via.placeholder.com/150" }} size={50} />
                    </TouchableOpacity>
                </View>
                <Searchbar
                    placeholder="Tìm kiếm tin tuyển dụng..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.statsContainer}>
                    <Card style={styles.statsCard}>
                        <Card.Content style={styles.statsContent}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{stats.totalJobs}</Text>
                                <Text style={styles.statLabel}>Tổng tin đăng</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{stats.activeJobs}</Text>
                                <Text style={styles.statLabel}>Đang hoạt động</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{stats.totalApplicants}</Text>
                                <Text style={styles.statLabel}>Tổng ứng viên</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{stats.newApplicants}</Text>
                                <Text style={styles.statLabel}>Ứng viên mới</Text>
                            </View>
                        </Card.Content>
                    </Card>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Tin tuyển dụng của bạn</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAll}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>

                    {filteredJobs.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {jobs.length === 0 ? "Bạn chưa đăng tin tuyển dụng nào" : "Không tìm thấy tin tuyển dụng phù hợp"}
                            </Text>
                            <Button mode="contained" onPress={() => navigation.navigate("PostJob")} style={styles.postButton}>
                                Đăng tin ngay
                            </Button>
                        </View>
                    ) : (
                        filteredJobs.map((job) => (
                            <Card
                                key={job.id}
                                style={styles.jobCard}
                            >
                                <Card.Content>
                                    <TouchableOpacity onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}>
                                        <View style={styles.jobHeader}>
                                            <Text style={styles.jobTitle}>{job.title}</Text>
                                            <Chip
                                                style={[
                                                    styles.statusChip,
                                                    {
                                                        backgroundColor: job.status === "active" ? "#4CAF50" : "#9E9E9E",
                                                    },
                                                ]}
                                                textStyle={{ color: "#FFFFFF" }}
                                            >
                                                {job.status === "active" ? "Đang hiển thị" : "Hết hạn"}
                                            </Chip>
                                        </View>

                                        <View style={styles.jobDetails}>
                                            <View style={styles.jobDetail}>
                                                <MaterialCommunityIcons name="map-marker" size={16} color="#757575" />
                                                <Text style={styles.jobDetailText}>{job.location}</Text>
                                            </View>
                                            <View style={styles.jobDetail}>
                                                <MaterialCommunityIcons name="currency-usd" size={16} color="#757575" />
                                                <Text style={styles.jobDetailText}>{formatSalary(job.salary)}</Text>
                                            </View>
                                            <View style={styles.jobDetail}>
                                                <MaterialCommunityIcons name="calendar" size={16} color="#757575" />
                                                <Text style={styles.jobDetailText}>Đăng {formatDate(job.postedDate)}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.jobStats}>
                                            <View style={styles.jobStat}>
                                                <MaterialCommunityIcons name="account-outline" size={20} color="#1E88E5" />
                                                <Text style={styles.jobStatText}>{job.applicants} ứng viên</Text>
                                            </View>
                                            <View style={styles.jobStat}>
                                                <MaterialCommunityIcons name="eye-outline" size={20} color="#1E88E5" />
                                                <Text style={styles.jobStatText}>{job.views} lượt xem</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                    <View style={styles.jobActions}>
                                        <Button
                                            mode="contained"
                                            onPress={() => navigation.navigate("EditJob", { jobId: job.id })}
                                            style={[styles.actionButton, styles.editButton]}
                                        >
                                            Chỉnh sửa
                                        </Button>
                                        <Button
                                            mode="contained"
                                            onPress={() => showDeleteDialog(job)}
                                            style={[styles.actionButton, styles.deleteButton]}
                                        >
                                            Xóa
                                        </Button>
                                    </View>
                                </Card.Content>
                            </Card>
                        ))
                    )}
                </View>
            </ScrollView>

            <Portal>
                <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
                    <Dialog.Title>Xác nhận xóa</Dialog.Title>
                    <Dialog.Content>
                        <Text>Bạn có chắc chắn muốn xóa tin tuyển dụng này?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDeleteDialogVisible(false)}>Hủy</Button>
                        <Button onPress={handleDeleteJob}>Xóa</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => navigation.navigate("PostJob")}
            />
        </View>
    )
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 16,
        color: '#757575',
    },
    companyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212121',
    },
    statsContainer: {
        padding: 16,
    },
    statsCard: {
        elevation: 4,
    },
    statsContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E88E5',
    },
    statLabel: {
        fontSize: 12,
        color: '#757575',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#E0E0E0',
    },
    section: {
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
    },
    viewAll: {
        color: '#1E88E5',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 24,
    },
    emptyText: {
        fontSize: 16,
        color: '#757575',
        marginBottom: 16,
    },
    postButton: {
        backgroundColor: '#1E88E5',
    },
    jobCard: {
        marginBottom: 16,
        elevation: 2,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
    },
    statusChip: {
        height: 32,
    },
    jobDetails: {
        marginBottom: 8,
    },
    jobDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    jobDetailText: {
        marginLeft: 4,
        color: '#757575',
    },
    jobStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingTop: 8,
    },
    jobStat: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    jobStatText: {
        marginLeft: 4,
        color: '#1E88E5',
    },
    jobActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    actionButton: {
        marginLeft: 8,
    },
    editButton: {
        backgroundColor: '#1E88E5',
    },
    deleteButton: {
        backgroundColor: '#F44336',
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        backgroundColor: '#1E88E5',
    },
    searchBar: {
        marginTop: 16,
        elevation: 0,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
}

export default HomeScreen

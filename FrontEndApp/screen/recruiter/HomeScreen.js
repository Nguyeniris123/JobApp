import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useContext, useEffect, useMemo, useState } from "react"
import { Alert, RefreshControl, ScrollView, TouchableOpacity, View } from "react-native"
import { ActivityIndicator, Avatar, Button, Card, Dialog, FAB, Portal, Searchbar, Text } from "react-native-paper"
import { AuthContext } from "../../contexts/AuthContext"
import { JobContext } from "../../contexts/JobContext"

const HomeScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext)
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [stats, setStats] = useState({
        totalJobs: 0,
        totalApplicants: 0,
    })
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    const { fetchRecruiterJobs, deleteJob } = useContext(JobContext)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Đảm bảo chỉ dùng context, không lấy accessToken từ AsyncStorage
                const jobsData = await fetchRecruiterJobs()
                setJobs(jobsData)
                const totalJobs = jobsData.length
                // Dùng application_count nếu có, nếu không thì 0
                const totalApplicants = jobsData.reduce((sum, job) => sum + (job.application_count || 0), 0)
                setStats({
                    totalJobs,
                    totalApplicants,
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
        const totalApplicants = filteredJobs.reduce((sum, job) => sum + (job.application_count || 0), 0);
        setStats({
            totalJobs,
            totalApplicants,
        });
    }, [filteredJobs]);

    const handleDeleteJob = async () => {
        if (selectedJob) {
            try {
                const success = await deleteJob(selectedJob.id);
                if (success) {
                    const updatedJobs = await fetchRecruiterJobs();
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

    // Thêm hàm reload khi scroll lên đầu
    const handleScroll = async (event) => {
        const y = event.nativeEvent.contentOffset.y;
        if (y <= 0) {
            setLoading(true);
            try {
                const jobsData = await fetchRecruiterJobs();
                setJobs(jobsData);
                const totalJobs = jobsData.length;
                const totalApplicants = jobsData.reduce((sum, job) => sum + (job.application_count || 0), 0);
                setStats({ totalJobs, totalApplicants });
            } catch (error) {
                console.error("Lỗi khi reload dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        }
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
                        <Text style={styles.companyName}>{user?.company?.name || "Công ty của bạn"}</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate("CompanyProfile")}>
                        <Avatar.Image 
                            source={{ uri: user?.avatar || "https://via.placeholder.com/150" }} 
                            size={50} 
                        />
                    </TouchableOpacity>
                </View>
                <Searchbar
                    placeholder="Tìm kiếm tin tuyển dụng..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={async () => {
                            setLoading(true);
                            try {
                                const jobsData = await fetchRecruiterJobs();
                                setJobs(jobsData);
                                const totalJobs = jobsData.length;
                                const totalApplicants = jobsData.reduce((sum, job) => sum + (job.application_count || 0), 0);
                                setStats({ totalJobs, totalApplicants });
                            } catch (error) {
                                console.error("Lỗi khi reload dữ liệu:", error);
                            } finally {
                                setLoading(false);
                            }
                        }}
                        colors={["#1E88E5"]}
                    />
                }
            >
                <View style={styles.statsContainer}>
                    <Card style={styles.statsCard}>
                        <Card.Content style={styles.statsContent}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{stats.totalJobs}</Text>
                                <Text style={styles.statLabel}>Tổng tin đăng</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{stats.totalApplicants}</Text>
                                <Text style={styles.statLabel}>Tổng ứng viên</Text>
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
                                        </View>
                                        <View style={styles.jobStats}>
                                            <View style={styles.jobStat}>
                                                <MaterialCommunityIcons name="account-outline" size={20} color="#1E88E5" />
                                                <Text style={styles.jobStatText}>{job.application_count || 0} ứng viên</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                    <View style={styles.jobActions}>
                                        <Button
                                            mode="contained"
                                            onPress={() => navigation.navigate("PostJob", { jobId: job.id })}
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
        backgroundColor: '#F8FAFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
        paddingTop: 50, // Increased for status bar
        backgroundColor: '#1E88E5',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Changed to prevent compression
        marginBottom: 20,
    },
    greeting: {
        fontSize: 16,
        color: '#E3F2FD',
    },
    companyName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 4, // Added spacing
    },
    statsContainer: {
        marginTop: -30,
        padding: 16,
    },
    statsCard: {
        elevation: 8,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    statsContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E88E5',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#757575',
        textAlign: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 8,
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
        borderRadius: 16,
        elevation: 4,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        padding: 16, // Added padding for content
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Changed to prevent text compression
        marginBottom: 12, // Increased for better spacing
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E88E5',
        flex: 1, // Allow text to take available space
        marginRight: 8, // Provide space for status chip
    },
    statusChip: {
        height: 32,
    },
    jobDetails: {
        marginBottom: 12, // Increased for better spacing
    },
    jobDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6, // Increased vertical spacing
    },
    jobDetailText: {
        marginLeft: 8,
        color: '#424242',
        flex: 1,
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
        borderRadius: 8,
        marginHorizontal: 4,
        flex: 1,
    },
    editButton: {
        backgroundColor: '#1E88E5',
    },
    deleteButton: {
        backgroundColor: '#EF5350',
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        backgroundColor: '#1E88E5',
        borderRadius: 28,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    searchBar: {
        elevation: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 12,
    },
}

export default HomeScreen

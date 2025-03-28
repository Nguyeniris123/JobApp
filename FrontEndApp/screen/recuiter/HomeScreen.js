
import { MaterialCommunityIcons } from "@expo/vector-icons"
import axios from "axios"
import { useEffect, useState } from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"
import { ActivityIndicator, Avatar, Button, Card, Chip, FAB, Text } from "react-native-paper"

const API_URL = "https://your-api.com/api/jobs" // Cập nhật đường dẫn API

const HomeScreen = ({ navigation }) => {
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalJobs: 0,
        activeJobs: 0,
        totalApplicants: 0,
        newApplicants: 0,
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(API_URL)
                const jobsData = response.data

                setJobs(jobsData)

                // Tính toán thống kê
                const totalJobs = jobsData.length
                const activeJobs = jobsData.filter((job) => job.status === "active").length
                const totalApplicants = jobsData.reduce((sum, job) => sum + job.applicants, 0)

                setStats({
                    totalJobs,
                    activeJobs,
                    totalApplicants,
                    newApplicants: 3, // Giữ nguyên giá trị mock cho ứng viên mới
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

                    {jobs.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Bạn chưa đăng tin tuyển dụng nào</Text>
                            <Button mode="contained" onPress={() => navigation.navigate("PostJob")} style={styles.postButton}>
                                Đăng tin ngay
                            </Button>
                        </View>
                    ) : (
                        jobs.map((job) => (
                            <Card
                                key={job.id}
                                style={styles.jobCard}
                                onPress={() => navigation.navigate("JobDetail", { jobId: job.id })}
                            >
                                <Card.Content>
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
                                </Card.Content>
                            </Card>
                        ))
                    )}
                </View>
            </ScrollView>

            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => navigation.navigate("PostJob")}
            />
        </View>
    )
}

export default HomeScreen

import { useContext, useState } from "react"
import { FlatList, StyleSheet, View } from "react-native"
import { ActivityIndicator, Button, Text } from "react-native-paper"
import JobCard from "../../components/candidate/JobCard"
import { AuthContext } from "../../contexts/AuthContext"; // Thêm AuthContext để kiểm tra trạng thái đăng nhập
import { JobContext } from "../../contexts/JobContext"

const FavoriteScreen = ({ navigation }) => {
    const { state, removeFromFavorites } = useContext(JobContext)
    const { isLoggedIn } = useContext(AuthContext) // Kiểm tra xem user đã đăng nhập chưa
    const { favoriteJobs, loading } = state
    const [refreshing, setRefreshing] = useState(false)

    const handleRemoveFavorite = (jobId) => {
        removeFromFavorites(jobId)
    }

    const renderJobItem = ({ item }) => (
        <JobCard
            job={item}
            onPress={() => navigation.navigate("JobDetail", { jobId: item.id })}
            onFavorite={() => handleRemoveFavorite(item.id)}
        />
    )

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1E88E5" />
            </View>
        )
    }

    // Kiểm tra nếu chưa đăng nhập
    if (!isLoggedIn) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Bạn cần đăng nhập để sử dụng tính năng này</Text>
                <Button
                    mode="contained"
                    onPress={() => navigation.navigate("Login")}
                    style={styles.loginButton}
                >
                    Đăng nhập ngay
                </Button>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Công việc đã lưu</Text>
            </View>

            {favoriteJobs.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Bạn chưa lưu công việc nào</Text>
                    <Button
                        mode="contained"
                        onPress={() => navigation.navigate("HomeTab")}
                        style={styles.browseButton}
                    >
                        Tìm việc ngay
                    </Button>
                </View>
            ) : (
                <FlatList
                    data={favoriteJobs}
                    renderItem={renderJobItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.jobList}
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
        marginBottom: 20,
    },
    loginButton: {
        marginTop: 20,
        backgroundColor: "#1E88E5",
    },
    browseButton: {
        marginTop: 20,
    },
    jobList: {
        padding: 16,
    },
})

export default FavoriteScreen

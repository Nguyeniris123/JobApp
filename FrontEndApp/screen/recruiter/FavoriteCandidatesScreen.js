import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native"
import { ActivityIndicator, Avatar, Card, Chip, Divider, Searchbar, Text } from "react-native-paper"

// Dữ liệu mẫu cho ứng viên yêu thích
const mockFavoriteCandidates = [
    {
        id: "1",
        name: "Nguyễn Văn A",
        avatar: "https://via.placeholder.com/150",
        position: "Nhân viên bán hàng",
        skills: ["Giao tiếp", "Tiếng Anh", "Bán hàng"],
        experience: "1 năm kinh nghiệm",
        education: "Đại học Kinh tế Quốc dân",
        matchRate: 92,
        savedDate: new Date(2023, 3, 15),
    },
    {
        id: "2",
        name: "Trần Thị B",
        avatar: "https://via.placeholder.com/150",
        position: "Nhân viên marketing",
        skills: ["Tiếng Anh", "Content Marketing", "Social Media"],
        experience: "2 năm kinh nghiệm",
        education: "Đại học Ngoại thương",
        matchRate: 88,
        savedDate: new Date(2023, 3, 16),
    },
    {
        id: "3",
        name: "Lê Văn C",
        avatar: "https://via.placeholder.com/150",
        position: "Lập trình viên",
        skills: ["JavaScript", "React Native", "Node.js"],
        experience: "3 năm kinh nghiệm",
        education: "Đại học Bách khoa Hà Nội",
        matchRate: 95,
        savedDate: new Date(2023, 3, 17),
    },
    {
        id: "4",
        name: "Phạm Thị D",
        avatar: "https://via.placeholder.com/150",
        position: "Kế toán",
        skills: ["Excel", "Kế toán tổng hợp", "Tiếng Anh"],
        experience: "2 năm kinh nghiệm",
        education: "Đại học Kinh tế Quốc dân",
        matchRate: 85,
        savedDate: new Date(2023, 3, 18),
    },
]

const FavoriteCandidatesScreen = ({ navigation }) => {
    const [candidates, setCandidates] = useState([])
    const [filteredCandidates, setFilteredCandidates] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        // Giả lập API call
        const fetchFavoriteCandidates = async () => {
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000))
                setCandidates(mockFavoriteCandidates)
                setFilteredCandidates(mockFavoriteCandidates)
            } catch (error) {
                console.log("Error fetching favorite candidates:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchFavoriteCandidates()

    }, [])

    const onChangeSearch = (query) => {
        setSearchQuery(query)

        if (query.trim() === "") {
            setFilteredCandidates(candidates)
        } else {
            const filtered = candidates.filter(
                (candidate) =>
                    candidate.name.toLowerCase().includes(query.toLowerCase()) ||
                    candidate.position.toLowerCase().includes(query.toLowerCase()) ||
                    candidate.skills.some((skill) => skill.toLowerCase().includes(query.toLowerCase())),
            )
            setFilteredCandidates(filtered)
        }
    }

    const handleRemoveFavorite = (candidateId) => {
        // Giả lập API call
        setTimeout(() => {
            const updatedCandidates = candidates.filter((candidate) => candidate.id !== candidateId)
            setCandidates(updatedCandidates)
            setFilteredCandidates(filteredCandidates.filter((candidate) => candidate.id !== candidateId))

            // Theo dõi sự kiện xóa ứng viên yêu thích
            analyticsService.trackEvent("remove_favorite_candidate", {
                candidate_id: candidateId,
            })
        }, 500)
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const renderCandidateItem = ({ item }) => (
        <Card style={styles.candidateCard}>
            <Card.Content>
                <View style={styles.candidateHeader}>
                    <TouchableOpacity
                        style={styles.candidateInfo}
                        onPress={() => navigation.navigate("CandidateDetail", { candidateId: item.id })}
                    >
                        <Avatar.Image source={{ uri: item.avatar }} size={60} />
                        <View style={styles.candidateDetails}>
                            <Text style={styles.candidateName}>{item.name}</Text>
                            <Text style={styles.candidatePosition}>{item.position}</Text>
                            <View style={styles.matchContainer}>
                                <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
                                <Text style={styles.matchText}>{item.matchRate}% phù hợp</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemoveFavorite(item.id)}>
                        <MaterialCommunityIcons name="heart" size={24} color="#F44336" />
                    </TouchableOpacity>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.candidateContent}>
                    <View style={styles.contentItem}>
                        <MaterialCommunityIcons name="school" size={16} color="#757575" />
                        <Text style={styles.contentText}>{item.education}</Text>
                    </View>

                    <View style={styles.contentItem}>
                        <MaterialCommunityIcons name="briefcase" size={16} color="#757575" />
                        <Text style={styles.contentText}>{item.experience}</Text>
                    </View>

                    <View style={styles.contentItem}>
                        <MaterialCommunityIcons name="calendar" size={16} color="#757575" />
                        <Text style={styles.contentText}>Đã lưu: {formatDate(item.savedDate)}</Text>
                    </View>

                    <View style={styles.skillsContainer}>
                        {item.skills.map((skill, index) => (
                            <Chip key={index} style={styles.skillChip}>
                                {skill}
                            </Chip>
                        ))}
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate("Chat", { candidateId: item.id })}
                    >
                        <MaterialCommunityIcons name="message-text" size={20} color="#1E88E5" />
                        <Text style={styles.actionText}>Nhắn tin</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            // Theo dõi sự kiện mời phỏng vấn
                            analyticsService.trackEvent("invite_interview", {
                                candidate_id: item.id,
                                candidate_name: item.name,
                            })

                            navigation.navigate("InterviewSchedule", { candidateId: item.id })
                        }}
                    >
                        <MaterialCommunityIcons name="calendar-clock" size={20} color="#1E88E5" />
                        <Text style={styles.actionText}>Mời phỏng vấn</Text>
                    </TouchableOpacity>
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
            <View style={styles.header}>
                <Text style={styles.title}>Ứng viên yêu thích</Text>
            </View>

            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder="Tìm kiếm ứng viên..."
                    onChangeText={onChangeSearch}
                    value={searchQuery}
                    style={styles.searchBar}
                />
            </View>

            {filteredCandidates.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="heart-off" size={64} color="#BDBDBD" />
                    <Text style={styles.emptyText}>Bạn chưa có ứng viên yêu thích nào</Text>
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
    searchContainer: {
        padding: 16,
    },
    searchBar: {
        elevation: 2,
        borderRadius: 8,
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
        marginTop: 16,
    },
    candidateList: {
        padding: 16,
    },
    candidateCard: {
        marginBottom: 16,
        borderRadius: 8,
        elevation: 2,
    },
    candidateHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    candidateInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    candidateDetails: {
        marginLeft: 12,
        flex: 1,
    },
    candidateName: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 4,
    },
    candidatePosition: {
        fontSize: 14,
        color: "#757575",
        marginBottom: 4,
    },
    matchContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    matchText: {
        fontSize: 14,
        color: "#4CAF50",
        marginLeft: 4,
        fontWeight: "bold",
    },
    divider: {
        marginVertical: 12,
    },
    candidateContent: {
        marginBottom: 12,
    },
    contentItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    contentText: {
        fontSize: 14,
        color: "#212121",
        marginLeft: 8,
    },
    skillsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 8,
    },
    skillChip: {
        margin: 4,
        backgroundColor: "#E3F2FD",
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 8,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
    },
    actionText: {
        marginLeft: 4,
        color: "#1E88E5",
        fontWeight: "500",
    },
})

export default FavoriteCandidatesScreen


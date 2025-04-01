import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { FlatList, ScrollView, StyleSheet, View } from "react-native"
import { ActivityIndicator, Avatar, Button, Card, Chip, Divider, Menu, Searchbar, Text } from "react-native-paper"

// Mock data for candidates
const mockCandidates = [
    {
        id: "1",
        name: "Nguyễn Văn A",
        avatar: "https://via.placeholder.com/150",
        appliedDate: new Date(2023, 3, 16),
        status: "pending",
        matchRate: 85,
        skills: ["Giao tiếp", "Tiếng Anh", "Microsoft Office"],
        experience: "1 năm kinh nghiệm",
        education: "Đại học Quốc gia Hà Nội",
        jobTitle: "Nhân viên bán hàng bán thời gian",
    },
    {
        id: "2",
        name: "Trần Thị B",
        avatar: "https://via.placeholder.com/150",
        appliedDate: new Date(2023, 3, 17),
        status: "reviewing",
        matchRate: 92,
        skills: ["Giao tiếp", "Tiếng Anh", "Kỹ năng bán hàng"],
        experience: "2 năm kinh nghiệm",
        education: "Đại học Ngoại thương",
        jobTitle: "Nhân viên bán hàng bán thời gian",
    },
    {
        id: "3",
        name: "Lê Văn C",
        avatar: "https://via.placeholder.com/150",
        appliedDate: new Date(2023, 3, 18),
        status: "accepted",
        matchRate: 78,
        skills: ["Giao tiếp", "Tiếng Anh", "Kỹ năng thuyết trình"],
        experience: "Chưa có kinh nghiệm",
        education: "Đại học Bách khoa Hà Nội",
        jobTitle: "Nhân viên bán hàng bán thời gian",
    },
    {
        id: "4",
        name: "Phạm Thị D",
        avatar: "https://via.placeholder.com/150",
        appliedDate: new Date(2023, 3, 19),
        status: "rejected",
        matchRate: 65,
        skills: ["Giao tiếp", "Microsoft Office"],
        experience: "Chưa có kinh nghiệm",
        education: "Đại học Thương mại",
        jobTitle: "Nhân viên bán hàng bán thời gian",
    },
    {
        id: "5",
        name: "Hoàng Văn E",
        avatar: "https://via.placeholder.com/150",
        appliedDate: new Date(2023, 3, 20),
        status: "pending",
        matchRate: 88,
        skills: ["Giao tiếp", "Tiếng Anh", "Kỹ năng bán hàng", "Tiếng Trung"],
        experience: "1 năm kinh nghiệm",
        education: "Đại học Hà Nội",
        jobTitle: "Nhân viên bán hàng bán thời gian",
    },
]

const CandidateListScreen = ({ route, navigation }) => {
    const { jobId } = route.params || {}
    const [candidates, setCandidates] = useState([])
    const [filteredCandidates, setFilteredCandidates] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [menuVisible, setMenuVisible] = useState(false)
    const [selectedCandidate, setSelectedCandidate] = useState(null)

    useEffect(() => {
        // Simulate API call
        const fetchCandidates = async () => {
            try {
                await new Promise((resolve) => setTimeout(resolve, 1000))
                setCandidates(mockCandidates)
                setFilteredCandidates(mockCandidates)
            } catch (error) {
                console.log("Error fetching candidates:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchCandidates()
    }, [jobId])

    const onChangeSearch = (query) => {
        setSearchQuery(query)
        filterCandidates(query, statusFilter)
    }

    const filterCandidates = (query, status) => {
        let filtered = candidates

        // Apply search query filter
        if (query) {
            filtered = filtered.filter((candidate) => candidate.name.toLowerCase().includes(query.toLowerCase()))
        }

        // Apply status filter
        if (status !== "all") {
            filtered = filtered.filter((candidate) => candidate.status === status)
        }

        setFilteredCandidates(filtered)
    }

    const handleStatusFilter = (status) => {
        setStatusFilter(status)
        filterCandidates(searchQuery, status)
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

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

    const handleCandidatePress = (candidate) => {
        navigation.navigate("CandidateDetail", { candidateId: candidate.id })
    }

    const handleCandidateAction = (candidate, action) => {
        setSelectedCandidate(candidate)
        setMenuVisible(true)
    }

    const handleAcceptCandidate = (candidate) => {
        // Simulate API call
        setTimeout(() => {
            const updatedCandidates = candidates.map((c) => {
                if (c.id === candidate.id) {
                    return { ...c, status: "accepted" }
                }
                return c
            })
            setCandidates(updatedCandidates)
            filterCandidates(searchQuery, statusFilter)
            setMenuVisible(false)
        }, 500)
    }

    const handleRejectCandidate = (candidate) => {
        // Simulate API call
        setTimeout(() => {
            const updatedCandidates = candidates.map((c) => {
                if (c.id === candidate.id) {
                    return { ...c, status: "rejected" }
                }
                return c
            })
            setCandidates(updatedCandidates)
            filterCandidates(searchQuery, statusFilter)
            setMenuVisible(false)
        }, 500)
    }

    const renderCandidateItem = ({ item }) => (
        <Card style={styles.candidateCard} onPress={() => handleCandidatePress(item)}>
            <Card.Content>
                <View style={styles.candidateHeader}>
                    <View style={styles.candidateInfo}>
                        <Avatar.Image source={{ uri: item.avatar }} size={60} />
                        <View style={styles.candidateDetails}>
                            <Text style={styles.candidateName}>{item.name}</Text>
                            <Text style={styles.candidateJob}>{item.jobTitle}</Text>
                            <Chip
                                style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + "20" }]}
                                textStyle={{ color: getStatusColor(item.status) }}
                            >
                                {getStatusText(item.status)}
                            </Chip>
                        </View>
                    </View>
                    <View style={styles.matchRate}>
                        <Text style={styles.matchRateValue}>{item.matchRate}%</Text>
                        <Text style={styles.matchRateLabel}>Phù hợp</Text>
                    </View>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.candidateContent}>
                    <View style={styles.candidateContentItem}>
                        <MaterialCommunityIcons name="calendar" size={16} color="#757575" />
                        <Text style={styles.candidateContentText}>Ứng tuyển: {formatDate(item.appliedDate)}</Text>
                    </View>

                    <View style={styles.candidateContentItem}>
                        <MaterialCommunityIcons name="school" size={16} color="#757575" />
                        <Text style={styles.candidateContentText}>{item.education}</Text>
                    </View>

                    <View style={styles.candidateContentItem}>
                        <MaterialCommunityIcons name="briefcase" size={16} color="#757575" />
                        <Text style={styles.candidateContentText}>{item.experience}</Text>
                    </View>

                    <View style={styles.skillsContainer}>
                        {item.skills.map((skill, index) => (
                            <Chip key={index} style={styles.skillChip} textStyle={styles.skillText}>
                                {skill}
                            </Chip>
                        ))}
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    {item.status === "pending" || item.status === "reviewing" ? (
                        <>
                            <Button
                                mode="outlined"
                                onPress={() => handleRejectCandidate(item)}
                                style={styles.rejectButton}
                                labelStyle={styles.rejectButtonLabel}
                            >
                                Từ chối
                            </Button>
                            <Button mode="contained" onPress={() => handleAcceptCandidate(item)} style={styles.acceptButton}>
                                Chấp nhận
                            </Button>
                        </>
                    ) : (
                        <Button
                            mode="outlined"
                            icon="message-text"
                            onPress={() => navigation.navigate("Chat")}
                            style={styles.chatButton}
                        >
                            Nhắn tin
                        </Button>
                    )}
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
                <Text style={styles.title}>Danh sách ứng viên</Text>
                <Text style={styles.subtitle}>{jobId ? "Vị trí: Nhân viên bán hàng bán thời gian" : "Tất cả ứng viên"}</Text>
            </View>

            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder="Tìm kiếm ứng viên..."
                    onChangeText={onChangeSearch}
                    value={searchQuery}
                    style={styles.searchBar}
                />
            </View>

            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Chip selected={statusFilter === "all"} onPress={() => handleStatusFilter("all")} style={styles.filterChip}>
                        Tất cả
                    </Chip>
                    <Chip
                        selected={statusFilter === "pending"}
                        onPress={() => handleStatusFilter("pending")}
                        style={styles.filterChip}
                    >
                        Đang chờ
                    </Chip>
                    <Chip
                        selected={statusFilter === "reviewing"}
                        onPress={() => handleStatusFilter("reviewing")}
                        style={styles.filterChip}
                    >
                        Đang xem xét
                    </Chip>
                    <Chip
                        selected={statusFilter === "accepted"}
                        onPress={() => handleStatusFilter("accepted")}
                        style={styles.filterChip}
                    >
                        Đã chấp nhận
                    </Chip>
                    <Chip
                        selected={statusFilter === "rejected"}
                        onPress={() => handleStatusFilter("rejected")}
                        style={styles.filterChip}
                    >
                        Đã từ chối
                    </Chip>
                </ScrollView>
            </View>

            {filteredCandidates.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Không tìm thấy ứng viên nào</Text>
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

            <Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)} anchor={{ x: 0, y: 0 }}>
                <Menu.Item
                    onPress={() => handleCandidatePress(selectedCandidate)}
                    title="Xem chi tiết"
                    icon="account-details"
                />
                <Menu.Item onPress={() => navigation.navigate("Chat")} title="Nhắn tin" icon="message-text" />
                <Divider />
                <Menu.Item onPress={() => handleAcceptCandidate(selectedCandidate)} title="Chấp nhận" icon="check-circle" />
                <Menu.Item onPress={() => handleRejectCandidate(selectedCandidate)} title="Từ chối" icon="close-circle" />
            </Menu>
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
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: "#FFFFFF",
        opacity: 0.8,
    },
    searchContainer: {
        padding: 16,
        paddingBottom: 8,
    },
    searchBar: {
        elevation: 2,
        borderRadius: 8,
    },
    filterContainer: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    filterChip: {
        marginRight: 8,
        marginBottom: 8,
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
    candidateList: {
        padding: 16,
        paddingTop: 8,
    },
    candidateCard: {
        marginBottom: 16,
        borderRadius: 8,
        elevation: 2,
    },
    candidateHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
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
    candidateJob: {
        fontSize: 14,
        color: "#757575",
        marginBottom: 8,
    },
    statusChip: {
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
    divider: {
        marginVertical: 12,
    },
    candidateContent: {
        marginBottom: 12,
    },
    candidateContentItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    candidateContentText: {
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
    skillText: {
        fontSize: 12,
        color: "#1E88E5",
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    rejectButton: {
        flex: 1,
        marginRight: 8,
        borderColor: "#F44336",
    },
    rejectButtonLabel: {
        color: "#F44336",
    },
    acceptButton: {
        flex: 1,
        backgroundColor: "#4CAF50",
    },
    chatButton: {
        flex: 1,
    },
})

export default CandidateListScreen


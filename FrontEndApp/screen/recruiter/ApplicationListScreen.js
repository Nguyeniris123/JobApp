import { MaterialCommunityIcons } from "@expo/vector-icons"
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useState } from "react"
import { FlatList, ScrollView, StyleSheet, View } from "react-native"
import { ActivityIndicator, Avatar, Button, Card, Chip, Divider, Menu, Searchbar, Text } from "react-native-paper"

const ApplicationListScreen = ({ route, navigation }) => {
    const { jobId } = route.params || {}
    const [candidates, setCandidates] = useState([])
    const [filteredCandidates, setFilteredCandidates] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [menuVisible, setMenuVisible] = useState(false)
    const [selectedCandidate, setSelectedCandidate] = useState(null)

    const getAccessToken = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken')
            return token
        } catch (error) {
            console.error('Error getting access token:', error)
            return null
        }
    }

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const token = await getAccessToken()
                if (!token) {
                    throw new Error('No access token found')
                }

                const response = await fetch('http://192.168.1.5:8000/applications/recruiter/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                })
                console.log("Response:", response.json())
                if (!response.ok) {
                    throw new Error('Network response was not ok')
                }

                const data = await response.json()
                setCandidates(data)
                setFilteredCandidates(data)
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

        if (query) {
            filtered = filtered.filter((candidate) => candidate.applicant.username.toLowerCase().includes(query.toLowerCase()))
        }

        if (status !== "all") {
            filtered = filtered.filter((candidate) => candidate.status === status)
        }

        setFilteredCandidates(filtered)
    }

    const handleStatusFilter = (status) => {
        setStatusFilter(status)
        filterCandidates(searchQuery, status)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "Đang xem xét":
                return "#2196F3"
            case "Đã phỏng vấn":
                return "#4CAF50"
            case "Từ chối":
                return "#F44336"
            default:
                return "#9E9E9E"
        }
    }

    const handleCandidatePress = (candidate) => {
        navigation.navigate("CandidateDetail", { candidateId: candidate.id })
    }

    const handleCandidateAction = (candidate, action) => {
        setSelectedCandidate(candidate)
        setMenuVisible(true)
    }

    const handleAcceptCandidate = async (candidate) => {
        try {
            const token = await getAccessToken()
            if (!token) {
                throw new Error('No access token found')
            }
            console.log(`Accepting candidate: http://192.168.1.5:8000/applications/${candidate.job_detail.id}/accept/`)

            const response = await fetch(`http://192.168.1.5:8000/applications/${candidate.job_detail.id}/accept/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to accept candidate')
            }

            const updatedCandidates = candidates.map((c) => {
                if (c.id === candidate.id) {
                    return { ...c, status: "Đã phỏng vấn" }
                }
                return c
            })
            setCandidates(updatedCandidates)
            filterCandidates(searchQuery, statusFilter)
            setMenuVisible(false)
        } catch (error) {
            console.error('Error accepting candidate:', error)
        }
    }

    const handleRejectCandidate = async (candidate) => {
        try {
            const token = await getAccessToken()
            if (!token) {
                throw new Error('No access token found')
            }

            const response = await fetch(`http://192.168.1.5:8000/applications/${candidate.job_detail.id}/reject/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error('Failed to reject candidate')
            }

            const updatedCandidates = candidates.map((c) => {
                if (c.id === candidate.id) {
                    return { ...c, status: "Từ chối" }
                }
                return c
            })
            setCandidates(updatedCandidates)
            filterCandidates(searchQuery, statusFilter)
            setMenuVisible(false)
        } catch (error) {
            console.error('Error rejecting candidate:', error)
        }
    }

    const renderCandidateItem = ({ item }) => (
        <Card style={styles.candidateCard} mode="elevated">
            <Card.Content>
                <View style={styles.candidateHeader}>
                    <View style={styles.candidateInfo}>
                        <Avatar.Image 
                            source={{ uri: item.applicant.avatar }} 
                            size={70} 
                            style={styles.avatar}
                        />
                        <View style={styles.candidateDetails}>
                            <Text style={styles.candidateName}>{item.applicant.username}</Text>
                            <Text style={styles.candidateJob} numberOfLines={2}>
                                {item.job_detail.title}
                            </Text>
                            <Chip
                                style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + "15" }]}
                                textStyle={[styles.statusText, { color: getStatusColor(item.status) }]}
                            >
                                {item.status}
                            </Chip>
                        </View>
                    </View>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.candidateContent}>
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="briefcase" size={20} color="#666" />
                        <Text style={styles.infoText}>{item.job_detail.specialized}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
                        <Text style={styles.infoText}>{item.job_detail.location}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="currency-usd" size={20} color="#666" />
                        <Text style={styles.infoText}>
                            {parseFloat(item.job_detail.salary).toLocaleString('vi-VN')} VNĐ
                        </Text>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    {item.status === "Đang xem xét" ? (
                        <>
                            <Button
                                mode="outlined"
                                onPress={() => handleRejectCandidate(item)}
                                style={styles.rejectButton}
                                labelStyle={styles.rejectButtonLabel}
                                contentStyle={styles.buttonContent}
                            >
                                Từ chối
                            </Button>
                            <Button 
                                mode="contained" 
                                onPress={() => handleAcceptCandidate(item)} 
                                style={styles.acceptButton}
                                contentStyle={styles.buttonContent}
                            >
                                Chấp nhận
                            </Button>
                        </>
                    ) : (
                        <Button
                            mode="outlined"
                            icon="message-text"
                            onPress={() => navigation.navigate("Chat")}
                            style={styles.chatButton}
                            contentStyle={styles.buttonContent}
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
            <LinearGradient
                colors={['#1976D2', '#1E88E5', '#2196F3']}
                style={styles.header}
            >
                <Text style={styles.title}>Danh sách ứng viên</Text>
                <Text style={styles.subtitle}>
                    {jobId ? "Vị trí: Nhân viên bán hàng bán thời gian" : "Tất cả ứng viên"}
                </Text>
            </LinearGradient>

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
                        selected={statusFilter === "Đang xem xét"}
                        onPress={() => handleStatusFilter("Đang xem xét")}
                        style={styles.filterChip}
                    >
                        Đang xem xét
                    </Chip>
                    <Chip
                        selected={statusFilter === "Đã phỏng vấn"}
                        onPress={() => handleStatusFilter("Đã phỏng vấn")}
                        style={styles.filterChip}
                    >
                        Đã phỏng vấn
                    </Chip>
                    <Chip
                        selected={statusFilter === "Từ chối"}
                        onPress={() => handleStatusFilter("Từ chối")}
                        style={styles.filterChip}
                    >
                        Từ chối
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
        paddingTop: 50,
        paddingBottom: 25,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#FFFFFF",
        opacity: 0.9,
    },
    searchContainer: {
        padding: 16,
        paddingBottom: 8,
    },
    searchBar: {
        marginHorizontal: 16,
        marginVertical: 12,
        elevation: 2,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
    },
    filterContainer: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    filterChip: {
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
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
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        elevation: 4,
        backgroundColor: '#FFFFFF',
    },
    candidateHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    candidateInfo: {
        flexDirection: "row",
        alignItems: "flex-start",
        flex: 1,
    },
    avatar: {
        borderWidth: 3,
        borderColor: '#FFFFFF',
        elevation: 4,
    },
    candidateDetails: {
        marginLeft: 15,
        flex: 1,
    },
    candidateName: {
        fontSize: 20,
        fontWeight: "700",
        color: '#1F2937',
        marginBottom: 4,
    },
    candidateJob: {
        fontSize: 15,
        color: '#4B5563',
        marginBottom: 10,
        lineHeight: 20,
    },
    statusChip: {
        alignSelf: "flex-start",
        height: 28,
        borderRadius: 14,
    },
    statusText: {
        fontWeight: "600",
        fontSize: 13,
    },
    divider: {
        marginVertical: 15,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    candidateContent: {
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    infoText: {
        fontSize: 15,
        color: '#374151',
        marginLeft: 12,
        flex: 1,
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    buttonContent: {
        paddingVertical: 8,
    },
    rejectButton: {
        flex: 1,
        marginRight: 12,
        borderColor: "#DC2626",
        borderWidth: 1.5,
    },
    rejectButtonLabel: {
        color: "#DC2626",
        fontSize: 15,
        fontWeight: "600",
    },
    acceptButton: {
        flex: 1,
        backgroundColor: "#059669",
    },
    chatButton: {
        flex: 1,
        borderColor: "#2563EB",
        borderWidth: 1.5,
    },
})

export default ApplicationListScreen


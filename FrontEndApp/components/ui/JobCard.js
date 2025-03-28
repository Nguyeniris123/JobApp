import { MaterialCommunityIcons } from "@expo/vector-icons"
import { Image, StyleSheet, View } from "react-native"
import { Card, IconButton, Paragraph, Text, Title } from "react-native-paper"

const JobCard = ({ job, onPress, onFavorite }) => {
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

    return (
        <Card style={styles.card} onPress={onPress}>
            <Card.Content style={styles.cardContent}>
                <Image source={{ uri: job.companyLogo }} style={styles.logo} />
                <View style={styles.infoContainer}>
                    <Title style={styles.title}>{job.title}</Title>
                    <Paragraph style={styles.company}>{job.company}</Paragraph>

                    <View style={styles.detailsContainer}>
                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons name="map-marker" size={16} color="#757575" />
                            <Text style={styles.detailText}>{job.location}</Text>
                        </View>

                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons name="currency-usd" size={16} color="#757575" />
                            <Text style={styles.detailText}>{formatSalary(job.salary)}</Text>
                        </View>

                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons name="clock-outline" size={16} color="#757575" />
                            <Text style={styles.detailText}>{job.hours}</Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.tagContainer}>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>{job.category}</Text>
                            </View>
                            <View style={styles.tag}>
                                <Text style={styles.tagText}>{job.type}</Text>
                            </View>
                        </View>

                        <Text style={styles.date}>{formatDate(job.postedDate)}</Text>
                    </View>
                </View>
            </Card.Content>

            {onFavorite && (
                <IconButton
                    icon="heart-outline"
                    color="#FF5252"
                    size={24}
                    style={styles.favoriteButton}
                    onPress={() => onFavorite(job.id)}
                />
            )}
        </Card>
    )
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 8,
        elevation: 2,
    },
    cardContent: {
        flexDirection: "row",
        padding: 16,
    },
    logo: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 16,
    },
    infoContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
    },
    company: {
        fontSize: 14,
        color: "#757575",
        marginBottom: 8,
    },
    detailsContainer: {
        marginBottom: 8,
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    detailText: {
        fontSize: 14,
        color: "#757575",
        marginLeft: 4,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    tagContainer: {
        flexDirection: "row",
    },
    tag: {
        backgroundColor: "#E3F2FD",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 8,
    },
    tagText: {
        fontSize: 12,
        color: "#1E88E5",
    },
    date: {
        fontSize: 12,
        color: "#9E9E9E",
    },
    favoriteButton: {
        position: "absolute",
        top: 10,
        right: 10,
    },
})

export default JobCard


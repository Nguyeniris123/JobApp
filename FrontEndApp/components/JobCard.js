import { MaterialCommunityIcons } from "@expo/vector-icons"
import { View } from "react-native"
import { Card, Chip, Text } from "react-native-paper"

const JobCard = ({ job, onPress, style }) => {
    const formatSalary = (salary) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(salary)
    }

    return (
        <Card style={[styles.jobCard, style]} onPress={onPress}>
            <Card.Content>
                <View style={styles.jobHeader}>
                    <Text style={styles.jobTitle} numberOfLines={2}>
                        {job.title}
                    </Text>
                    <Chip 
                        style={styles.statusChip} 
                        textStyle={{ fontSize: 12 }}
                        mode="outlined"
                    >
                        {job.status === "active" ? "Đang tuyển" : "Đã đóng"}
                    </Chip>
                </View>

                <View style={styles.jobDetails}>
                    <View style={styles.jobDetail}>
                        <MaterialCommunityIcons name="currency-usd" size={16} color="#757575" />
                        <Text style={styles.jobDetailText}>
                            {formatSalary(job.salary)}
                        </Text>
                    </View>
                    <View style={styles.jobDetail}>
                        <MaterialCommunityIcons name="map-marker" size={16} color="#757575" />
                        <Text style={styles.jobDetailText}>{job.location}</Text>
                    </View>
                </View>

                <View style={styles.jobStats}>
                    <View style={styles.jobStat}>
                        <MaterialCommunityIcons name="eye" size={16} color="#1E88E5" />
                        <Text style={styles.jobStatText}>{job.views} lượt xem</Text>
                    </View>
                    <View style={styles.jobStat}>
                        <MaterialCommunityIcons name="account" size={16} color="#1E88E5" />
                        <Text style={styles.jobStatText}>{job.applicants} ứng viên</Text>
                    </View>
                </View>
            </Card.Content>
        </Card>
    )
}

const styles = {
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
        height: 24,
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
}

export default JobCard
